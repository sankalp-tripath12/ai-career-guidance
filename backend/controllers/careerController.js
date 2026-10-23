const { recommendCareer } = require("../utils/recommendCareer");
const Assessment = require("../models/Assessment");

async function getCareerRecommendation(req, res) {
  try {
    const { name, education, interest } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof education !== "string" ||
      typeof interest !== "string" ||
      !name.trim() ||
      !education.trim() ||
      !interest.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide your name, education, and career interest.",
      });
    }

    const cleanName = name.trim();
    const cleanEducation = education.trim();
    const cleanInterest = interest.trim();

    if (
      cleanName.length > 100 ||
      cleanEducation.length > 200 ||
      cleanInterest.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Please shorten your name, education, or career interest.",
      });
    }

    const recommendation = recommendCareer(cleanInterest);

    const assessment = await Assessment.create({
      name: cleanName,
      education: cleanEducation,
      interest: cleanInterest,
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
