const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");

const generateTokens = async (userId) => {
  // Generate access token (15 minutes)
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  // Generate refresh token (7 days)
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user,
      message: "Registration successful"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error creating user", details: error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user.id);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      message: "Login successful"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error during login" });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token required" });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if refresh token exists in database and is not expired
    const tokenRecord = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!tokenRecord) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Set new access token in cookie
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.json({
      user,
      message: "Token refreshed successfully"
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Error fetching user" });
  }
};

const validateToken = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      valid: true,
      user,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (refreshToken) {
      // Remove refresh token from database
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId: req.user.id
        }
      });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Error during logout" });
  }
};

module.exports = {
  register,
  login,
  refresh,
  getCurrentUser,
  validateToken,
  logout,
};
