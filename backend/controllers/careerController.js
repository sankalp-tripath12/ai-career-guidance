const { recommendCareer } = require("../utils/recommendCareer");

function getCareerRecommendation(req, res) {
  try {
    const { interest } = req.body || {};

    const recommendation = recommendCareer(interest);

    return res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { getCareerRecommendation };
