const { contextBridge, ipcRenderer } = require("electron");
const fsp = require("fs/promises");
const path = require("path");

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

const BUBBLEMARKS_PROTOCOL = "bubblemarks";

const MUSIC_FOLDERS = {
  bubblemarks: "Bubblemarks FM",
  songs: "orca sounds",
  calls: "orca sounds long",
};

const toBubblemarksMediaUrl = (targetPath) => {
  const normalizedPath = path.normalize(targetPath);
  const posixPath = normalizedPath.replace(/\\/g, "/");
  const prefixedPath = posixPath.startsWith("/") ? posixPath : `/${posixPath}`;
  const encodedPath = encodeURI(prefixedPath);
  return `${BUBBLEMARKS_PROTOCOL}://media${encodedPath}`;
};

const resolveMusicRoot = () => {
  const userHome = process.env.USERPROFILE || process.env.HOME || "C:\\Users\\Public";
  return path.join(userHome, "Music");
};

const normalizeTracks = (folderKey, entries = []) => {
  return entries
    .filter((entry) => SUPPORTED_AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => {
      const folderPath = resolveMusicRoot();
      const targetPath = path.join(folderPath, MUSIC_FOLDERS[folderKey], entry.name);
      const title = path.basename(entry.name, path.extname(entry.name)).replace(/[-_]+/g, " ");
      return {
        id: entry.name,
        title,
        artist: MUSIC_FOLDERS[folderKey] || "Local Audio",
        source: toBubblemarksMediaUrl(targetPath),
      };
    });
};

const scanAudioFolder = async (folderKey) => {
  const folderName = MUSIC_FOLDERS[folderKey];
  if (!folderName) {
    return { id: folderKey, tracks: [], missing: true, path: resolveMusicRoot() };
  }

  const musicRoot = resolveMusicRoot();
  const folderPath = path.join(musicRoot, folderName);
  const result = { id: folderKey, tracks: [], missing: false, path: folderPath };

  try {
    const stats = await fsp.stat(folderPath);
    if (!stats.isDirectory()) {
      result.missing = true;
      return result;
    }

    const entries = await fsp.readdir(folderPath, { withFileTypes: true });
    const files = entries.filter((entry) => entry.isFile());
    result.tracks = normalizeTracks(folderKey, files);
    return result;
  } catch (error) {
    console.warn(`[Bubblemarks] Unable to read music folder "${folderPath}":`, error);
    result.missing = true;
    return result;
  }
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
