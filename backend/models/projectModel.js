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
    nombreConvenio: {
      type: DataTypes.STRING,
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
      type: DataTypes.BIGINT, // Para mantener ceros a la izquierda si es necesario usa STRING
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
      type: DataTypes.BIGINT, // Puede ser muy largo, mejor usar BIGINT o STRING si no haces cálculos
      allowNull: false,
    },
    ci: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    firmaConvenio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    inicioConvenio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
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
  },
  {
    tableName: "projects",
    timestamps: true, // crea createdAt y updatedAt
  }
);

module.exports = Project;
