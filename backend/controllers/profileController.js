// controllers/profileController.js
const asyncHandler = require("express-async-handler");
const { Profile } = require("../models");

// @desc    Get all profiles
// @route   GET /api/profiles
// @access  Private/Admin or permitted roles
const getProfiles = asyncHandler(async (req, res) => {
  const profiles = await Profile.findAll({
    attributes: ["id", "name", "description", "createdAt", "updatedAt"],
    order: [["id", "ASC"]],
  });
  res.json(profiles);
});

// @desc    Get profile by ID
// @route   GET /api/profiles/:id
// @access  Private/Admin or permitted roles
const getProfileById = asyncHandler(async (req, res) => {
  const profile = await Profile.findByPk(req.params.id, {
    attributes: ["id", "name", "description", "createdAt", "updatedAt"],
  });
  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }
  res.json(profile);
});

// @desc    Create new profile
// @route   POST /api/profiles
// @access  Private/Admin
const createProfile = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validate input
  if (!name) {
    res.status(400);
    throw new Error("Profile name is required");
  }

  // Check uniqueness
  const exists = await Profile.findOne({ where: { name } });
  if (exists) {
    res.status(400);
    throw new Error("Profile with this name already exists");
  }

  const profile = await Profile.create({ name, description });
  res.status(201).json(profile);
});

// @desc    Update a profile
// @route   PUT /api/profiles/:id
// @access  Private/Admin
const updateProfile = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const profile = await Profile.findByPk(req.params.id);

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  // Update fields
  if (name) profile.name = name;
  if (description !== undefined) profile.description = description;

  await profile.save();
  res.json(profile);
});

// @desc    Delete a profile
// @route   DELETE /api/profiles/:id
// @access  Private/Admin
const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findByPk(req.params.id);

  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }

  await profile.destroy();
  res.json({ message: "Profile deleted successfully" });
});

module.exports = {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};
