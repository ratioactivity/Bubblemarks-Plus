window.addEventListener("DOMContentLoaded", () => {
  const SILENT_HYDROPHONE_PRIMER =
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=";

  class MusicController {
    constructor() {
      this.audio = new Audio();
      this.audio.preload = "metadata";
      this.audio.crossOrigin = "anonymous";
      this.mode = "idle";
      this.currentSource = null;
      this.currentMetadata = null;
      this.onTrackEnd = null;
      this.hydrophoneRetryTimer = null;
      this.hydrophoneRetryCount = 0;
      this.maxHydrophoneRetries = 3;
      this.hydrophoneAutoplayPrimed = false;

      this.audio.addEventListener("ended", () => {
        if (typeof this.onTrackEnd === "function") {
          this.onTrackEnd();
        }
      });

      this.audio.addEventListener("error", (event) => {
        this.handlePlaybackIssue("error", event);
      });

      this.audio.addEventListener("stalled", (event) => {
        this.handlePlaybackIssue("stalled", event);
      });

      this.audio.addEventListener("canplay", () => {
        this.handleHydrophoneRecovery();
      });
    }

    describeAudioError(error, fallback = "Stream error") {
      if (!error) {
        return fallback;
      }

      const code = Number(error?.code);

      switch (code) {
        case 1:
          return "Stream aborted";
        case 2:
          return "Network error";
        case 3:
          return "Decode error";
        case 4:
          return "Stream not supported";
        default:
          return fallback;
      }
    }

    dispatchStatus(type, detail = {}) {
      window.dispatchEvent(new CustomEvent("musiccontroller", { detail: { type, ...detail } }));
    }

    async primeHydrophoneAutoplay() {
      if (this.hydrophoneAutoplayPrimed) {
        return true;
      }

      const primer = new Audio(SILENT_HYDROPHONE_PRIMER);
      primer.muted = true;
      primer.preload = "auto";
      primer.crossOrigin = "anonymous";

      try {
        await primer.play();
        primer.pause();
        this.hydrophoneAutoplayPrimed = true;
        return true;
      } catch (error) {
        console.warn("[Bubblemarks] Hydrophone autoplay primer failed", error);
        this.hydrophoneAutoplayPrimed = false;
        return false;
      }
    }

    handleHydrophoneRecovery() {
      if (this.mode !== "hydrophone") {
        return;
      }

      if (this.hydrophoneRetryTimer) {
        clearTimeout(this.hydrophoneRetryTimer);
      }
      this.hydrophoneRetryTimer = null;
      this.hydrophoneRetryCount = 0;

      this.dispatchStatus("hydrophone-recovered", {
        source: this.currentSource,
        metadata: this.currentMetadata,
        mode: this.mode,
      });
    }

    handlePlaybackIssue(reason, event) {
      const error = event?.error || this.audio?.error || null;
      const reasonLabel = this.describeAudioError(error, reason);
      this.dispatchStatus("playback-error", {
        reason: reasonLabel,
        mode: this.mode,
        source: this.currentSource,
        metadata: this.currentMetadata,
        error,
      });

      if (this.mode === "hydrophone" && this.currentSource) {
        this.scheduleHydrophoneRetry(reasonLabel);
      }
    }

    scheduleHydrophoneRetry(reason = "error") {
      if (this.hydrophoneRetryTimer) {
        clearTimeout(this.hydrophoneRetryTimer);
      }

      const source = this.currentSource;
      const metadata = this.currentMetadata;
      const nextAttempt = this.hydrophoneRetryCount + 1;

      if (nextAttempt > this.maxHydrophoneRetries) {
        this.dispatchStatus("hydrophone-failed", {
          reason,
          attempt: this.hydrophoneRetryCount,
          source,
          metadata,
          mode: this.mode,
        });
        this.stop();
        return;
      }

      this.hydrophoneRetryCount = nextAttempt;
      const delay = Math.min(5000, 1000 * nextAttempt);

      this.dispatchStatus("hydrophone-retry", {
        reason,
        attempt: this.hydrophoneRetryCount,
        delay,
        source,
        metadata,
        mode: this.mode,
      });

      this.hydrophoneRetryTimer = setTimeout(() => {
        if (this.mode !== "hydrophone" || !source) {
          return;
        }
        this.playHydrophone(source, metadata);
      }, delay);
    }

    setMode(mode) {
      this.mode = typeof mode === "string" && mode.trim() ? mode : "idle";

      if (this.mode !== "hydrophone" && this.hydrophoneRetryTimer) {
        clearTimeout(this.hydrophoneRetryTimer);
        this.hydrophoneRetryTimer = null;
        this.hydrophoneRetryCount = 0;
      }
    }

    playSource(source, { loop = false, mode = null, metadata = null } = {}) {
      if (!source) {
        return false;
      }

      this.audio.loop = loop === true;
      this.currentSource = source;
      this.currentMetadata = metadata;

      if (mode) {
        this.setMode(mode);
      }

      this.audio.src = source;

      try {
        this.audio.load();
      } catch (error) {
        console.warn("[Bubblemarks] Unable to refresh audio source", error);
      }

      const playPromise = this.audio.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch((error) => {
          const reason = error?.message || "Playback blocked";
          this.handlePlaybackIssue(reason, { error });
        });
      }

      return true;
    }

    playDisc(source, options = {}) {
      return this.playSource(source, { ...options, mode: "disc" });
    }

    shuffleDiscs(discs = [], { currentId = null, autoPlay = true } = {}) {
      const normalized = discs
        .map((entry) => {
          if (typeof entry === "string") {
            return { id: entry, source: entry };
          }
          if (entry && typeof entry === "object" && entry.source) {
            const id = entry.id || entry.name || entry.title || entry.source;
            return { ...entry, id };
          }
          return null;
        })
        .filter(Boolean);

      if (normalized.length === 0) {
        return null;
      }

      const filtered = normalized.filter(
        (item) => item.id !== currentId && item.source !== this.currentSource
      );
      const pool = filtered.length > 0 ? filtered : normalized;
      const next = pool[Math.floor(Math.random() * pool.length)];

      if (next?.source && autoPlay) {
        this.playDisc(next.source, { loop: false, metadata: next });
      }

      return next || null;
    }

    startSpotify(streamUrl) {
      return this.playSource(streamUrl, { loop: false, mode: "spotify" });
    }

    controlSpotify(action = "toggle") {
      const normalized = typeof action === "string" ? action.toLowerCase() : "toggle";

      if (normalized === "pause") {
        this.audio.pause();
        return true;
      }

      if (normalized === "play") {
        const playPromise = this.audio.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
        return true;
      }

      if (normalized === "toggle") {
        return this.audio.paused ? this.controlSpotify("play") : this.controlSpotify("pause");
      }

      return false;
    }

    playHydrophone(source, metadata = null) {
      const normalizedMetadata =
        typeof metadata === "string"
          ? { cover: metadata }
          : metadata && typeof metadata === "object"
            ? metadata
            : null;

      this.hydrophoneRetryCount = 0;
      if (this.hydrophoneRetryTimer) {
        clearTimeout(this.hydrophoneRetryTimer);
        this.hydrophoneRetryTimer = null;
      }

      const attemptPlay = () =>
        this.playSource(source, {
          loop: false,
          mode: "hydrophone",
          metadata: normalizedMetadata,
        });

      const primer = this.primeHydrophoneAutoplay();
      if (primer && typeof primer.then === "function") {
        primer.catch(() => {}).finally(attemptPlay);
      } else {
        attemptPlay();
      }

      return true;
    }

    stop() {
      this.audio.pause();
      try {
        this.audio.currentTime = 0;
      } catch {
        // ignore audio reset errors
      }
      this.currentSource = null;
      this.currentMetadata = null;
      this.onTrackEnd = null;
      this.setMode("idle");
      return true;
    }
  }

  window.MusicController = MusicController;
  if (!window.musicController) {
    window.musicController = new MusicController();
  }

  console.log("✅ script validated");
});
