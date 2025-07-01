const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    modeloConvenio: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nivelGobierno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alias: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nombreConvenio: {
      type: DataTypes.STRING(1500),
      allowNull: false,
    },
    contraparte: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    departamento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provincia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distrito: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ubigeo: {
      type: DataTypes.STRING, // Para mantener ceros a la izquierda si es necesario usa STRING
      allowNull: false,
    },
    servicioPriorizado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombreIdeaProyecto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cui: {
      type: DataTypes.STRING, // Puede ser muy largo, mejor usar BIGINT o STRING si no haces cálculos
      allowNull: true,
    },
    ci: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firmaConvenio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    inicioConvenio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    numeroBeneficiarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    montoInversion: {
      type: DataTypes.DECIMAL(15, 2), // más preciso para montos
      allowNull: false,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "borrador",
    },
    avance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    plazo: {
      type: DataTypes.INTEGER,
      allowNull: true, // o false si quieres que sea obligatorio desde el principio
    },
    plazoSeguimiento: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "projects",
    timestamps: true, // crea createdAt y updatedAt
  }
);

module.exports = Project;
