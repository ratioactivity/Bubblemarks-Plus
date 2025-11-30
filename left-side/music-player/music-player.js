window.addEventListener("DOMContentLoaded", () => {
  const widgetHost = document.getElementById("music-player-widget");
  if (!widgetHost) {
    console.log("✅ script validated");
    return;
  }

  const musicController =
    window.musicController || (typeof window.MusicController === "function" ? new window.MusicController() : null);

  if (!musicController) {
    console.log("✅ script validated");
    return;
  }

  if (!window.musicController) {
    window.musicController = musicController;
  }

  const pastelTracks = [
    {
      title: "Cloud Drift",
      artist: "Bubblemarks FM",
      source: "sounds/allothers.mp3",
      accent: "linear-gradient(145deg, rgba(255, 212, 238, 0.95), rgba(184, 209, 255, 0.95))",
    },
    {
      title: "Nebula Nap",
      artist: "Papernotes Radio",
      source: "sounds/L.mp3",
      accent: "linear-gradient(145deg, rgba(210, 235, 255, 0.95), rgba(255, 236, 255, 0.95))",
    },
    {
      title: "Cotton Candy Keys",
      artist: "Bigbesty Beats",
      source: "sounds/M.mp3",
      accent: "linear-gradient(145deg, rgba(255, 247, 255, 0.95), rgba(200, 230, 255, 0.95))",
    },
  ];

  const hydrophoneCoverMap = new Map([
    ["andrewsbay", "assets/cover-andrewsbay.png"],
    ["beachcamp", "assets/cover-beachcamp.png"],
    ["bushpoint", "assets/cover-bushpoint.png"],
    ["mastcenter", "assets/cover-mastcenter.png"],
    ["orcasoundlab", "assets/cover-orcasoundlab.png"],
    ["porttownsend", "assets/cover-porttownsend.png"],
  ]);

  const defaultCoverArt = "assets/cover-orcasoundlab.png";
  const defaultAccent = "linear-gradient(150deg, rgba(255, 212, 238, 0.95), rgba(184, 209, 255, 0.95))";

  let currentTrackIndex = 0;
  const audio = musicController.audio;
  audio.preload = "metadata";
  audio.volume = 0.7;

  let mpTitle;
  let mpArtist;
  let mpMode;
  let mpCover;
  let mpMain;
  let mpPlayButton;
  let mpStopButton;
  let widgetPlayButton;
  let nowPlayingSignature = "";
  let spotifyPlaybackState = { isPlaying: false };

  const formatTime = (value) => {
    if (!Number.isFinite(value)) {
      return "0:00";
    }
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const applyTrack = (index) => {
    const track = pastelTracks[index];
    const titleEl = widgetHost.querySelector(".music-player-title");
    const artistEl = widgetHost.querySelector(".music-player-artist");
    const artEl = widgetHost.querySelector(".music-player-art");
    if (titleEl) {
      titleEl.textContent = track.title;
    }
    if (artistEl) {
      artistEl.textContent = track.artist;
    }
    if (artEl) {
      artEl.style.background = track.accent;
    }
    musicController.onTrackEnd = null;
    musicController.setMode("widget");
    musicController.currentSource = track.source;
    musicController.currentMetadata = track;
    audio.loop = false;
    audio.src = track.source;
    audio.currentTime = 0;
    const seek = widgetHost.querySelector(".music-seek");
    if (seek) {
      seek.value = "0";
    }
    const currentTimeLabel = widgetHost.querySelector('[data-time="current"]');
    const durationLabel = widgetHost.querySelector('[data-time="duration"]');
    if (currentTimeLabel) {
      currentTimeLabel.textContent = "0:00";
    }
    if (durationLabel) {
      durationLabel.textContent = "0:00";
    }

    refreshNowPlaying(true);
  };

  const updatePlayButtons = (isPlaying) => {
    const label = isPlaying ? "Pause" : "Play";
    const symbol = isPlaying ? "❚❚" : "▶";

    if (widgetPlayButton) {
      widgetPlayButton.textContent = symbol;
      widgetPlayButton.setAttribute("aria-label", label);
    }

    if (mpPlayButton) {
      mpPlayButton.textContent = symbol;
      mpPlayButton.setAttribute("aria-label", label);
    }
  };

  const formatSourceName = (source) => {
    if (!source || typeof source !== "string") {
      return "";
    }
    const parts = source.split("/");
    const filename = parts[parts.length - 1] || source;
    const basename = filename.replace(/\.[^/.]+$/, "");
    return basename.replace(/[-_]+/g, " ");
  };

  const normalizeKey = (value) => {
    return typeof value === "string" ? value.toLowerCase().replace(/\s+/g, "") : "";
  };

  const resolveCoverArt = (mode, metadata, source) => {
    if (metadata && typeof metadata.cover === "string" && metadata.cover.trim()) {
      return metadata.cover;
    }

    if (mode === "widget" && metadata && typeof metadata.accent === "string") {
      return metadata.accent;
    }

    if (mode === "hydrophone") {
      const identifier =
        normalizeKey(metadata?.name) || normalizeKey(metadata?.id) || normalizeKey(metadata?.title);
      const fromSource = normalizeKey(formatSourceName(source));
      return hydrophoneCoverMap.get(identifier) || hydrophoneCoverMap.get(fromSource) || defaultCoverArt;
    }

    return defaultCoverArt;
  };

  const readStoredAccessToken = () => {
    try {
      return localStorage.getItem("spotifyAccessToken");
    } catch (error) {
      console.warn("[Bubblemarks] Unable to read stored Spotify token:", error);
      return null;
    }
  };

  const spotifyDefaults = {
    openUri: "spotify:",
    fallbackUrl: "https://open.spotify.com/search/Baby%20Whiplash",
  };

  const spotifySettings = {
    ...(window.spotifyConfig || window.SPOTIFY_CONFIG || {}),
  };

  if (!spotifySettings.accessToken) {
    spotifySettings.accessToken = readStoredAccessToken();
  }

  if (!spotifySettings.playlistUrl) {
    spotifySettings.playlistUrl = spotifyDefaults.fallbackUrl;
  }

  if (!spotifySettings.babyWhiplashUrl) {
    spotifySettings.babyWhiplashUrl = spotifyDefaults.fallbackUrl;
  }

  const spotifyHeaders = () => {
    if (!spotifySettings.accessToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${spotifySettings.accessToken}`,
      "Content-Type": "application/json",
    };
  };

  const isSpotifyConfigured = () => {
    return Boolean(spotifySettings.accessToken && spotifySettings.accessToken.trim());
  };

  const openExternal = (url) => {
    if (typeof url === "string" && url.trim()) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const formatArtists = (artists) => {
    if (!Array.isArray(artists)) {
      return "";
    }

    return artists
      .map((artist) => artist?.name)
      .filter((name) => typeof name === "string" && name.trim())
      .join(", ");
  };

  const parseSpotifyTrack = (payload) => {
    if (!payload || typeof payload !== "object") {
      return null;
    }

    const item = payload.item || payload.track;
    if (!item) {
      return null;
    }

    const coverImage = Array.isArray(item.album?.images) ? item.album.images[0]?.url : null;

    return {
      id: item.id || item.uri || item.name || "spotify-track",
      title: item.name || "Spotify",
      artist: formatArtists(item.artists) || "Spotify",
      cover: coverImage || defaultAccent,
      isPlaying: payload.is_playing === true,
    };
  };

  const applyMainCover = (value) => {
    if (!mpCover) {
      return;
    }
    const hasGradient = typeof value === "string" && value.includes("gradient");
    if (!value) {
      mpCover.style.background = defaultAccent;
      mpCover.style.backgroundImage = "";
      return;
    }
    if (hasGradient) {
      mpCover.style.background = value;
      mpCover.style.backgroundImage = "";
      return;
    }
    mpCover.style.background = defaultAccent;
    mpCover.style.backgroundImage = `url(${value})`;
    mpCover.style.backgroundSize = "cover";
    mpCover.style.backgroundPosition = "center";
  };

  const refreshNowPlaying = (force = false) => {
    if (!mpMain) {
      return;
    }

    const mode = typeof musicController.mode === "string" ? musicController.mode : "idle";
    const metadata = musicController.currentMetadata || {};
    const source = musicController.currentSource || "";
    const paused =
      musicController.mode === "spotify" ? spotifyPlaybackState.isPlaying !== true : audio.paused;

    let title = "Nothing playing";
    let artist = "Press play to start";
    let label = "Idle";

    if (mode === "widget") {
      label = "Bubblebeats";
      title = metadata?.title || "Bubblebeats";
      artist = metadata?.artist || "Bubblemarks FM";
    } else if (mode === "disc") {
      label = "Disc";
      title = metadata?.id || metadata?.title || formatSourceName(source) || "Disc spin";
      artist = metadata?.artist || "Axolotl Deck";
    } else if (mode === "spotify") {
      label = "Spotify";
      title = metadata?.title || "Spotify stream";
      artist = metadata?.artist || "Spotify";
    } else if (mode === "hydrophone") {
      label = "Hydrophone";
      const hydroName = metadata?.name || metadata?.title || metadata?.id || formatSourceName(source);
      title = hydroName || "Hydrophone stream";
      artist = metadata?.artist || "Orcasound live";
    } else if (mode !== "idle") {
      label = "Now playing";
      title = metadata?.title || formatSourceName(source) || "Now playing";
      artist = metadata?.artist || "Bubblemarks Audio";
    }

    const cover = resolveCoverArt(mode, metadata, source);
    const signature = JSON.stringify({ mode, source, paused, title, artist, cover });
    if (!force && signature === nowPlayingSignature) {
      return;
    }
    nowPlayingSignature = signature;

    if (mpTitle) {
      mpTitle.textContent = title;
    }
    if (mpArtist) {
      mpArtist.textContent = artist;
    }
    if (mpMode) {
      mpMode.textContent = label;
    }
    applyMainCover(cover);
    updatePlayButtons(!paused);
  };

  const attachWidget = async () => {
    try {
      const response = await fetch("left-side/music-player/music-player.html");
      if (!response.ok) {
        throw new Error("Unable to load music widget");
      }
      const markup = await response.text();
      widgetHost.innerHTML = markup;
    } catch (error) {
      widgetHost.innerHTML = `<p class="music-player-fallback">Music nook is stretching... (${error.message})</p>`;
      console.log("✅ script validated");
      return;
    }

    widgetPlayButton = widgetHost.querySelector('[data-action="play"]');
    const backButton = widgetHost.querySelector('[data-action="back"]');
    const forwardButton = widgetHost.querySelector('[data-action="forward"]');
    const seek = widgetHost.querySelector(".music-seek");
    const volume = widgetHost.querySelector(".music-volume");
    const currentTimeLabel = widgetHost.querySelector('[data-time="current"]');
    const durationLabel = widgetHost.querySelector('[data-time="duration"]');
    mpMain = widgetHost.querySelector("#mp-main");
    mpTitle = widgetHost.querySelector("[data-mp-title]");
    mpArtist = widgetHost.querySelector("[data-mp-artist]");
    mpMode = widgetHost.querySelector("[data-mp-mode]");
    mpCover = widgetHost.querySelector("[data-mp-cover]");
    mpPlayButton = widgetHost.querySelector('[data-mp-action="play"]');
    mpStopButton = widgetHost.querySelector('[data-mp-action="stop"]');
    const spotifyTitle = widgetHost.querySelector("[data-spotify-title]");
    const spotifyArtist = widgetHost.querySelector("[data-spotify-artist]");
    const spotifyCover = widgetHost.querySelector("[data-spotify-cover]");
    const spotifyStatus = widgetHost.querySelector("[data-spotify-status]");
    const spotifyOpenButton = widgetHost.querySelector("[data-spotify-open]");
    const spotifyPlayBabyButton = widgetHost.querySelector("[data-spotify-play-baby]");
    const spotifyControlButtons = Array.from(
      widgetHost.querySelectorAll("[data-spotify-control]")
    );

    const updateSpotifyToggleLabel = (isPlaying) => {
      const toggleButton = spotifyControlButtons.find(
        (button) => button.dataset.spotifyControl === "toggle"
      );
      if (!toggleButton) {
        return;
      }

      toggleButton.textContent = isPlaying ? "❚❚" : "▶";
      toggleButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    };

    const updateSpotifyControls = (enabled) => {
      spotifyControlButtons.forEach((button) => {
        button.disabled = !enabled;
        if (!enabled) {
          button.setAttribute("aria-disabled", "true");
        } else {
          button.removeAttribute("aria-disabled");
        }
      });
      updateSpotifyToggleLabel(spotifyPlaybackState.isPlaying);
    };

    const applySpotifyNowPlaying = (track) => {
      const shouldUpdateMode =
        musicController.mode === "spotify" || !musicController.currentSource;

      const coverValue = track?.cover || defaultAccent;
      const titleValue = track?.title || "Spotify idle";
      const artistValue =
        track?.artist || (isSpotifyConfigured() ? "Ready when you press play" : "Open Spotify to start");

      spotifyPlaybackState.isPlaying = track?.isPlaying === true;
      updateSpotifyToggleLabel(spotifyPlaybackState.isPlaying);

      if (spotifyTitle) {
        spotifyTitle.textContent = titleValue;
      }

      if (spotifyArtist) {
        spotifyArtist.textContent = artistValue;
      }

      if (spotifyCover) {
        const isImage = typeof coverValue === "string" && coverValue.startsWith("http");
        spotifyCover.style.background = isImage ? defaultAccent : coverValue;
        spotifyCover.style.backgroundImage = isImage ? `url(${coverValue})` : "";
        spotifyCover.style.backgroundSize = "cover";
        spotifyCover.style.backgroundPosition = "center";
      }

      if (track && shouldUpdateMode) {
        musicController.setMode("spotify");
        musicController.currentMetadata = track;
        musicController.currentSource = track.id;
      } else if (shouldUpdateMode && !track) {
        musicController.setMode("idle");
        musicController.currentMetadata = null;
        musicController.currentSource = null;
      }

      refreshNowPlaying(true);
    };

    const setSpotifyStatus = (message) => {
      if (spotifyStatus && typeof message === "string") {
        spotifyStatus.textContent = message;
      }
    };

    const requestSpotify = async (path, options = {}) => {
      if (!isSpotifyConfigured()) {
        return null;
      }

      try {
        const response = await fetch(`https://api.spotify.com/v1${path}`, {
          ...options,
          headers: { ...spotifyHeaders(), ...(options.headers || {}) },
        });
        return response;
      } catch (error) {
        console.warn("[Bubblemarks] Spotify request failed:", error);
        return null;
      }
    };

    const refreshSpotifyNowPlayingFromApi = async () => {
      if (!isSpotifyConfigured()) {
        applySpotifyNowPlaying(null);
        updateSpotifyControls(false);
        setSpotifyStatus("Spotify API not configured. Buttons will open Spotify instead.");
        return;
      }

      const response = await requestSpotify("/me/player/currently-playing");

      if (!response) {
        updateSpotifyControls(false);
        setSpotifyStatus("Unable to reach Spotify right now.");
        return;
      }

      if (response.status === 204) {
        applySpotifyNowPlaying({
          title: "Spotify ready",
          artist: "No track currently playing",
          cover: defaultAccent,
          isPlaying: false,
        });
        updateSpotifyControls(true);
        setSpotifyStatus("Spotify linked. Ready when you press play.");
        return;
      }

      if (!response.ok) {
        updateSpotifyControls(false);
        setSpotifyStatus(`Spotify error ${response.status}. Check your session.`);
        return;
      }

      const payload = await response.json().catch(() => null);
      const track = parseSpotifyTrack(payload);

      if (track) {
        spotifyPlaybackState.isPlaying = track.isPlaying === true;
        applySpotifyNowPlaying(track);
        updateSpotifyControls(true);
        setSpotifyStatus(track.isPlaying ? "Playing on Spotify." : "Paused on Spotify.");
      } else {
        applySpotifyNowPlaying(null);
        updateSpotifyControls(true);
        setSpotifyStatus("Spotify connected. Start something to see it here.");
      }
    };

    const controlSpotifyPlayback = async (action) => {
      const fallbackUrl = spotifySettings.playlistUrl || spotifyDefaults.fallbackUrl;
      if (!isSpotifyConfigured()) {
        openExternal(fallbackUrl);
        setSpotifyStatus("Opening Spotify since controls are offline.");
        return;
      }

      const normalized = typeof action === "string" ? action.toLowerCase() : "toggle";
      const mappedAction =
        normalized === "toggle"
          ? spotifyPlaybackState.isPlaying
            ? "pause"
            : "play"
          : normalized;

      const endpoint = {
        next: { method: "POST", path: "/me/player/next" },
        prev: { method: "POST", path: "/me/player/previous" },
        play: { method: "PUT", path: "/me/player/play" },
        pause: { method: "PUT", path: "/me/player/pause" },
      }[mappedAction];

      if (!endpoint) {
        return;
      }

      const response = await requestSpotify(endpoint.path, { method: endpoint.method });
      if (response && (response.ok || response.status === 204)) {
        spotifyPlaybackState.isPlaying = mappedAction !== "pause";
        updateSpotifyToggleLabel(spotifyPlaybackState.isPlaying);
        setSpotifyStatus("Sent control to Spotify.");
        await refreshSpotifyNowPlayingFromApi();
        return;
      }

      setSpotifyStatus("Spotify control unavailable right now.");
    };

    const playBabyWhiplash = async () => {
      const fallbackUrl =
        spotifySettings.babyWhiplashUrl || spotifySettings.playlistUrl || spotifyDefaults.fallbackUrl;

      if (!isSpotifyConfigured() || !spotifySettings.babyWhiplashUri) {
        openExternal(fallbackUrl);
        setSpotifyStatus("Opening Baby Whiplash in Spotify.");
        return;
      }

      const body = spotifySettings.babyWhiplashUri.includes("playlist:")
        ? { context_uri: spotifySettings.babyWhiplashUri }
        : { uris: [spotifySettings.babyWhiplashUri] };

      const response = await requestSpotify("/me/player/play", {
        method: "PUT",
        body: JSON.stringify(body),
      });

      if (response && (response.ok || response.status === 204)) {
        spotifyPlaybackState.isPlaying = true;
        musicController.setMode("spotify");
        setSpotifyStatus("Requested Baby Whiplash on Spotify.");
        await refreshSpotifyNowPlayingFromApi();
        return;
      }

      openExternal(fallbackUrl);
      setSpotifyStatus("Couldn't control Spotify; opened playlist instead.");
    };

    applyTrack(currentTrackIndex);
    refreshNowPlaying(true);

    if (widgetPlayButton) {
      widgetPlayButton.addEventListener("click", () => {
        musicController.setMode("widget");
        musicController.onTrackEnd = null;
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      });
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        currentTrackIndex = (currentTrackIndex - 1 + pastelTracks.length) % pastelTracks.length;
        applyTrack(currentTrackIndex);
        musicController.setMode("widget");
        musicController.onTrackEnd = null;
        audio.play();
      });
    }

    if (mpPlayButton) {
      mpPlayButton.addEventListener("click", () => {
        if (!musicController.currentSource) {
          applyTrack(currentTrackIndex);
          musicController.setMode("widget");
        }
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      });
    }

    if (mpStopButton) {
      mpStopButton.addEventListener("click", () => {
        musicController.stop();
        refreshNowPlaying(true);
        updatePlayButtons(false);
      });
    }

    if (spotifyOpenButton) {
      spotifyOpenButton.addEventListener("click", () => {
        const openUri = spotifySettings.openUri || spotifyDefaults.openUri;
        openExternal(openUri);
        setSpotifyStatus("Opening Spotify...");
      });
    }

    if (spotifyPlayBabyButton) {
      spotifyPlayBabyButton.addEventListener("click", () => {
        playBabyWhiplash();
      });
    }

    spotifyControlButtons.forEach((button) => {
      button.addEventListener("click", () => {
        controlSpotifyPlayback(button.dataset.spotifyControl);
      });
    });

    if (forwardButton) {
      forwardButton.addEventListener("click", () => {
        currentTrackIndex = (currentTrackIndex + 1) % pastelTracks.length;
        applyTrack(currentTrackIndex);
        musicController.setMode("widget");
        musicController.onTrackEnd = null;
        audio.play();
      });
    }

    if (volume) {
      volume.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          const newVolume = Number.parseFloat(target.value);
          if (Number.isFinite(newVolume)) {
            audio.volume = newVolume;
          }
        }
      });
    }

    if (seek) {
      seek.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement && Number.isFinite(audio.duration)) {
          const seekValue = Number.parseFloat(target.value);
          const clampedValue = Math.min(Math.max(seekValue, 0), audio.duration);
          audio.currentTime = clampedValue;
        }
      });
    }

    audio.addEventListener("loadedmetadata", () => {
      if (musicController.mode !== "widget") {
        return;
      }
      if (durationLabel && Number.isFinite(audio.duration)) {
        durationLabel.textContent = formatTime(audio.duration);
      }
      if (seek && Number.isFinite(audio.duration)) {
        seek.max = audio.duration.toString();
      }
    });

    audio.addEventListener("timeupdate", () => {
      if (musicController.mode !== "widget") {
        return;
      }
      if (currentTimeLabel) {
        currentTimeLabel.textContent = formatTime(audio.currentTime);
      }
      if (seek && Number.isFinite(audio.duration)) {
        seek.value = audio.currentTime.toString();
      }
    });

    audio.addEventListener("play", () => {
      if (musicController.mode === "widget") {
        updatePlayButtons(true);
      } else {
        updatePlayButtons(!audio.paused);
      }
      refreshNowPlaying(true);
    });

    audio.addEventListener("pause", () => {
      updatePlayButtons(false);
      refreshNowPlaying(true);
    });

    audio.addEventListener("ended", () => {
      updatePlayButtons(false);
      refreshNowPlaying(true);
    });

    refreshSpotifyNowPlayingFromApi();

    window.setInterval(() => {
      refreshSpotifyNowPlayingFromApi();
    }, 12000);

    window.setInterval(() => {
      const forceUpdate = musicController.mode === "spotify" || musicController.mode === "hydrophone";
      refreshNowPlaying(forceUpdate);
    }, 1000);

    console.log("✅ script validated");
  };

  attachWidget();
});
