const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("pathPilotDesktop", {
  platform: process.platform,
  appName: "PathPilot",
});
