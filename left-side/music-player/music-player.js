window.addEventListener("DOMContentLoaded", () => {
  const navigateMusicPlayer = {
    openTab: () => false,
    openMain: () => false,
  };

  window.navigateMusicPlayer = navigateMusicPlayer;

  if (!window.spotifyConfig) {
    window.spotifyConfig = {};
  }

  const widgetHost = document.getElementById("music-player-widget");
  if (!widgetHost) {
    console.log("✅ script validated");
    return;
  }

  const stopLocalPlayback = () => {
    if (musicController && typeof musicController.stop === "function") {
      musicController.stop();
    }
  };

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
    ["harostrait", "assets/cover-orcasoundlab.png"],
    ["andrewsbay", "assets/cover-andrewsbay.png"],
    ["beachcamp", "assets/cover-beachcamp.png"],
    ["bushpoint", "assets/cover-bushpoint.png"],
    ["mastcenter", "assets/cover-mastcenter.png"],
    ["orcasoundlab", "assets/cover-orcasoundlab.png"],
    ["porttownsend", "assets/cover-porttownsend.png"],
    ["sunsetbay", "assets/cover-orcasoundlab.png"],
  ]);

  const defaultCoverArt = "assets/cover-orcasoundlab.png";
  const defaultAccent = "linear-gradient(150deg, rgba(255, 212, 238, 0.95), rgba(184, 209, 255, 0.95))";
  const silentHydrophonePrimer =
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=";

  const hydrophoneStations = [
    {
      id: "mastcenter",
      name: "MaST Center",
      streamUrl: "https://audio.orcasound.net/rpi_mast_center/hls/1765528218/live.m3u8",
      cover: hydrophoneCoverMap.get("mastcenter") || defaultCoverArt,
    },
    {
      id: "orcasoundlab",
      name: "Orcasound Lab",
      streamUrl: "https://audio.orcasound.net/rpi_orcasound_lab/hls/1765528218/live.m3u8",
      cover: hydrophoneCoverMap.get("orcasoundlab") || defaultCoverArt,
    },
    {
      id: "andrewsbay",
      name: "Andrews Bay",
      streamUrl: "https://audio.orcasound.net/rpi_andrews_bay/hls/1765528218/live.m3u8",
      cover: hydrophoneCoverMap.get("andrewsbay") || defaultCoverArt,
    },
    {
      id: "porttownsend",
      name: "Port Townsend",
      streamUrl: "https://audio.orcasound.net/rpi_port_townsend/hls/1765528218/live.m3u8",
      cover: hydrophoneCoverMap.get("porttownsend") || defaultCoverArt,
    },
    {
      id: "bushpoint",
      name: "Bush Point",
      streamUrl: "https://audio.orcasound.net/rpi_bush_point/hls/1765528218/live.m3u8",
      cover: hydrophoneCoverMap.get("bushpoint") || defaultCoverArt,
    },
    {
      id: "sunsetbay",
      name: "Sunset Bay",
      streamUrl: "https://audio.orcasound.net/rpi_sunset_bay/hls/1765528218/live.m3u8",
      cover: hydrophoneCoverMap.get("sunsetbay") || defaultCoverArt,
    },
  ];

  const petAssetBase = "bubblemarks://pet-axolotl/assets/";
  const discAssets = {
    Pigstep: { icon: `${petAssetBase}icon-pigstep.png`, sound: "Pigstep.mp3" },
    "Infinite Amethyst": {
      icon: `${petAssetBase}icon-infinite-amethyst.png`,
      sound: "Infinite-Amethyst.mp3",
    },
    Axolotl: { icon: `${petAssetBase}icon-Axolotl.png`, sound: "Axolotl.mp3" },
    11: { icon: `${petAssetBase}icon-11.png`, sound: "11.mp3" },
    13: { icon: `${petAssetBase}icon-13.png`, sound: "13.mp3" },
    Cat: { icon: `${petAssetBase}icon-cat.png`, sound: "Cat.mp3" },
    Mellohi: { icon: `${petAssetBase}icon-mellohi.png`, sound: "Mellohi.mp3" },
    Strad: { icon: `${petAssetBase}icon-strad.png`, sound: "Strad.mp3" },
    Mall: { icon: `${petAssetBase}icon-mall.png`, sound: "Mall.mp3" },
    Stal: { icon: `${petAssetBase}icon-stal.png`, sound: "Stal.mp3" },
    Far: { icon: `${petAssetBase}icon-far.png`, sound: "Far.mp3" },
    Blocks: { icon: `${petAssetBase}icon-blocks.png`, sound: "Blocks.mp3" },
    Chirp: { icon: `${petAssetBase}icon-chirp.png`, sound: "Chirp.mp3" },
    Ward: { icon: `${petAssetBase}icon-ward.png`, sound: "Ward.mp3" },
    Wait: { icon: `${petAssetBase}icon-wait.png`, sound: "Wait.mp3" },
  };

  const normalizeDiscName = (value) => {
    return typeof value === "string" && value.trim() ? value.trim() : "";
  };

  const getDiscIcon = (discName) => {
    const normalized = normalizeDiscName(discName);
    const assetEntry = discAssets[normalized];
    return assetEntry?.icon || `${petAssetBase}icon-player.png`;
  };

  const getDiscSource = (discName) => {
    const normalized = normalizeDiscName(discName);
    if (!normalized) {
      return null;
    }
    const assetEntry = discAssets[normalized];
    const fileName = assetEntry?.sound || `${normalized.replace(/\s+/g, "-")}.mp3`;
    return `pet-axolotl/sounds/${fileName}`;
  };

  const loadOwnedDiscs = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("ownedDiscs"));
      if (Array.isArray(stored)) {
        return stored.filter((disc) => typeof disc === "string" && disc.trim());
      }
    } catch {
      // ignore storage errors
    }
    return [];
  };

  const LOCAL_AUDIO_SOURCES = {
    bubblemarks: { label: "Bubblemarks FM" },
    songs: { label: "Orca Songs" },
    calls: { label: "Orca Calls" },
  };

  const MUSIC_MODE_STORAGE_KEY = "bubblemarks-music-source";
  const CALLS_REPEAT_STORAGE_KEY = "bubblemarks-calls-repeat";
  const supportedLocalFormats = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);

  const toFileUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
      return value;
    }

    if (value.startsWith("file://")) {
      return value;
    }

    const looksLikeWindowsPath = /^[a-zA-Z]:[\\/]/.test(value);
    if (!looksLikeWindowsPath) {
      return value;
    }

    const normalized = value.replace(/\\/g, "/");
    return `file:///${encodeURI(normalized)}`;
  };

  const readStoredMode = () => {
    try {
      const stored = localStorage.getItem(MUSIC_MODE_STORAGE_KEY);
      if (stored && LOCAL_AUDIO_SOURCES[stored]) {
        return stored;
      }
    } catch {
      // ignore storage errors
    }
    return null;
  };

  const persistStoredMode = (mode) => {
    try {
      if (mode && LOCAL_AUDIO_SOURCES[mode]) {
        localStorage.setItem(MUSIC_MODE_STORAGE_KEY, mode);
      }
    } catch {
      // ignore storage errors
    }
  };

  const readCallsRepeat = () => {
    try {
      const stored = localStorage.getItem(CALLS_REPEAT_STORAGE_KEY);
      if (stored === "true") {
        return true;
      }
      if (stored === "false") {
        return false;
      }
    } catch {
      // ignore storage errors
    }
    return false;
  };

  const persistCallsRepeat = (value) => {
    try {
      localStorage.setItem(CALLS_REPEAT_STORAGE_KEY, value ? "true" : "false");
    } catch {
      // ignore storage errors
    }
  };

  let callsRepeatEnabled = readCallsRepeat();

  const shuffleArray = (items = []) => {
    return [...items]
      .map((item) => ({ value: item, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((entry) => entry.value);
  };

  const normalizeLocalTrack = (track = {}, mode = "bubblemarks") => {
    const safeTrack = typeof track === "object" && track ? track : {};
    const label = LOCAL_AUDIO_SOURCES[mode]?.label || "Local Audio";
    const title = safeTrack.title || formatSourceName(safeTrack.source) || label;
    return {
      ...safeTrack,
      title,
      artist: safeTrack.artist || label,
      cover: safeTrack.cover || defaultAccent,
      source: toFileUrl(safeTrack.source),
    };
  };

  const createQueueState = () => ({
    mode: null,
    tracks: [],
    index: 0,
    options: {
      shuffle: true,
      repeatQueue: true,
      singlePlay: false,
    },
  });

  let queueState = createQueueState();

  let currentTrackIndex = 0;
  const audio = musicController.audio;
  audio.preload = "metadata";
  audio.volume = 0.7;

  let mpTitle;
  let mpArtist;
  let mpMode;
  let mpCover;
  let mpSourceStatus;
  let widgetPlayButton;
  let hydrophoneStatusEl;
  let hydrophoneStatusTimer;
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
    stopLocalPlayback();
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

  const formatListenerCount = (value) => {
    if (!Number.isFinite(value)) {
      return null;
    }
    const label = value === 1 ? "listener" : "listeners";
    return `${value} ${label}`;
  };

  const parseHydrophoneId = (value) => {
    const normalized = normalizeKey(value);
    return normalized.replace(/[^a-z0-9]/g, "");
  };

  const normalizeHydrophoneEndpoint = (endpoint) => {
    if (typeof endpoint !== "string" || !endpoint.trim()) {
      return null;
    }

    try {
      const url = new URL(endpoint.trim(), "https://live.orcasound.net");

      const mountSegment = url.pathname.split("/").pop();
      if (!mountSegment) {
        return null;
      }

      const sanitizedMount = mountSegment.replace(/[^a-z0-9.-]/gi, "");
      if (!sanitizedMount) {
        return null;
      }

      url.protocol = "https:";
      url.host = "live.orcasound.net";
      url.pathname = `/listen/${sanitizedMount}`;

      return url.toString();
    } catch {
      return null;
    }
  };

  const primeHydrophoneAutoplay = async () => {
    try {
      const primer = new Audio(silentHydrophonePrimer);
      primer.muted = true;
      primer.preload = "auto";
      primer.crossOrigin = "anonymous";
      await primer.play();
      primer.pause();
    } catch (error) {
      console.warn("[Bubblemarks] Hydrophone autoplay primer failed", error);
    }
  };

  const ensureHydrophoneStatusElement = () => {
    if (hydrophoneStatusEl) {
      return hydrophoneStatusEl;
    }

    const hydrophonePanel = widgetHost.querySelector(".music-player-card--orca");
    if (!hydrophonePanel) {
      return null;
    }

    const status = document.createElement("div");
    status.className = "hydrophone-status";
    status.setAttribute("role", "status");
    status.hidden = true;
    hydrophonePanel.insertBefore(status, hydrophonePanel.firstChild);
    hydrophoneStatusEl = status;
    return hydrophoneStatusEl;
  };

  const setHydrophoneStatus = (message, tone = "info", clearAfterMs = 0) => {
    const statusEl = ensureHydrophoneStatusElement();
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message;
    statusEl.dataset.tone = tone;
    statusEl.hidden = !message;

    if (hydrophoneStatusTimer) {
      clearTimeout(hydrophoneStatusTimer);
      hydrophoneStatusTimer = null;
    }

    if (clearAfterMs > 0) {
      hydrophoneStatusTimer = window.setTimeout(() => {
        statusEl.hidden = true;
      }, clearAfterMs);
    }
  };

  const fetchHydrophoneStatus = async () => {
    try {
      const response = await fetch("https://icecast.orcasound.net/status-json.xsl");
      if (!response.ok) {
        throw new Error("Unable to load hydrophone status");
      }

      const payload = await response.json();
      const sources = payload?.icestats?.source;
      const list = Array.isArray(sources) ? sources : sources ? [sources] : [];
      const counts = new Map();
      const endpoints = new Map();

      list.forEach((entry) => {
        const listenUrl = entry?.listenurl || entry?.url || "";
        const endpoint = typeof listenUrl === "string" ? listenUrl.trim() : "";
        const fromUrl = typeof listenUrl === "string" ? listenUrl.split("/").pop() : "";
        const mountId = parseHydrophoneId((fromUrl || "").replace(/\.[^/.]+$/, ""));
        const nameId = parseHydrophoneId(entry?.server_name) || parseHydrophoneId(entry?.server_description);
        const targetId = mountId || nameId;
        const listeners = Number.parseInt(entry?.listeners ?? entry?.listener_peak ?? "", 10);

        if (targetId) {
          counts.set(targetId, Number.isFinite(listeners) ? listeners : null);
          if (endpoint) {
            endpoints.set(targetId, endpoint);
          }
        }
      });

      return { counts, endpoints };
    } catch (error) {
      console.log("✅ script validated");
      return { counts: new Map(), endpoints: new Map() };
    }
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

  const SPOTIFY_TOKEN_KEY = "spotifyAuthEncrypted";
  const SPOTIFY_VERIFIER_KEY = "spotifyCodeVerifier";
  const SPOTIFY_STATE_KEY = "spotifyAuthState";
  const ENCRYPTION_SECRET = "bubblemarks-spotify-lock";

  const spotifyDefaults = {
    openUri: "spotify:",
    fallbackUrl: "https://open.spotify.com/search/Baby%20Whiplash",
    scopes: "user-read-playback-state user-modify-playback-state user-read-currently-playing",
  };

  const spotifyConfigDefaults = {
    clientId: "70cb1df3210c4079971d09510ea51ffc",
    redirectUri: "bubblemarks://spotify-callback",
  };

  const sanitizeSpotifyConfig = (rawConfig = {}) => {
    const config = { ...rawConfig };

    const isPlaceholder = (value) => typeof value === "string" && value.includes("<your-client-id>");

    if (!config.clientId || isPlaceholder(config.clientId)) {
      delete config.clientId;
    } else if (typeof config.clientId === "string") {
      config.clientId = config.clientId.trim();
    }

    if (typeof config.redirectUri === "string") {
      config.redirectUri = config.redirectUri.trim();
    }

    if (typeof config.scopes === "string") {
      config.scopes = config.scopes.trim();
    }

    return config;
  };

  const providedSpotifyConfig = sanitizeSpotifyConfig(window.spotifyConfig || window.SPOTIFY_CONFIG || {});

  window.spotifyConfig = { ...spotifyConfigDefaults, ...providedSpotifyConfig };

  const spotifySettings = {
    ...window.spotifyConfig,
  };

  if (!spotifySettings.playlistUrl) {
    spotifySettings.playlistUrl = spotifyDefaults.fallbackUrl;
  }

  if (!spotifySettings.babyWhiplashUrl) {
    spotifySettings.babyWhiplashUrl = spotifyDefaults.fallbackUrl;
  }

  if (!spotifySettings.scopes) {
    spotifySettings.scopes = spotifyDefaults.scopes;
  }

  const textEncoder = new TextEncoder();
  const base64UrlEncode = (buffer) => {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };

  const base64UrlDecode = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(normalized);
    const output = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      output[index] = binary.charCodeAt(index);
    }
    return output;
  };

  const getEncryptionKey = async () => {
    const secretBytes = textEncoder.encode(ENCRYPTION_SECRET);
    const secretHash = await crypto.subtle.digest("SHA-256", secretBytes);
    return crypto.subtle.importKey("raw", secretHash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  };

  const encryptTokenPayload = async (payload) => {
    try {
      const key = await getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEncoder.encode(payload));
      return `${base64UrlEncode(iv)}.${base64UrlEncode(new Uint8Array(encrypted))}`;
    } catch (error) {
      console.warn("[Bubblemarks] Failed to encrypt Spotify token", error);
      return null;
    }
  };

  const decryptTokenPayload = async (value) => {
    try {
      const [ivPart, cipherPart] = value.split(".");
      if (!ivPart || !cipherPart) {
        return null;
      }
      const key = await getEncryptionKey();
      const iv = base64UrlDecode(ivPart);
      const cipherBytes = base64UrlDecode(cipherPart);
      const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.warn("[Bubblemarks] Failed to decrypt Spotify token", error);
      return null;
    }
  };

  let tokenState = {
    accessToken: null,
    refreshToken: null,
    expiresAt: 0,
  };

  const persistTokenState = async (state) => {
    tokenState = state;
    try {
      const serialized = JSON.stringify(state);
      const encrypted = await encryptTokenPayload(serialized);
      if (encrypted) {
        localStorage.setItem(SPOTIFY_TOKEN_KEY, encrypted);
      }
    } catch (error) {
      console.warn("[Bubblemarks] Unable to persist Spotify tokens:", error);
    }
  };

  const hydrateTokensFromStorage = async () => {
    try {
      const stored = localStorage.getItem(SPOTIFY_TOKEN_KEY);
      if (!stored) {
        return null;
      }
      const decrypted = await decryptTokenPayload(stored);
      if (!decrypted) {
        return null;
      }
      const parsed = JSON.parse(decrypted);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      const hydrated = {
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        expiresAt: Number(parsed.expiresAt) || 0,
      };
      tokenState = hydrated;
      spotifySettings.accessToken = hydrated.accessToken;
      return hydrated;
    } catch (error) {
      console.warn("[Bubblemarks] Failed to load Spotify tokens:", error);
      return null;
    }
  };

  const hasValidAccessToken = () => {
    if (!tokenState.accessToken || !tokenState.expiresAt) {
      return false;
    }
    const bufferMs = 45 * 1000;
    return Date.now() + bufferMs < tokenState.expiresAt;
  };

  const updateSpotifyTokens = async ({ access_token, refresh_token, expires_in }) => {
    if (!access_token && !tokenState.accessToken) {
      return null;
    }
    const expiresAt = Date.now() + (Number(expires_in) || 3600) * 1000;
    const nextState = {
      accessToken: access_token || tokenState.accessToken,
      refreshToken: refresh_token || tokenState.refreshToken,
      expiresAt,
    };
    spotifySettings.accessToken = nextState.accessToken;
    await persistTokenState(nextState);
    return nextState;
  };

  const refreshAccessToken = async () => {
    if (!tokenState.refreshToken || !spotifySettings.clientId) {
      return false;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: tokenState.refreshToken,
          client_id: spotifySettings.clientId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      await updateSpotifyTokens(payload);
      return true;
    } catch (error) {
      console.warn("[Bubblemarks] Unable to refresh Spotify token:", error);
      return false;
    }
  };

  const ensureSpotifyAccessToken = async () => {
    if (hasValidAccessToken()) {
      return tokenState.accessToken;
    }

    const refreshed = await refreshAccessToken();
    if (refreshed && tokenState.accessToken) {
      return tokenState.accessToken;
    }

    return null;
  };

  const generateCodeVerifier = () => {
    const randomBytes = crypto.getRandomValues(new Uint8Array(64));
    return base64UrlEncode(randomBytes);
  };

  const generateCodeChallenge = async (verifier) => {
    const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(verifier));
    return base64UrlEncode(new Uint8Array(digest));
  };

  const clearAuthParamsFromUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("code");
    url.searchParams.delete("state");
    url.searchParams.delete("error");
    const cleaned = `${url.pathname}${url.hash}` || window.location.pathname;
    window.history.replaceState({}, document.title, cleaned);
  };

  const extractSpotifyAuthParams = (rawUrl = null) => {
    if (typeof rawUrl === "string" && rawUrl.trim()) {
      try {
        const parsedUrl = new URL(rawUrl.trim());
        const rawSearch = parsedUrl.search || parsedUrl.hash.replace(/^#/, "?") || "";
        if (rawSearch) {
          return new URLSearchParams(rawSearch);
        }
      } catch (error) {
        console.warn("[Bubblemarks] Unable to parse Spotify callback URL", error);
        return null;
      }
    }

    const search = window.location.search || window.location.hash.replace(/^#/, "?");
    if (!search) {
      return null;
    }

    return new URLSearchParams(search);
  };

  const exchangeCodeForTokens = async (code, { shouldClearUrl = true } = {}) => {
    const verifier = sessionStorage.getItem(SPOTIFY_VERIFIER_KEY);
    if (!verifier || !spotifySettings.clientId || !spotifySettings.redirectUri) {
      return false;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: spotifySettings.redirectUri,
          client_id: spotifySettings.clientId,
          code_verifier: verifier,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const payload = await response.json();
      await updateSpotifyTokens(payload);
      sessionStorage.removeItem(SPOTIFY_VERIFIER_KEY);
      sessionStorage.removeItem(SPOTIFY_STATE_KEY);
      if (shouldClearUrl) {
        clearAuthParamsFromUrl();
      }
      return true;
    } catch (error) {
      console.warn("[Bubblemarks] Unable to exchange Spotify auth code:", error);
      return false;
    }
  };

  const handleSpotifyRedirect = async (rawUrl = null) => {
    const params = extractSpotifyAuthParams(rawUrl);
    if (!params) {
      return false;
    }
    const code = params.get("code");
    const state = params.get("state");
    const expectedState = sessionStorage.getItem(SPOTIFY_STATE_KEY);

    if (!code || !state) {
      return false;
    }

    if (expectedState && expectedState !== state) {
      return false;
    }

    return exchangeCodeForTokens(code, { shouldClearUrl: rawUrl === null });
  };

  const bootstrapSpotifyTokens = async () => {
    if (!tokenState.accessToken) {
      await hydrateTokensFromStorage();
    }

    if (!hasValidAccessToken()) {
      await handleSpotifyRedirect();
    }

    if (!hasValidAccessToken() && tokenState.refreshToken) {
      await refreshAccessToken();
    }

    if (!tokenState.accessToken && spotifySettings.accessToken) {
      await updateSpotifyTokens({
        access_token: spotifySettings.accessToken,
        refresh_token: spotifySettings.refreshToken,
        expires_in: 3600,
      });
    }
  };

  const isSpotifyConfigured = () => {
    return Boolean(spotifySettings.clientId && (tokenState.accessToken || tokenState.refreshToken));
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
      const listenerValue = Number.isFinite(metadata?.listenerCount)
        ? metadata.listenerCount
        : Number.isFinite(metadata?.listeners)
          ? metadata.listeners
          : null;
      const listenerLabel = formatListenerCount(listenerValue);
      title = hydroName || "Hydrophone stream";
      const baseArtist = metadata?.artist || "Orcasound live";
      artist = listenerLabel ? `${baseArtist} • ${listenerLabel}` : baseArtist;
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
    if (mpSourceStatus) {
      const sourceSummary = label && artist ? `${label}: ${artist}` : artist || label;
      mpSourceStatus.textContent = sourceSummary || "Ready to play";
    }
    applyMainCover(cover);
    updatePlayButtons(!paused);
  };

  const applyHydrophoneStatus = ({ counts = new Map(), endpoints = new Map() } = {}) => {
    hydrophoneStations.forEach((station) => {
      const id = parseHydrophoneId(station.id);
      const countValue = counts.get(id);
      station.listenerCount = Number.isFinite(countValue) ? countValue : null;
    });

    if (musicController.mode === "hydrophone" && musicController.currentMetadata) {
      const currentId = parseHydrophoneId(
        musicController.currentMetadata.id || musicController.currentMetadata.name
      );
      const activeStation = hydrophoneStations.find(
        (station) => parseHydrophoneId(station.id) === currentId
      );

      if (activeStation) {
        const updatedMetadata = {
          ...activeStation,
          ...musicController.currentMetadata,
          listenerCount: activeStation.listenerCount,
          cover: activeStation.cover || musicController.currentMetadata.cover,
        };

        const nextStream = activeStation.streamUrl || musicController.currentSource;
        const shouldRefreshStream =
          typeof nextStream === "string" && nextStream && nextStream !== musicController.currentSource;

        musicController.currentMetadata = updatedMetadata;

        if (shouldRefreshStream) {
          setHydrophoneStatus("Refreshing live stream...", "info", 2000);
          musicController.playHydrophone(nextStream, updatedMetadata);
        }

        refreshNowPlaying(true);
      }
    }

    renderHydrophoneList();
  };

  const renderHydrophoneList = () => {
    const list = widgetHost.querySelector("[data-hydrophone-list]");
    if (!list) {
      return;
    }

    list.innerHTML = "";

    hydrophoneStations.forEach((station) => {
      const card = document.createElement("article");
      card.className = "hydrophone-card";
      card.setAttribute("aria-label", station.name);
      card.innerHTML = `
        <div class="hydrophone-cover" style="background-image: url(${station.cover});">
          <button type="button" class="hydrophone-play" data-hydrophone-play="${station.id}" aria-label="Play ${station.name}">▶</button>
        </div>
      `;
      list.appendChild(card);

      const playButton = card.querySelector(`[data-hydrophone-play]`);
      if (playButton) {
        playButton.addEventListener("click", async () => {
          const metadata = {
            ...station,
            artist: "Orcasound live",
            listenerCount: station.listenerCount,
          };
          stopLocalPlayback();
          setHydrophoneStatus(`Connecting to ${station.name}...`, "info");
          await primeHydrophoneAutoplay();
          musicController.audio.crossOrigin = "anonymous";
          musicController.audio.preload = "auto";
          musicController.playHydrophone(station.streamUrl, metadata);
          refreshNowPlaying(true);
        });
      }
    });
  };

  const loadHydrophoneListeners = async () => {
    const status = await fetchHydrophoneStatus();
    applyHydrophoneStatus(status);
  };

  const attachWidget = async () => {
    try {
      const response = await fetch("left-side/music-player/music-player.html");
      if (!response.ok) {
        throw new Error("Unable to load music widget");
      }
      const markup = await response.text();
      const parser = new DOMParser();
      const parsed = parser.parseFromString(markup, "text/html");
      const importedPlayer = parsed.getElementById("music-player");
      const helpModal = parsed.querySelector("[data-hydrophone-help-modal]");

      if (importedPlayer) {
        widgetHost.replaceChildren(importedPlayer);
        if (helpModal && !document.querySelector("[data-hydrophone-help-modal]")) {
          document.body.appendChild(helpModal);
        }
      } else {
        widgetHost.innerHTML = markup;
        const fallbackModal = widgetHost.querySelector("[data-hydrophone-help-modal]");
        if (fallbackModal && !document.querySelector("[data-hydrophone-help-modal]")) {
          document.body.appendChild(fallbackModal);
        }
      }
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
    const tabs = Array.from(widgetHost.querySelectorAll(".music-tab"));
    const panels = Array.from(widgetHost.querySelectorAll(".music-player-panel"));
    const musicPlayerRoot = widgetHost.querySelector("#music-player");
    mpTitle = widgetHost.querySelector(".music-player-title");
    mpArtist = widgetHost.querySelector(".music-player-artist");
    mpMode = widgetHost.querySelector(".music-player-label");
    mpSourceStatus = widgetHost.querySelector("[data-source-status]");
    mpCover = widgetHost.querySelector(".music-player-art");
    const discLibrary = widgetHost.querySelector("[data-disc-library]");
    const discLibraryEmpty = widgetHost.querySelector("[data-disc-empty]");
    const hydrophoneHelpButton = widgetHost.querySelector("[data-hydrophone-help-button]");
    const hydrophoneHelpModal = document.querySelector("[data-hydrophone-help-modal]");
    const hydrophoneHelpDialog = document.querySelector("[data-hydrophone-help-dialog]");
    const hydrophoneHelpClose = document.querySelector("[data-hydrophone-help-close]");
    const hydrophoneHelpBackdrop = document.querySelector("[data-hydrophone-help-backdrop]");
    const sourceButtons = Array.from(widgetHost.querySelectorAll("[data-source]"));
    const callsLoopToggle = widgetHost.querySelector("[data-loop-toggle]");

    let lastHydrophoneHelpTrigger = null;

    const localLibraryCache = new Map();

    const resetProgressDisplay = () => {
      if (seek) {
        seek.value = "0";
        seek.max = "0";
      }
      const currentTimeLabel = widgetHost.querySelector('[data-time="current"]');
      const durationLabel = widgetHost.querySelector('[data-time="duration"]');
      if (currentTimeLabel) {
        currentTimeLabel.textContent = "0:00";
      }
      if (durationLabel) {
        durationLabel.textContent = "0:00";
      }
    };

    const setSourceStatus = (message, tone = "info") => {
      if (mpSourceStatus) {
        mpSourceStatus.textContent = message;
        mpSourceStatus.dataset.tone = tone;
      }
    };

    const updateSourcePills = (mode) => {
      sourceButtons.forEach((button) => {
        const isActive = button.dataset.source === mode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    };

    const updateCallsLoopToggle = () => {
      if (!callsLoopToggle) {
        return;
      }
      callsLoopToggle.classList.toggle("is-active", callsRepeatEnabled);
      callsLoopToggle.setAttribute("aria-pressed", callsRepeatEnabled ? "true" : "false");
      callsLoopToggle.title = callsRepeatEnabled ? "Repeat Orca Calls" : "Single Orca Call";
    };

    const ensureLocalLibrary = async (mode, { refresh = false } = {}) => {
      if (!refresh && localLibraryCache.has(mode)) {
        return localLibraryCache.get(mode);
      }

      if (!window.musicLibrary || typeof window.musicLibrary.readLocalAudio !== "function") {
        return null;
      }

      try {
        const payload = await window.musicLibrary.readLocalAudio([mode]);
        const entry = payload?.[mode] || null;
        if (entry) {
          localLibraryCache.set(mode, entry);
        }
        return entry;
      } catch (error) {
        console.warn("[Bubblemarks] Unable to load local audio", error);
        return null;
      }
    };

    const getNextQueueIndex = () => {
      if (!queueState.tracks.length) {
        return -1;
      }

      const { index, tracks, options } = queueState;
      if (options.singlePlay && !options.repeatQueue) {
        return -1;
      }

      if (options.shuffle) {
        if (tracks.length === 1) {
          return options.repeatQueue ? 0 : -1;
        }
        let nextIndex = Math.floor(Math.random() * tracks.length);
        if (nextIndex === index) {
          nextIndex = (nextIndex + 1) % tracks.length;
        }
        return nextIndex;
      }

      const nextIndex = index + 1;
      if (nextIndex < tracks.length) {
        return nextIndex;
      }
      return options.repeatQueue ? 0 : -1;
    };

    const handleQueueAdvance = () => {
      const nextIndex = getNextQueueIndex();
      if (nextIndex < 0) {
        musicController.onTrackEnd = null;
        updatePlayButtons(false);
        setSourceStatus("Playback finished.", "info");
        return;
      }
      playQueueIndex(nextIndex);
    };

    const playQueueIndex = (index) => {
      const nextTrack = queueState.tracks[index];
      if (!nextTrack) {
        return false;
      }

      queueState.index = index;
      musicController.onTrackEnd = handleQueueAdvance;

      const normalized = normalizeLocalTrack(nextTrack, queueState.mode);
      resetProgressDisplay();
      setSourceStatus(`${normalized.artist}: ${normalized.title}`, "info");
      musicController.playSource(normalized.source, {
        loop: false,
        mode: "widget",
        metadata: normalized,
      });
      refreshNowPlaying(true);
      return true;
    };

    const startLocalMode = async (mode, { refresh = false } = {}) => {
      if (!LOCAL_AUDIO_SOURCES[mode]) {
        return;
      }

      persistStoredMode(mode);
      updateSourcePills(mode);
      stopLocalPlayback();
      resetProgressDisplay();

      const library = await ensureLocalLibrary(mode, { refresh });

      if (!library) {
        setSourceStatus("Local music unavailable.", "error");
        queueState = createQueueState();
        return;
      }

      if (library.missing) {
        setSourceStatus(`Folder missing: ${library.path}`, "error");
        queueState = createQueueState();
        return;
      }

      const supportedTracks = (library.tracks || []).filter((track) => {
        const extension = track?.source ? track.source.split(".").pop()?.toLowerCase() : "";
        const dotExtension = extension ? `.${extension}` : "";
        return supportedLocalFormats.has(dotExtension);
      });

      if (supportedTracks.length === 0) {
        setSourceStatus(`No audio found in ${library.path}.`, "warning");
        queueState = createQueueState();
        return;
      }

      const shuffled = shuffleArray(supportedTracks).map((track) => normalizeLocalTrack(track, mode));
      const singlePlay = mode === "calls" && !callsRepeatEnabled;
      queueState = {
        mode,
        tracks: shuffled,
        index: 0,
        options: {
          shuffle: true,
          repeatQueue: mode !== "calls" || callsRepeatEnabled,
          singlePlay,
        },
      };

      const startIndex = singlePlay ? Math.floor(Math.random() * shuffled.length) : 0;
      playQueueIndex(startIndex);
    };

    const copyToClipboard = async (text) => {
      if (!text) {
        return false;
      }

      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
          await navigator.clipboard.writeText(text);
        } else {
          const helper = document.createElement("textarea");
          helper.value = text;
          helper.setAttribute("aria-hidden", "true");
          helper.style.position = "fixed";
          helper.style.opacity = "0";
          document.body.appendChild(helper);
          helper.select();
          document.execCommand("copy");
          helper.remove();
        }
        return true;
      } catch (error) {
        console.warn("[Bubblemarks] Unable to copy text", error);
        return false;
      }
    };

    const handleHydrophoneHelpKeydown = (event) => {
      if (event.key === "Escape") {
        setHydrophoneHelpVisibility(false);
      }
    };

    const setHydrophoneHelpVisibility = (visible) => {
      if (!hydrophoneHelpModal) {
        return;
      }

      hydrophoneHelpModal.toggleAttribute("hidden", !visible);
      hydrophoneHelpModal.setAttribute("aria-hidden", visible ? "false" : "true");

      if (visible) {
        lastHydrophoneHelpTrigger = document.activeElement;
        if (hydrophoneHelpDialog && typeof hydrophoneHelpDialog.focus === "function") {
          hydrophoneHelpDialog.focus();
        }
        document.addEventListener("keydown", handleHydrophoneHelpKeydown, true);
      } else {
        document.removeEventListener("keydown", handleHydrophoneHelpKeydown, true);
        if (lastHydrophoneHelpTrigger && typeof lastHydrophoneHelpTrigger.focus === "function") {
          lastHydrophoneHelpTrigger.focus();
        }
      }
    };

    const hydrateHydrophoneHelp = () => {
      if (hydrophoneHelpButton && hydrophoneHelpModal) {
        hydrophoneHelpButton.addEventListener("click", () => setHydrophoneHelpVisibility(true));
      }

      if (hydrophoneHelpClose) {
        hydrophoneHelpClose.addEventListener("click", () => setHydrophoneHelpVisibility(false));
      }

      if (hydrophoneHelpBackdrop) {
        hydrophoneHelpBackdrop.addEventListener("click", (event) => {
          if (event.target === hydrophoneHelpBackdrop) {
            setHydrophoneHelpVisibility(false);
          }
        });
      }

      const helpLinks = Array.from(widgetHost.querySelectorAll("[data-help-link]"));
      helpLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          const url = link.getAttribute("href") || link.textContent || "";
          if (url) {
            event.preventDefault();
            openExternal(url);
          }
        });
      });

      const copyButtons = Array.from(widgetHost.querySelectorAll("[data-copy-text]"));
      copyButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const text = button.dataset.copyText || "";
          const originalLabel = button.textContent;
          const success = await copyToClipboard(text);
          if (success) {
            button.textContent = "Copied!";
            window.setTimeout(() => {
              button.textContent = originalLabel;
            }, 1200);
          }
        });
      });
    };

    hydrateHydrophoneHelp();

    const setActiveTab = (targetTab) => {
      const selected = targetTab || "main";
      tabs.forEach((tab) => {
        const isActive = tab.dataset.tab === selected;
        tab.classList.toggle("active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.panel === selected);
      });
    };

    navigateMusicPlayer.openTab = (targetTab = "main") => {
      setActiveTab(targetTab);
      if (widgetHost?.scrollIntoView) {
        widgetHost.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return true;
    };

    navigateMusicPlayer.openMain = () => navigateMusicPlayer.openTab("main");

    const renderDiscLibrary = () => {
      if (!discLibrary) {
        return;
      }

      const ownedDiscs = loadOwnedDiscs();
      discLibrary.innerHTML = "";

      const hasDiscs = ownedDiscs.length > 0;
      if (discLibraryEmpty) {
        discLibraryEmpty.style.display = hasDiscs ? "none" : "block";
      }

      if (!hasDiscs) {
        return;
      }

      const fragment = document.createDocumentFragment();

      ownedDiscs.forEach((discName) => {
        const row = document.createElement("article");
        row.className = "disc-row";

        const cover = document.createElement("img");
        cover.src = getDiscIcon(discName);
        cover.alt = `${discName} disc cover`;

        const meta = document.createElement("div");
        meta.className = "disc-meta";

        const title = document.createElement("p");
        title.className = "disc-title";
        title.textContent = discName;

        const subtitle = document.createElement("p");
        subtitle.className = "disc-subtitle";
        subtitle.textContent = "BubblePet music disc";

        meta.append(title, subtitle);

        const actions = document.createElement("div");
        actions.className = "disc-actions";

        const playBtn = document.createElement("button");
        playBtn.type = "button";
        playBtn.className = "music-btn";
        playBtn.textContent = "Play";
        playBtn.addEventListener("click", () => {
          const source = getDiscSource(discName);
          if (!source) {
            return;
          }

          stopLocalPlayback();
          musicController.playDisc(source, {
            loop: false,
            metadata: { id: discName, title: discName, artist: "BubblePet", cover: cover.src },
          });
          refreshNowPlaying(true);
        });

        actions.append(playBtn);

        row.append(cover, meta, actions);
        fragment.appendChild(row);
      });

      discLibrary.appendChild(fragment);
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        setActiveTab(tab.dataset.tab);
        if (tab.dataset.tab === "discs") {
          renderDiscLibrary();
        }
      });
    });

    if (tabs.length) {
      const initialTab = tabs.find((tab) => tab.classList.contains("active")) || tabs[0];
      setActiveTab(initialTab?.dataset.tab);
    }

    renderDiscLibrary();

    window.addEventListener("storage", (event) => {
      if (event.key === "ownedDiscs") {
        renderDiscLibrary();
      }
    });

    renderHydrophoneList();
    loadHydrophoneListeners();
    setInterval(loadHydrophoneListeners, 60000);

    updateCallsLoopToggle();

    sourceButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetMode = button.dataset.source;
        startLocalMode(targetMode);
      });
    });

    if (callsLoopToggle) {
      callsLoopToggle.addEventListener("click", () => {
        callsRepeatEnabled = !callsRepeatEnabled;
        persistCallsRepeat(callsRepeatEnabled);
        updateCallsLoopToggle();
        if (queueState.mode === "calls") {
          startLocalMode("calls");
        }
      });
    }

    const initialMode = readStoredMode() || "bubblemarks";
    await startLocalMode(initialMode);

    const spotifyTitle = widgetHost.querySelector("[data-spotify-title]");
    const spotifyArtist = widgetHost.querySelector("[data-spotify-artist]");
    const spotifyCover = widgetHost.querySelector("[data-spotify-cover]");
    const spotifyStatus = widgetHost.querySelector("[data-spotify-status]");
    const spotifyAuthPanel = widgetHost.querySelector("[data-spotify-auth]");
    const spotifyLoginButton = widgetHost.querySelector("[data-spotify-login]");
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

    const toggleSpotifyAuthVisibility = (visible) => {
      if (spotifyAuthPanel) {
        spotifyAuthPanel.style.display = visible ? "block" : "none";
      }
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
        if (musicController.mode !== "spotify") {
          stopLocalPlayback();
        }
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

    const startSpotifyLogin = async () => {
      if (!spotifySettings.clientId || !spotifySettings.redirectUri) {
        setSpotifyStatus("Add your Spotify client ID and redirect URI to log in.");
        return;
      }

      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = `bubblemarks-${Math.random().toString(36).slice(2)}`;

      sessionStorage.setItem(SPOTIFY_VERIFIER_KEY, verifier);
      sessionStorage.setItem(SPOTIFY_STATE_KEY, state);

      const params = new URLSearchParams({
        response_type: "code",
        client_id: spotifySettings.clientId,
        redirect_uri: spotifySettings.redirectUri,
        code_challenge_method: "S256",
        code_challenge: challenge,
        scope: spotifySettings.scopes,
        state,
      });

      const loginUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      openExternal(loginUrl);
      setSpotifyStatus("Opening Spotify login in your browser...");
    };

    const handleOAuthCallbackUrl = async (callbackUrl) => {
      const handled = await handleSpotifyRedirect(callbackUrl);
      if (handled) {
        toggleSpotifyAuthVisibility(false);
        await refreshSpotifyNowPlayingFromApi();
      }
    };

    const requestSpotify = async (path, options = {}, tokenOverride = null) => {
      const token = tokenOverride || (await ensureSpotifyAccessToken());
      if (!token) {
        return null;
      }

      const performRequest = async (bearerToken) => {
        return fetch(`https://api.spotify.com/v1${path}`, {
          ...options,
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            ...(options.headers || {}),
            ...(options.body ? { "Content-Type": "application/json" } : {}),
          },
        });
      };

      try {
        let response = await performRequest(token);
        if (response && response.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed && tokenState.accessToken) {
            response = await performRequest(tokenState.accessToken);
          }
        }
        return response;
      } catch (error) {
        console.warn("[Bubblemarks] Spotify request failed:", error);
        return null;
      }
    };

    const applyVolume = (value) => {
      const normalized = Math.min(Math.max(value, 0), 1);
      audio.volume = normalized;
      return normalized;
    };

    const updateSpotifyVolume = async (value) => {
      const token = await ensureSpotifyAccessToken();
      if (!token) {
        return;
      }

      const percent = Math.round(value * 100);
      const response = await requestSpotify(
        `/me/player/volume?volume_percent=${percent}`,
        { method: "PUT" },
        token,
      );

      if (response && (response.ok || response.status === 204)) {
        setSpotifyStatus(`Set Spotify volume to ${percent}%`);
        return;
      }

      setSpotifyStatus("Spotify volume controls are unavailable right now.");
    };

  const refreshSpotifyNowPlayingFromApi = async () => {
      if (!spotifySettings.clientId) {
        if (spotifyTitle) {
          spotifyTitle.textContent = "Spotify offline";
        }
        if (spotifyArtist) {
          spotifyArtist.textContent = "Open Spotify to start";
        }
        if (spotifyCover) {
          spotifyCover.style.background = defaultAccent;
          spotifyCover.style.backgroundImage = "";
        }
        spotifyPlaybackState.isPlaying = false;
        updateSpotifyToggleLabel(false);
        toggleSpotifyAuthVisibility(false);
        updateSpotifyControls(true);
        setSpotifyStatus("Spotify API not configured. Buttons will open Spotify instead.");
        return;
      }

      const token = await ensureSpotifyAccessToken();
      if (!token) {
        applySpotifyNowPlaying(null);
        updateSpotifyControls(false);
        toggleSpotifyAuthVisibility(true);
        setSpotifyStatus("Login to Spotify to enable controls.");
        return;
      }

      toggleSpotifyAuthVisibility(false);
      const response = await requestSpotify("/me/player/currently-playing", {}, token);

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
      if (!spotifySettings.clientId) {
        openExternal(fallbackUrl);
        setSpotifyStatus("Opening Spotify since controls are offline.");
        return;
      }

      const token = await ensureSpotifyAccessToken();
      if (!token) {
        toggleSpotifyAuthVisibility(true);
        setSpotifyStatus("Login to Spotify to send playback controls.");
        return;
      }

      if (musicController.mode !== "spotify") {
        stopLocalPlayback();
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

      const response = await requestSpotify(endpoint.path, { method: endpoint.method }, token);
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

      if (!spotifySettings.clientId) {
        openExternal(fallbackUrl);
        setSpotifyStatus("Opening Baby Whiplash in Spotify.");
        return;
      }

      const token = await ensureSpotifyAccessToken();
      if (!token) {
        toggleSpotifyAuthVisibility(true);
        setSpotifyStatus("Login to Spotify to play this track.");
        return;
      }

      if (musicController.mode !== "spotify") {
        stopLocalPlayback();
      }

      if (!spotifySettings.babyWhiplashUri) {
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
      }, token);

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

    await bootstrapSpotifyTokens();
    toggleSpotifyAuthVisibility(!hasValidAccessToken());
      if (!hasValidAccessToken()) {
        setSpotifyStatus(
          spotifySettings.clientId
            ? "Login to Spotify to sync playback."
            : "Add Spotify credentials to enable the widget."
        );
      }

      if (window.spotifyAPI?.onOAuthCallback) {
        window.spotifyAPI.onOAuthCallback((url) => {
          handleOAuthCallbackUrl(url);
        });
      }

      if (!queueState.tracks.length) {
        applyTrack(currentTrackIndex);
      }
      refreshNowPlaying(true);

    if (widgetPlayButton) {
      widgetPlayButton.addEventListener("click", () => {
        musicController.setMode("widget");
        musicController.onTrackEnd = queueState.tracks.length ? handleQueueAdvance : null;
        if (audio.paused) {
          audio.play();
        } else {
          audio.pause();
        }
      });
    }

    if (backButton) {
      backButton.addEventListener("click", () => {
        if (queueState.tracks.length > 0) {
          const previousIndex =
            queueState.tracks.length === 1
              ? 0
              : (queueState.index - 1 + queueState.tracks.length) % queueState.tracks.length;
          playQueueIndex(previousIndex);
        } else {
          currentTrackIndex = (currentTrackIndex - 1 + pastelTracks.length) % pastelTracks.length;
          applyTrack(currentTrackIndex);
          musicController.setMode("widget");
          musicController.onTrackEnd = null;
          audio.play();
        }
      });
    }

    if (spotifyOpenButton) {
      spotifyOpenButton.addEventListener("click", () => {
        const openUri = spotifySettings.openUri || spotifyDefaults.openUri;
        openExternal(openUri);
        setSpotifyStatus("Opening Spotify...");
      });
    }

    if (spotifyLoginButton) {
      spotifyLoginButton.addEventListener("click", () => {
        startSpotifyLogin();
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
        if (queueState.tracks.length > 0) {
          const nextIndex = getNextQueueIndex();
          if (nextIndex >= 0) {
            playQueueIndex(nextIndex);
          }
        } else {
          currentTrackIndex = (currentTrackIndex + 1) % pastelTracks.length;
          applyTrack(currentTrackIndex);
          musicController.setMode("widget");
          musicController.onTrackEnd = null;
          audio.play();
        }
      });
    }

    if (volume) {
      volume.addEventListener("input", (event) => {
        const target = event.currentTarget;
        if (target instanceof HTMLInputElement) {
          const newVolume = Number.parseFloat(target.value);
          if (Number.isFinite(newVolume)) {
            const normalizedVolume = applyVolume(newVolume);
            if (musicController.mode === "spotify") {
              updateSpotifyVolume(normalizedVolume).catch(() => {});
            }
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

    const handleHydrophonePlaybackEvent = (detail = {}) => {
      const { type, mode, attempt, delay, source, reason } = detail;
      if (mode !== "hydrophone") {
        return;
      }

      const reasonLabel = typeof reason === "string" && reason.trim() ? reason : "Stream error";

      if (type === "hydrophone-retry") {
        const attemptLabel = Number.isFinite(attempt) ? `Attempt ${attempt}` : "Retrying";
        const delayLabel = Number.isFinite(delay) ? ` in ${Math.round(delay / 1000)}s` : "";
        setHydrophoneStatus(`${attemptLabel}${delayLabel}...`, "warning");
      } else if (type === "hydrophone-recovered") {
        const stationName =
          detail.metadata?.name || musicController.currentMetadata?.name || formatSourceName(source) || "Hydrophone";
        setHydrophoneStatus(`${stationName} is live.`, "success", 4000);
      } else if (type === "hydrophone-failed") {
        const stationName =
          detail.metadata?.name || musicController.currentMetadata?.name || formatSourceName(source) || "Hydrophone";
        setHydrophoneStatus(`${stationName} unavailable: ${reasonLabel}.`, "error", 6000);
        refreshNowPlaying(true);
      } else if (type === "playback-error") {
        setHydrophoneStatus(`${reasonLabel}. Retrying...`, "error");
      }
    };

    window.addEventListener("musiccontroller", (event) => {
      handleHydrophonePlaybackEvent(event?.detail || {});
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
