// backend/middleware/authMiddleware.js
// Middleware to protect routes by checking for a valid JWT token

const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

/**
 * @desc   Protect routes: requires valid JWT and active user
 * @usage  router.use(protect)
 */
const protect = asyncHandler(async (req, res, next) => {
  // English: Extract token from "Authorization: Bearer <token>"
  const authHeader = req.headers.authorization || "";
  //console.log("Auth header:", authHeader);
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  // English: Require token
  if (!token) {
    res.status(401);
    throw new Error("No autorizado, token faltante.");
  }

  // English: Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("No autorizado, token inválido o expirado.");
  }

  // English: Load fresh user from DB (exclude password)
  const user = await User.findByPk(decoded.id, {
    attributes: { exclude: ["password"] },
  });

  // English: Block if user not found
  if (!user) {
    res.status(401);
    throw new Error("No autorizado, usuario inexistente.");
  }

  // English: Hard block deactivated accounts even if token is valid
  if (user.isActive === false) {
    console.warn(`Blocked access for deactivated user ${user.id}`);
    res.status(403);
    throw new Error("Usuario desactivado. Contacte al administrador.");
  }

  // English: Attach fresh user object for downstream handlers
  req.user = user;
  next();
});

module.exports = { protect };
