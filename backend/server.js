
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const userDataDirectory = process.env.PATHPILOT_USER_DATA;

const localEnvPath = userDataDirectory
  ? path.join(userDataDirectory, ".env")
  : null;

const developmentEnvPath = path.join(__dirname, ".env");

const envPath =
  localEnvPath && fs.existsSync(localEnvPath)
    ? localEnvPath
    : developmentEnvPath;

require("dotenv").config({ path: envPath });

const connectDB = require("./config/db");
const careerRoutes = require("./routes/careerRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Guidance API is running",
  });
});

app.use("/api/careers", careerRoutes);

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Career Guidance API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}

startServer();
