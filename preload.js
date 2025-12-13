const { contextBridge, ipcRenderer } = require("electron");
const fsp = require("fs/promises");
const path = require("path");
const { pathToFileURL } = require("url");

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("✅ script validated");
  });
}

contextBridge.exposeInMainWorld("bubblemarks", {
  version: require("./package.json").version,
});

contextBridge.exposeInMainWorld("spotifyAPI", {
  onOAuthCallback(callback) {
    if (typeof callback !== "function") {
      return () => {};
    }

    const handler = (_event, url) => {
      callback(url);
    };

    ipcRenderer.on("spotify-oauth-callback", handler);

    return () => {
      ipcRenderer.removeListener("spotify-oauth-callback", handler);
    };
  },
});

const SUPPORTED_AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);

const MUSIC_FOLDERS = {
  bubblemarks: { label: "Bubblemarks FM", folder: "Bubblemarks FM" },
  songs: { label: "Orca Songs", folder: "orca sounds long" },
  calls: { label: "Orca Calls", folder: "orca sounds" },
};

const resolveMusicRoots = () => {
  const userHome = process.env.USERPROFILE || process.env.HOME || path.win32.join("C:", "Users", "User");
  const preferredDesktop = path.win32.join("C:\\", "Users", "User", "Desktop", "coding projects", "BMP Project Files");
  const userDesktop = path.join(userHome, "Desktop", "coding projects", "BMP Project Files");
  const userMusic = path.join(userHome, "Music");
  return [preferredDesktop, userDesktop, userMusic];
};

const normalizeTracks = (folderKey, folderPath, entries = []) => {
  return entries
    .filter((entry) => SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const targetPath = path.join(folderPath, MUSIC_FOLDERS[folderKey].folder, entry.name);
      const title = path.basename(entry.name, path.extname(entry.name)).replace(/[-_]+/g, " ");
      return {
        id: entry.name,
        title,
        artist: MUSIC_FOLDERS[folderKey]?.label || "Local Audio",
        source: pathToFileURL(targetPath).href,
      };
    });
};

const scanAudioFolder = async (folderKey) => {
  const folderName = MUSIC_FOLDERS[folderKey]?.folder;
  const roots = resolveMusicRoots();

  if (!folderName || roots.length === 0) {
    return { id: folderKey, tracks: [], missing: true, path: resolveMusicRoots()[0] };
  }

  const candidatePaths = roots.map((rootPath) => path.join(rootPath, folderName));
  const result = { id: folderKey, tracks: [], missing: true, path: candidatePaths[0] };

  for (const folderPath of candidatePaths) {
    try {
      const stats = await fsp.stat(folderPath);
      if (!stats.isDirectory()) {
        continue;
      }

      const entries = await fsp.readdir(folderPath, { withFileTypes: true });
      const files = entries.filter((entry) => entry.isFile());
      result.path = folderPath;
      result.missing = false;
      result.tracks = normalizeTracks(folderKey, folderPath, files);
      return result;
    } catch (error) {
      console.warn(`[Bubblemarks] Unable to read music folder "${folderPath}":`, error);
    }
  }

  return result;
};

contextBridge.exposeInMainWorld("musicLibrary", {
  async readLocalAudio(targets = []) {
    const keys = Array.isArray(targets) && targets.length > 0 ? targets : Object.keys(MUSIC_FOLDERS);
    const scans = await Promise.all(keys.map((key) => scanAudioFolder(key)));
    return scans.reduce((map, entry) => {
      map[entry.id] = entry;
      return map;
    }, {});
  },
});
