// middleware/authorizeProfile.js
// English: Authorize access based on user's profile (by name or id)

const User = require("../models/userModel");
const Profile = require("../models/profileModel");

function authorizeProfile(...allowedProfiles) {
  // English: Split allowed into names (strings) and ids (numbers)
  const allowedNames = new Set(
    allowedProfiles
      .filter((v) => typeof v === "string")
      .map((v) => String(v).toLowerCase())
  );
  const allowedIds = new Set(
    allowedProfiles.filter((v) => Number.isInteger(v)).map((v) => Number(v))
  );

  return async (req, res, next) => {
    try {
      // English: must be authenticated first (protect should set req.user)
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // English: optional - block inactive users early
      if (req.user.isActive === false) {
        return res.status(403).json({ message: "User is inactive" });
      }

      let { profileId, profile } = req.user;

      // English: if profile data is missing in req.user, fetch it from DB
      if (!profileId && !profile) {
        const dbUser = await User.findByPk(req.user.id, {
          include: [
            { model: Profile, as: "profile", attributes: ["id", "name"] },
          ],
        });
        if (!dbUser) {
          return res.status(401).json({ message: "User not found" });
        }
        profileId = dbUser.profileId;
        profile = dbUser.profile; // { id, name }
      }

      // English: If no allowed profiles were provided, allow any authenticated user
      if (allowedProfiles.length === 0) {
        return next();
      }

      // English: Normalize name and id
      const currentName = (
        profile?.name ||
        req.user.profile?.name ||
        ""
      ).toLowerCase();
      const currentId = Number(profileId || req.user.profileId);

      const nameAllowed =
        allowedNames.size > 0 && currentName && allowedNames.has(currentName);
      const idAllowed =
        allowedIds.size > 0 &&
        Number.isInteger(currentId) &&
        allowedIds.has(currentId);

      if (nameAllowed || idAllowed) {
        return next();
      }

      return res.status(403).json({ message: "No autorizado." });
    } catch (err) {
      console.error("authorizeProfile error:", err);
      return res.status(500).json({ message: "Authorization error" });
    }
  };
}

module.exports = authorizeProfile;
