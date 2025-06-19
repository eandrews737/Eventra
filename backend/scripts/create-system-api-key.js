const crypto = require("crypto");
const { PrismaClient } = require("../prisma/generated");

const prisma = new PrismaClient();

async function createSystemApiKey() {
  try {
    // Generate API key and hash
    const apiKey = crypto.randomBytes(32).toString("hex");
    const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

    // Create the API key in the database
    await prisma.apiKey.create({
      data: {
        keyHash,
        name: "System API Key",
      },
    });

    console.log("API Key:", apiKey);
  } catch (error) {
    console.error("Error creating system API key:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSystemApiKey();
