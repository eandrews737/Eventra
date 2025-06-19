const crypto = require("crypto");
const prisma = require("../config/prisma");

const validateApiKey = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      error: "API key required",
      message: "Please include x-api-key header",
    });
  }

  try {
    // Hash the provided API key
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Find the API key in the database
    const apiKeyRecord = await prisma.apiKey.findFirst({
      where: {
        keyHash,
        isActive: true,
      },
    });

    if (!apiKeyRecord) {
      return res.status(403).json({
        error: "Invalid API key",
        message: "The provided API key is not valid",
      });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() },
    });

    // Attach API key info to request (but not user info)
    req.apiKey = apiKeyRecord;

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: "Error validating API key",
    });
  }
};

module.exports = {
  validateApiKey,
};
