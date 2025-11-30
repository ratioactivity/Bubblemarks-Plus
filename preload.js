const { contextBridge, ipcRenderer } = require("electron");

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
