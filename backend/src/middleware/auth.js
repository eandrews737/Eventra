const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authenticateToken = async (req, res, next) => {
  // Get token from Authorization header (for backward compatibility)
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  // If no token in header, try to get from cookies
  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
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

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    // If token is expired, try to refresh it
    if (error.name === 'TokenExpiredError') {
      return await handleTokenRefresh(req, res, next);
    }
    
    return res.status(403).json({ error: "Invalid token" });
  }
};

const handleTokenRefresh = async (req, res, next) => {
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

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

// Middleware to check if user is logged in
const isLoggedIn = async (req, res, next) => {
  // Get token from Authorization header (for backward compatibility)
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  // If no token in header, try to get from cookies
  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return await handleTokenRefresh(req, res, next);
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = {
  authenticateToken,
  isLoggedIn,
  handleTokenRefresh,
};
