const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sequelize = require("../config/sequelize");

const User = require("../models/userModel");
const Profile = require("../models/profileModel");

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  let { name, lastName, email, password, profileId } = req.body;

  if (!profileId) {
    const defaultProfile = await Profile.findOne({
      where: { name: "usuario" },
    });
    if (!defaultProfile) {
      res.status(500);
      throw new Error('Default profile "usuario" not found');
    }
    profileId = defaultProfile.id;
  }

  //console.log("Registering user:", req.body);

  if (!name || lastName || !email || !password) {
    console.log("Missing fields in registration:", req.body);
    res.status(400);
    throw new Error("Ingresa todos los campos");
  }

  // Normalize the email to lowercase
  email = String(email).trim().toLowerCase();
  //console.log("Normalized email:", email);
  // Verificar si ya existe el usuario
  const userExist = await User.findOne({ where: { email } });

  if (userExist) {
    console.log("userExist", userExist);
    res.status(400);
    throw new Error("El usuario ya existe");
  }

  // Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear el usuario

  const user = await User.create({
    name,
    lastName,
    profileId,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user.id),
      profileId: user.profileId,
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
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const { password } = req.body;

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
      lastName: user.lastName,
      email: user.email,
      token: generateToken(user.id),
      profileId: user.profileId,
    });
  } else {
    res.status(401);
    throw new Error("Credencial invalida");
  }
});

// @desc    Get current user
// @route   /api/users
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = {
    id: req.user.id,
    name: req.user.name,
    lastName: req.user.lastName,
    email: req.user.email,
    //token: generateToken(req.user.id),
    profileId: req.user.profileId,
  };
  res.status(200).json(user);
});

// @desc    Get users
// @route   /api/users/
// @access  Private / Admin
const getUsers = asyncHandler(async (req, res) => {
  // optionally include inactive users with ?includeInactive=true
  const where = req.query.includeInactive ? {} : { isActive: true };
  const users = await User.findAll({
    where,
    // Uncomment include if association exists
    include: [{ model: Profile, as: "profile", attributes: ["id", "name"] }],
    order: [["id", "ASC"]],
  });
  res.json(users);
});

// @desc    Get user by id
// @route   /api/users/:id
// @access  Private / Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    include: [{ model: Profile, as: "profile", attributes: ["id", "name"] }],
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// @desc    create user
// @route   POST /api/users/admin
// @access  Private / Admin
const adminCreateUser = asyncHandler(async (req, res) => {
  // Reuse registerUser logic for admin creation
  const { name, lastName, email, password, profileId } = req.body;

  if (!name || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Ingresa todos los campos");
  }

  // Normalize the email to lowercase
  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if user already exists
  const userExist = await User.findOne({ where: { email: normalizedEmail } });
  if (userExist) {
    res.status(400);
    throw new Error("El usuario ya existe");
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create the user
  const user = await User.create({
    name,
    lastName,
    email: normalizedEmail,
    password: hashedPassword,
    profileId,
  });

  res.status(201).json({
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    token: generateToken(user.id),
    profileId: user.profileId,
  });
});

// @desc    update user by id
// @route   PUT /api/users/:id
// @access  Private / Admin
const updateUser = asyncHandler(async (req, res) => {
  // English: whitelist non-sensitive fields (do not touch password/email here)
  const { name, lastName, profileId, isActive } = req.body;

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.update({ name, lastName, profileId, isActive });

  const userUpdated = {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    profileId: user.profileId,
    isActive: user.isActive,
  };

  res.json(userUpdated);
});

// @desc    change password
// @route   PATCH /api/users/:id/password
// @access  Private / Admin
const changePassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  console.log("Changing password for user:", newPassword);
  if (!newPassword) {
    res.status(400);
    throw new Error("Nueva contraseña requerida");
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  // English: hash and store the new password
  const hashed = await bcrypt.hash(newPassword, 10);
  await user.update({ password: hashed });
  res.json({ message: "Password updated" });
});

// @desc    assign profile to user
// @route   PATCH /api/users/:id/profile
// @access  Private / Admin
const assignProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.body;
  console.log("Assigning profileId:", profileId);
  if (!profileId) {
    res.status(400);
    throw new Error("profileId requerido");
  }

  const profile = await Profile.findByPk(profileId);
  if (!profile) {
    res.status(400);
    throw new Error("Perfil no existe");
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.update({ profileId });
  res.json({ message: "Profile assigned", userId: user.id, profileId });
});

// @desc    vhange user email
// @route   PATCH /api/users/:id/email
// @access  Private / Admin
const changeEmail = asyncHandler(async (req, res) => {
  let { newEmail } = req.body;
  if (!newEmail) {
    res.status(400);
    throw new Error("Nuevo email requerido");
  }

  newEmail = String(newEmail).trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@oedi\.gob\.pe$/i.test(newEmail)) {
    res.status(400);
    throw new Error("Email must be @oedi.gob.pe");
  }
  const exists = await User.findOne({ where: { email: newEmail } });
  if (exists) {
    res.status(400);
    throw new Error("Email ya está en uso");
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.update({ email: newEmail });

  // English: rotate token if it's the current user (optional)
  // const token = user.id === req.user.id ? generateToken(user.id) : undefined;

  res.json({
    message: "Email updated",
    id: user.id,
    email: user.email /*, token*/,
  });
});

// @desc    Delete user by id
// @route   DELETE /api/users/:id
// @access  Private (admin or proper permission)
const delUser = asyncHandler(async (req, res) => {
  // English: validate and normalize the id
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "Invalid user id." });
  }

  // English: prevent self-delete if that is a policy in your app
  if (req.user && req.user.id === id) {
    return res
      .status(409)
      .json({ message: "You cannot delete your own account." });
  }

  // English: run inside a transaction so cascades are atomic
  const result = await sequelize.transaction(async (t) => {
    const user = await User.findByPk(id, { transaction: t });
    if (!user) return null;

    // English: if your model uses paranoid delete, choose force accordingly
    // await user.destroy({ transaction: t, force: true }); // hard delete
    await user.destroy({ transaction: t }); // soft delete if paranoid, hard if not

    return user;
  });

  if (!result) {
    return res.status(404).json({ message: "User not found." });
  }

  return res.status(200).json({ id, message: "User deleted successfully." });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers,
  getUserById,
  adminCreateUser,
  updateUser,
  changePassword,
  changeEmail,
  assignProfile,
  delUser,
};
