const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Ingresa todos los campos");
  }

  // Verificar si ya existe el usuario
  const userExist = await User.findOne({ where: { email } });

  if (userExist) {
    res.status(400);
    throw new Error("El usuario ya existe");
  }

  // Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear el usuario
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("No se pudo crear el usuario");
  }
});

// Función para generar el JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Login a user
// @route   /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email y contraseña son obligatorios");
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(401);
    throw new Error("Usuario no encontrado");
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    res.status(401);
    throw new Error("Credencial invalida");
  }
});

// @desc    Get current user
// @route   /api/users
// @access  Public
const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
  };
  res.status(200).json(user);
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
