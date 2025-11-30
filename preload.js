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
  onOAuthCallback: (callback) =>
    ipcRenderer.on("spotify-oauth-callback", (_, url) => callback(url)),
});
