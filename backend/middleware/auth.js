const { verifyToken } = require("../config/jwt");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Not authorized" });
  }
};

const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      if (resource.owner.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to access this resource" });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = { protect, checkOwnership };
