const careers = {
  technology: {
    title: "Software Developer",
    description:
      "Build applications, websites, and software systems to solve practical problems.",
    skills: [
      "JavaScript or Python",
      "Data structures and algorithms",
      "Problem-solving",
      "Git and GitHub",
      "REST APIs",
    ],
    nextSteps: [
      "Learn programming fundamentals.",
      "Build a small project and publish it on GitHub.",
      "Practice basic data structures and algorithms.",
    ],
  },

  design: {
    title: "UI/UX Designer",
    description:
      "Design user-friendly digital products by understanding user needs and improving experiences.",
    skills: [
      "UI design fundamentals",
      "User research",
      "Wireframing and prototyping",
      "Figma",
      "Usability testing",
    ],
    nextSteps: [
      "Learn design principles and user-centred design.",
      "Create a wireframe for a simple application.",
      "Build a portfolio with two case studies.",
    ],
  },

  business: {
    title: "Business Analyst",
    description:
      "Understand business problems, analyze information, and help teams make better decisions.",
    skills: [
      "Analytical thinking",
      "Excel or spreadsheets",
      "SQL fundamentals",
      "Data visualization",
      "Communication",
    ],
    nextSteps: [
      "Strengthen spreadsheet and analytical skills.",
      "Learn basic SQL.",
      "Analyze a public dataset and explain your findings.",
    ],
  },

  healthcare: {
    title: "Healthcare Professional",
    description:
      "Explore careers focused on health, patient support, and improving people's well-being.",
    skills: [
      "Relevant healthcare knowledge",
      "Communication",
      "Ethical decision-making",
      "Attention to detail",
      "Teamwork",
    ],
    nextSteps: [
      "Research recognized education pathways for your chosen healthcare role.",
      "Check the required qualifications and licensing rules.",
      "Explore suitable introductory courses or supervised volunteering.",
    ],
  },
};

function recommendCareer(interest) {
  if (typeof interest !== "string" || !interest.trim()) {
    throw new Error("A career interest is required.");
  }

  const normalizedInterest = interest.trim().toLowerCase();
  const recommendation = careers[normalizedInterest];

  if (!recommendation) {
    throw new Error(
      "Unsupported interest. Choose technology, design, business, or healthcare."
    );
  }

  return {
    interest: normalizedInterest,
    ...recommendation,
  };
}

module.exports = { recommendCareer };
