const express = require("express");
const { getCareerRecommendation } = require("../controllers/careerController");

const router = express.Router();

router.post("/recommend", getCareerRecommendation);

module.exports = router;
