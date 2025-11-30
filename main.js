const fs = require("fs");
const path = require("path");
const { app, BrowserWindow, screen, shell, protocol } = require("electron");

const ZENBOOK_WIDTH = 3840;
const ZENBOOK_HEIGHT = 1110;
const DIMENSION_TOLERANCE = 20;
const APP_ID = "com.bubblemarks.sidebar";
const BUBBLEMARKS_PROTOCOL = "bubblemarks";
const isDev = !app.isPackaged;
const SPOTIFY_OAUTH_CHANNEL = "spotify-oauth-callback";

function registerDefaultProtocolClient() {
  const appPath = process.execPath;
  const args = isDev ? [path.resolve(process.argv[1])] : undefined;

  if (isDev) {
    app.setAsDefaultProtocolClient(BUBBLEMARKS_PROTOCOL, appPath, args);
    return;
  }

  app.setAsDefaultProtocolClient(BUBBLEMARKS_PROTOCOL);
}

app.on("will-finish-launching", () => {
  registerDefaultProtocolClient();
});

protocol.registerSchemesAsPrivileged([
  {
    scheme: BUBBLEMARKS_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

app.setAppUserModelId(APP_ID);

console.log("✅ script validated");

let mainWindow = null;
const pendingDeepLinks = [];

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

function displayMatchesZenbook(display) {
  const sizesToCheck = [display.size, display.workAreaSize];
  return sizesToCheck.some(({ width, height }) => {
    const widthDiff = Math.abs(width - ZENBOOK_WIDTH);
    const heightDiff = Math.abs(height - ZENBOOK_HEIGHT);
    return widthDiff <= DIMENSION_TOLERANCE && heightDiff <= DIMENSION_TOLERANCE;
  });
}

function resolveTargetDisplay() {
  const displays = screen.getAllDisplays();
  if (displays.length === 0) {
    return screen.getPrimaryDisplay();
  }

  const zenbookDisplay = displays.find(displayMatchesZenbook);
  if (zenbookDisplay) {
    return zenbookDisplay;
  }

  const primaryDisplay = displays.find((display) => display.primary) || displays[0];
  const secondaryDisplays = displays.filter((display) => display.id !== primaryDisplay.id);

  if (secondaryDisplays.length === 0) {
    return primaryDisplay;
  }

  const verticalMatches = secondaryDisplays
    .filter((display) => display.bounds.y > primaryDisplay.bounds.y)
    .sort((a, b) => b.bounds.y - a.bounds.y);
  if (verticalMatches.length > 0) {
    return verticalMatches[0];
  }

  const horizontalMatches = secondaryDisplays
    .filter((display) => display.bounds.x !== primaryDisplay.bounds.x)
    .sort((a, b) => a.bounds.x - b.bounds.x);
  if (horizontalMatches.length > 0) {
    return horizontalMatches[0];
  }

  return secondaryDisplays[0];
}

function extractBubblemarksUrl(commandLine = []) {
  return commandLine.find((arg) => typeof arg === "string" && arg.startsWith(`${BUBBLEMARKS_PROTOCOL}://`));
}

function forwardSpotifyCallback(deepLinkUrl) {
  if (!deepLinkUrl || typeof deepLinkUrl !== "string") {
    return;
  }

  const trimmedUrl = deepLinkUrl.trim();
  const isSpotifyCallback = trimmedUrl.includes("spotify-callback");

  if (!isSpotifyCallback) {
    return;
  }

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(SPOTIFY_OAUTH_CHANNEL, trimmedUrl);
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
    return;
  }

  pendingDeepLinks.push(trimmedUrl);
}

function flushPendingDeepLinks() {
  while (pendingDeepLinks.length > 0 && mainWindow && !mainWindow.isDestroyed()) {
    const nextUrl = pendingDeepLinks.shift();
    mainWindow.webContents.send(SPOTIFY_OAUTH_CHANNEL, nextUrl);
  }
}

if (gotSingleInstanceLock) {
  app.on("second-instance", (_event, commandLine) => {
    const deepLink = extractBubblemarksUrl(commandLine);
    if (deepLink) {
      forwardSpotifyCallback(deepLink);
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.on("open-url", (event, url) => {
    event.preventDefault();
    forwardSpotifyCallback(url);
  });
}

function registerBubblemarksProtocol() {
  protocol.registerFileProtocol(BUBBLEMARKS_PROTOCOL, (request, callback) => {
    try {
      const url = new URL(request.url);
      const hostSegment = url.hostname ? url.hostname : "";
      const rawPath = decodeURIComponent(url.pathname);
      const trimmedPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
      const requestUrlLower = (request.url || "").toLowerCase();
      const pathCandidates = [hostSegment, trimmedPath, rawPath, url.pathname]
        .map((value) => (typeof value === "string" ? value.toLowerCase() : ""))
        .filter(Boolean);
      const isSpotifyCallbackRequest = [requestUrlLower, ...pathCandidates].some((value) =>
        value.includes("spotify-callback")
      );
      const normalizedCallbackPath = [hostSegment, trimmedPath].filter(Boolean).join("/");

      const serveSpotifyCallbackResponse = () => {
        forwardSpotifyCallback(request.url);
        callback({
          data: Buffer.from(
            "<html><body><p>Spotify login received. You can return to Bubblemarks.</p></body></html>",
            "utf8"
          ),
          mimeType: "text/html",
        });
      };

      if (isSpotifyCallbackRequest || normalizedCallbackPath.startsWith("spotify-callback")) {
        return serveSpotifyCallbackResponse();
      }

      const normalizedPath = path
        .posix
        .normalize([hostSegment, trimmedPath].filter(Boolean).join("/"))
        .replace(/^\/+|\/+$/g, "");

      const resolvedTarget = (() => {
        if (normalizedPath === "" || normalizedPath === "index") {
          return "index.html";
        }

        if (normalizedPath === "index.html") {
          return "index.html";
        }

        if (normalizedPath.startsWith("index.html/")) {
          return normalizedPath.slice("index.html/".length);
        }

        return normalizedPath;
      })();

      if (resolvedTarget.startsWith("spotify-callback")) {
        return serveSpotifyCallbackResponse();
      }

      const appBasePath = path.normalize(app.getAppPath() + path.sep);
      const resourceBasePath = path.normalize(process.resourcesPath + path.sep);
      const unpackedBasePath = path.normalize(path.join(process.resourcesPath, "app.asar.unpacked") + path.sep);

      const candidateBases = [appBasePath];

      if (app.isPackaged) {
        candidateBases.push(resourceBasePath);

        if (fs.existsSync(unpackedBasePath)) {
          candidateBases.push(unpackedBasePath);
        }
      }

      const resolvedPath = candidateBases
        .map((basePath) => {
          const candidate = path.normalize(path.join(basePath, resolvedTarget));
          return { basePath, candidate };
        })
        .find(({ basePath, candidate }) => candidate.startsWith(basePath) && fs.existsSync(candidate));

      if (!resolvedPath) {
        console.error(
          `[Bubblemarks] Missing file for protocol request: ${path.join(appBasePath, resolvedTarget)}`
        );
        return callback({ error: -6 });
      }

      callback({ path: resolvedPath.candidate });
    } catch (error) {
      console.error("[Bubblemarks] Failed to resolve bubblemarks:// path", error);
      callback({ error: -324 });
    }
  });
}

function createWindow() {
  const targetDisplay = resolveTargetDisplay();
  const { bounds, size, scaleFactor } = targetDisplay;
  const targetSize = size || bounds;
  const { width, height } = targetSize;

  console.log(
    `[Bubblemarks] targeting display ${targetDisplay.id} (${width}x${height}@${scaleFactor}x)`
  );

  mainWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    backgroundColor: "#f5f5f5",
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.setFullScreen(true);
    mainWindow.show();
    mainWindow.focus();
    flushPendingDeepLinks();
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(`${BUBBLEMARKS_PROTOCOL}://index.html`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const handleSpotifyNavigation = (event, url) => {
    if (!url || typeof url !== "string") {
      return;
    }

    const normalizedUrl = url.trim().toLowerCase();
    const isSpotifyCallbackNavigation = normalizedUrl.includes("spotify-callback");

    if (!isSpotifyCallbackNavigation) {
      return;
    }

    event.preventDefault();
    forwardSpotifyCallback(url);

    const currentUrl = mainWindow.webContents.getURL();
    if (!currentUrl.startsWith(`${BUBBLEMARKS_PROTOCOL}://index.html`)) {
      mainWindow.loadURL(`${BUBBLEMARKS_PROTOCOL}://index.html`);
    }
  };

  mainWindow.webContents.on("will-redirect", handleSpotifyNavigation);
  mainWindow.webContents.on("will-navigate", handleSpotifyNavigation);
}

  app.whenReady().then(() => {
    if (!gotSingleInstanceLock) {
      return;
    }

    registerBubblemarksProtocol();

    if (!app.isDefaultProtocolClient(BUBBLEMARKS_PROTOCOL)) {
      registerDefaultProtocolClient();
    }

    createWindow();

    const startupDeepLink = extractBubblemarksUrl(process.argv);
    if (startupDeepLink) {
      forwardSpotifyCallback(startupDeepLink);
    }
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
