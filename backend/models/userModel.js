const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        // English comment: enforce @oedi.gob.pe domain
        isOediDomain(value) {
          if (!/^[a-z0-9._%+-]+@oedi\.gob\.pe$/i.test(String(value).trim())) {
            throw new Error("Email must be @oedi.gob.pe");
          }
        },
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "profiles",
        key: "id",
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // English: users are active by default
    },
  },
  {
    tableName: "users",
    timestamps: true, // o true si lo usabas antes
  }
);

module.exports = User;

// Assign default profile if none provided
User.beforeCreate(async (user, options) => {
  if (!user.profileId) {
    // English comment: look up the “usuario” profile by name
    const defaultProfile = await sequelize.models.Profile.findOne({
      where: { name: "usuario" },
    });
    if (!defaultProfile) {
      throw new Error('Default profile "usuario" not found');
    }
    user.profileId = defaultProfile.id;
  }
});
