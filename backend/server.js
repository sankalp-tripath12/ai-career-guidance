const express = require("express");
const cors = require("cors");
require("dotenv").config();

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
