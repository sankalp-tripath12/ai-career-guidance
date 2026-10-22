const express = require("express");

const {
  getCareerRecommendation,
  getAssessments,
} = require("../controllers/careerController");

const router = express.Router();

router.post("/recommend", getCareerRecommendation);
router.get("/assessments", getAssessments);

module.exports = router;
