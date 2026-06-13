const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const { app, BrowserWindow, screen, shell, protocol, ipcMain } = require("electron");

const ZENBOOK_WIDTH = 3840;
const ZENBOOK_HEIGHT = 1110;
const DIMENSION_TOLERANCE = 20;
const APP_ID = "com.bubblemarks.sidebar";
const BUBBLEMARKS_PROTOCOL = "bubblemarks";
const resolveUserMusicRoot = () => {
  const userHome = process.env.USERPROFILE || process.env.HOME || "C:\\Users\\Public";
  return path.join(userHome, "Music");
};

function registerMusicFolderHandler() {
  ipcMain.handle("open-music-folder", async () => {
    const musicRoot = resolveUserMusicRoot();

    try {
      await fs.promises.mkdir(musicRoot, { recursive: true });
    } catch (error) {
      console.warn(`[Bubblemarks] Unable to ensure Music folder exists at ${musicRoot}:`, error);
    }

    try {
      const result = await shell.openPath(musicRoot);
      if (result) {
        console.warn(`[Bubblemarks] Opening Music folder reported: ${result}`);
      }
      return { path: musicRoot, error: result || null };
    } catch (error) {
      console.error(`[Bubblemarks] Failed to open Music folder at ${musicRoot}:`, error);
      return { path: musicRoot, error: error?.message || String(error) };
    }
  });
}

function registerQuicklaunchHandler() {
  const isWindowsPath = (value = "") => /^[a-zA-Z]:[\\/]/.test(value);

  ipcMain.handle("quicklaunch-open", async (_event, target) => {
    const normalizedTarget = typeof target === "string" ? target.trim() : "";

    if (!normalizedTarget) {
      return { success: false, error: "No launch target provided." };
    }

    const looksLikeProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(normalizedTarget);
    const isFileUrl = normalizedTarget.toLowerCase().startsWith("file:");
    const isFilesystemTarget = isFileUrl || isWindowsPath(normalizedTarget) || path.isAbsolute(normalizedTarget);

    if (isFilesystemTarget) {
      try {
        const targetPath = isFileUrl ? fileURLToPath(new URL(normalizedTarget)) : normalizedTarget;
        const result = await shell.openPath(targetPath);
        return { success: !result, error: result || null };
      } catch (error) {
        console.warn(`[Bubblemarks] Quicklaunch failed to open path ${normalizedTarget}:`, error);
        return { success: false, error: error?.message || String(error) };
      }
    }

    if (looksLikeProtocol) {
      try {
        await shell.openExternal(normalizedTarget);
        return { success: true, error: null };
      } catch (error) {
        console.warn(`[Bubblemarks] Quicklaunch failed to open protocol ${normalizedTarget}:`, error);
        return { success: false, error: error?.message || String(error) };
      }
    }

    return { success: false, error: "Unsupported launch target." };
  });
}
const isDev = process.defaultApp || !app.isPackaged;
const SPOTIFY_OAUTH_CHANNEL = "spotify-oauth-callback";

function registerDefaultProtocolClient() {
  const appPath = process.execPath;
  const args = [];

  if (isDev && process.argv[1]) {
    args.push(path.resolve(process.argv[1]));
  }

  app.setAsDefaultProtocolClient(BUBBLEMARKS_PROTOCOL, appPath, args);
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
    },
  },
]);

app.setAppUserModelId(APP_ID);

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

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

function resolveSecondaryDisplay(displays, primaryDisplay) {
  const secondaryDisplays = displays.filter((display) => display.id !== primaryDisplay.id);

  if (secondaryDisplays.length === 0) {
    return null;
  }

  const rightSideMatches = secondaryDisplays
    .filter((display) => display.bounds.x > primaryDisplay.bounds.x)
    .sort((a, b) => a.bounds.x - b.bounds.x);
  if (rightSideMatches.length > 0) {
    return rightSideMatches[0];
  }

  const leftSideMatches = secondaryDisplays
    .filter((display) => display.bounds.x < primaryDisplay.bounds.x)
    .sort((a, b) => b.bounds.x - a.bounds.x);
  if (leftSideMatches.length > 0) {
    return leftSideMatches[0];
  }

  const verticalMatches = secondaryDisplays
    .filter((display) => display.bounds.y !== primaryDisplay.bounds.y)
    .sort((a, b) => Math.abs(a.bounds.y - primaryDisplay.bounds.y) - Math.abs(b.bounds.y - primaryDisplay.bounds.y));
  if (verticalMatches.length > 0) {
    return verticalMatches[0];
  }

  const zenbookDisplay = secondaryDisplays.find(displayMatchesZenbook);
  if (zenbookDisplay) {
    return zenbookDisplay;
  }

  return secondaryDisplays[0];
}

function resolveTargetDisplay() {
  const displays = screen.getAllDisplays();
  if (displays.length === 0) {
    return screen.getPrimaryDisplay();
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const secondaryDisplay = resolveSecondaryDisplay(displays, primaryDisplay);

  return secondaryDisplay || primaryDisplay;
}

function resolveDisplayByPreference(preference = "auto") {
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();
  const secondaryDisplay = resolveSecondaryDisplay(displays, primaryDisplay);

  if (preference === "primary") {
    return primaryDisplay;
  }

  if (preference === "secondary") {
    return secondaryDisplay || primaryDisplay;
  }

  return secondaryDisplay || primaryDisplay;
}


function describeDisplay(display) {
  if (!display) {
    return "unavailable";
  }

  const { bounds, workArea, scaleFactor } = display;
  return [
    `id=${display.id}`,
    `bounds=${bounds.x},${bounds.y},${bounds.width}x${bounds.height}`,
    workArea ? `workArea=${workArea.x},${workArea.y},${workArea.width}x${workArea.height}` : null,
    `scale=${scaleFactor}`,
  ]
    .filter(Boolean)
    .join(" ");
}

function logDisplayPlan(targetDisplay) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();

  console.log(`[Bubblemarks] primary display ${describeDisplay(primaryDisplay)}`);
  displays.forEach((display, index) => {
    const role = display.id === primaryDisplay.id ? "primary" : "secondary";
    console.log(`[Bubblemarks] display[${index}] ${role} ${describeDisplay(display)}`);
  });
  console.log(`[Bubblemarks] selected startup display ${describeDisplay(targetDisplay)}`);
}

function applyWindowBoundsToDisplay(targetDisplay) {
  if (!mainWindow || mainWindow.isDestroyed() || !targetDisplay) {
    return;
  }

  const { bounds } = targetDisplay;
  mainWindow.setBounds({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  });
}

function moveMainWindowToDisplay(preference = "auto") {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return { success: false, error: "Main window is not available." };
  }

  const targetDisplay = resolveDisplayByPreference(preference);
  if (!targetDisplay) {
    return { success: false, error: "No display available." };
  }

  const { bounds } = targetDisplay;

  try {
    mainWindow.setFullScreen(false);
    mainWindow.setBounds({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
    });
    mainWindow.setFullScreen(true);
    mainWindow.focus();

    return {
      success: true,
      display: {
        id: targetDisplay.id,
        bounds: targetDisplay.bounds,
        scaleFactor: targetDisplay.scaleFactor,
      },
    };
  } catch (error) {
    console.error("[Bubblemarks] Failed to move window to target display", error);
    return { success: false, error: error?.message || String(error) };
  }
}

function registerDisplayHandlers() {
  ipcMain.handle("display-move", async (_event, preference) => {
    const normalizedPreference =
      preference === "secondary" || preference === "primary" ? preference : "primary";
    return moveMainWindowToDisplay(normalizedPreference);
  });
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
      const rawPathname = decodeURIComponent(url.pathname || "");

      if (hostSegment === "media") {
        const normalizedMediaPath = (() => {
          if (process.platform === "win32" && /^\/[a-zA-Z]:/.test(rawPathname)) {
            return rawPathname.slice(1);
          }
          return rawPathname;
        })();

        const candidatePath = path.normalize(normalizedMediaPath);
        const isAbsolutePath = path.isAbsolute(candidatePath);

        if (!isAbsolutePath || !fs.existsSync(candidatePath)) {
          console.error(`[Bubblemarks] Invalid media path requested: ${rawPathname}`);
          return callback({ error: -6 });
        }

        return callback({ path: candidatePath });
      }

      const rawPath = rawPathname;
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

      const normalizedParts = normalizedPath.split("/").filter(Boolean);
      const primarySegment = normalizedParts[0] || "";

      if (primarySegment === "media") {
        const encodedTarget = normalizedParts.slice(1).join("/");
        const decodedTarget = decodeURIComponent(encodedTarget);
        const normalizedTargetPath = path.normalize(decodedTarget);
        const musicRoot = path.normalize(resolveUserMusicRoot() + path.sep);

        if (!normalizedTargetPath.startsWith(musicRoot)) {
          console.warn("[Bubblemarks] Media request outside Music folder rejected", normalizedTargetPath);
          return callback({ error: -10 });
        }

        return callback({ path: normalizedTargetPath });
      }

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

  logDisplayPlan(targetDisplay);
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
      autoplayPolicy: "no-user-gesture-required",
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    applyWindowBoundsToDisplay(targetDisplay);
    mainWindow.show();
    applyWindowBoundsToDisplay(targetDisplay);
    mainWindow.setFullScreen(true);
    mainWindow.focus();

    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setFullScreen(false);
        applyWindowBoundsToDisplay(resolveTargetDisplay());
        mainWindow.setFullScreen(true);
        mainWindow.focus();
      }
    }, 500);

    flushPendingDeepLinks();
  });

  const indexUrl = `${BUBBLEMARKS_PROTOCOL}://index.html`;
  const fallbackIndexPath = path.join(app.getAppPath(), "index.html");
  let attemptedFallbackLoad = false;

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(indexUrl);

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

  mainWindow.webContents.on("did-fail-load", (_event, _errorCode, _errorDescription, validatedURL) => {
    const failedUrl = typeof validatedURL === "string" ? validatedURL : "";
    if (attemptedFallbackLoad || !failedUrl.startsWith(`${BUBBLEMARKS_PROTOCOL}://`)) {
      return;
    }

    attemptedFallbackLoad = true;
    mainWindow.loadFile(fallbackIndexPath);
  });
}

  app.whenReady().then(() => {
    if (!gotSingleInstanceLock) {
      return;
    }

    registerBubblemarksProtocol();
    registerMusicFolderHandler();
    registerQuicklaunchHandler();
    registerDisplayHandlers();

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
