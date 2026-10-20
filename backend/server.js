const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

app.listen(PORT, () => {
  console.log(`Career Guidance API running at http://localhost:${PORT}`);
});
