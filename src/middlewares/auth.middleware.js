import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth middleware called for:", req.method, req.originalUrl);
  // console.log(authHeader);
  // Check if Authorization header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  // console.log(token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Verify the token
    // console.log(decoded);

    // Attach user data to request object
    req.userId = decoded.userId;
    next(); // Continue to the next middleware or route
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid Or Expired token" });
  }
};

export default authMiddleware;
