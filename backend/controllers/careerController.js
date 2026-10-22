const { recommendCareer } = require("../utils/recommendCareer");
const Assessment = require("../models/Assessment");

async function getCareerRecommendation(req, res) {
  try {
    const { name, education, interest } = req.body || {};

    if (!name || !education || !interest) {
      return res.status(400).json({
        success: false,
        message: "Name, education, and interest are required.",
      });
    }

    const recommendation = recommendCareer(interest);

    const assessment = await Assessment.create({
      name,
      education,
      interest,
      careerTitle: recommendation.title,
      description: recommendation.description,
      skills: recommendation.skills,
      nextSteps: recommendation.nextSteps,
    });

    return res.status(200).json({
      success: true,
      data: recommendation,
      assessmentId: assessment._id,
    });
  } catch (error) {
    console.error("Career recommendation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to generate or save the career recommendation.",
    });
  }
}

async function getAssessments(req, res) {
  try {
    const assessments = await Assessment.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments,
    });
  } catch (error) {
    console.error("Fetch assessments error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve assessments.",
    });
  }
}

module.exports = {
  getCareerRecommendation,
  getAssessments,
};
