// middleware/authorizeProfile.js

const authorizeProfile = (...allowedProfiles) => {
  return (req, res, next) => {
    if (!req.user || !allowedProfiles.includes(req.user.profile)) {
      return res.status(403).json({ message: "No autorizado." });
    }
    next();
  };
};

module.exports = authorizeProfile;
