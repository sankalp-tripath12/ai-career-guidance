const { fork } = require("child_process");
const path = require("path");
const http = require("http");
const { app } = require("electron");

let backendProcess = null;

function getBackendDirectory() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend");
  }

  return path.join(__dirname, "../backend");
}

function checkBackendHealth() {
  return new Promise((resolve) => {
    const request = http.get(
      "http://localhost:5001/api/health",
      (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      }
    );

    request.setTimeout(1500, () => {
      request.destroy();
      resolve(false);
    });

    request.on("error", () => resolve(false));
  });
}

async function waitForBackend(maxAttempts = 30) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (!backendProcess || backendProcess.exitCode !== null) {
      throw new Error("The PathPilot backend stopped unexpectedly.");
    }

    if (await checkBackendHealth()) {
      console.log("PathPilot backend is ready.");
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("PathPilot backend did not become ready in time.");
}

async function startBackend() {
  if (backendProcess) {
    return waitForBackend();
  }

  const backendDirectory = getBackendDirectory();

  backendProcess = fork(
    path.join(backendDirectory, "server.js"),
    [],
    {
      cwd: backendDirectory,
      env: {
        ...process.env,
        PORT: "5001",
        PATHPILOT_USER_DATA: path.join(app.getPath("appData"), "PathPilot"),
      },
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    }
  );

  backendProcess.on("exit", (code) => {
    console.log(`PathPilot backend exited with code ${code}`);
    backendProcess = null;
  });

  return waitForBackend();
}

function stopBackend() {
  if (backendProcess) {
    const child = backendProcess;
    backendProcess = null;
    child.kill("SIGTERM");
  }
}

module.exports = {
  startBackend,
  stopBackend,
};
