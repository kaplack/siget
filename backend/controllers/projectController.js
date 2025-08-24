const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const sequelize = require("../config/sequelize");
const { Project, User, Consecutive } = require("../models");
const { getNextCodigoOedi } = require("../utils/codigoOediUtils");

// @desc    Crear nuevo proyecto
// @route   POST /api/projects
// @access  Public (puedes cambiarlo si usas auth)
const createProject = asyncHandler(async (req, res) => {
  //try {
  const {
    nombreConvenio,
    contraparte,
    departamento,
    provincia,
    distrito,
    ubigeo,
    servicioPriorizado,
    nombreIdeaProyecto,
    cui,
    ci,
    firmaConvenio,
    inicioConvenio,
    numeroBeneficiarios,
    montoInversion,
    direccion,
    modeloConvenio,
    nivelGobierno,
    alias,
  } = req.body;

  //console.log("Datos recibidos:", req.body);
  const userId = req.user?.id; // Assumes user is authenticated and ID is available

  // Basic validation
  if (
    !nombreConvenio ||
    !contraparte ||
    !departamento ||
    !ubigeo ||
    !servicioPriorizado ||
    !nombreIdeaProyecto ||
    !numeroBeneficiarios ||
    !montoInversion ||
    !userId
  ) {
    console.log("Todos los campos son obligatorios");
    res.status(400);
    throw new Error("Todos los campos son obligatorios");
  }

  const project = await sequelize.transaction(async (t) => {
    const { codigoOedi } = await getNextCodigoOedi({
      modeloConvenio,
      direccion,
      transaction: t,
    });

    return await Project.create(
      {
        nombreConvenio,
        contraparte,
        departamento,
        provincia,
        distrito,
        ubigeo,
        servicioPriorizado,
        nombreIdeaProyecto,
        cui,
        ci,
        firmaConvenio,
        inicioConvenio,
        numeroBeneficiarios,
        montoInversion,
        userId,
        estado: "borrador",
        direccion,
        modeloConvenio,
        codigoOedi,
        nivelGobierno,
        alias,
      },
      { transaction: t }
    );
  });
  console.log("Proyecto creado:", project);

  res.status(201).json(project);
  // } catch (error) {
  //   console.error("Error al crear proyecto:", error);
  //   res.status(500).json({
  //     message: "Error al crear el proyecto",
  //     error: error.message,
  //   });
  // }
});

// GET /api/projects/user
// Retrieves all projects assigned to the logged-in user
const getUserProjects = async (req, res) => {
  //console.log(req.user);
  try {
    const userId = req.user.id;
    const includeAnnulled = req.query.includeAnnulled === "true";

    const where = includeAnnulled
      ? { userId }
      : { userId, estado: { [Op.ne]: "anulado" } };

    const projects = await Project.findAll({
      where,
      attributes: [
        "id",
        "nombreConvenio",
        "contraparte",
        "departamento",
        "provincia",
        "distrito",
        "ubigeo",
        "servicioPriorizado",
        "nombreIdeaProyecto",
        "cui",
        "ci",
        "firmaConvenio",
        "inicioConvenio",
        "numeroBeneficiarios",
        "montoInversion",
        "estado",
        "avance",
        "plazo",
        "plazoSeguimiento",
        "direccion",
        "modeloConvenio",
        "nivelGobierno",
        "alias",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json([...projects]);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Error retrieving projects." });
  }
};

// GET /api/projects/user
// Retrieves project by id
const getProject = async (req, res) => {
  const { id } = req.params;
  try {
    // por ejemplo, buscar en base de datos
    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "lastName"],
        },
      ],
    });

    if (!project) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ message: "Error retrieving project." });
  }
};

// @desc    Actualizar datos de un proyecto existente
// @route   PUT /api/projects/project/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findByPk(id);

  if (!project) {
    res.status(404);
    throw new Error("Proyecto no encontrado");
  }

  // Lista de campos permitidos para actualizar
  const fieldsToUpdate = [
    "nombreConvenio",
    "contraparte",
    "departamento",
    "provincia",
    "distrito",
    "ubigeo",
    "servicioPriorizado",
    "nombreIdeaProyecto",
    "cui",
    "ci",
    "firmaConvenio",
    "inicioConvenio",
    "numeroBeneficiarios",
    "montoInversion",
    "estado",
    "avance",
    "plazo",
    "plazoSeguimiento",
    "direccion",
    "modeloConvenio",
    "codigoOedi",
    "nivelGobierno",
    "alias",
  ];

  // Actualiza solo los campos enviados en el request
  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      project[field] = req.body[field];
    }
  });

  await project.save();

  res.status(200).json(project);
});

// @desc get all projects for admin
// @route /api/projects/delete/:id
// @access PRIVATE

const getAllProjects = async (req, res) => {
  const includeAnnulled = req.query.includeAnnulled === "true";
  const where = includeAnnulled ? {} : { estado: { [Op.ne]: "anulado" } };

  try {
    const projects = await Project.findAll({
      where,
      attributes: [
        "id",
        "nombreConvenio",
        "contraparte",
        "departamento",
        "provincia",
        "distrito",
        "ubigeo",
        "servicioPriorizado",
        "nombreIdeaProyecto",
        "cui",
        "ci",
        "firmaConvenio",
        "inicioConvenio",
        "numeroBeneficiarios",
        "montoInversion",
        "estado",
        "avance",
        "plazo",
        "plazoSeguimiento",
        "direccion",
        "modeloConvenio",
        "codigoOedi",
        "nivelGobierno",
        "alias",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener todos los proyectos" });
  }
};

// @desc    Delete a project by ID
// @route   DELETE /api/projects/delete/:id
// @access  Private
const delUserProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  console.log("proyecto a eliminar: ", projectId);

  const project = await Project.findOne({
    where: {
      id: projectId,
      userId: req.user.id, // ensures user owns the project
    },
  });

  if (!project) {
    res.status(404);
    console.log("Proyecto no encontrado o no autorizado.");
    throw new Error("Proyecto no encontrado o no autorizado.");
  }

  await project.destroy(); // triggers cascade delete
  console.log("✅ Proyecto eliminado en DB");

  res
    .status(200)
    .json({ id: projectId, message: "Proyecto eliminado correctamente." });
});

/**
 * Annul a project instead of deleting it (logical delete).
 * - Keeps codigoOedi history intact.
 * - Only owner can annul (as per current logic).
 */
const annulUserProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  //console.log("Proyecto a anular: ", projectId);

  const project = await Project.findOne({
    where: { id: projectId, userId: req.user.id },
  });

  if (!project) {
    res.status(404);
    throw new Error("Proyecto no encontrado o no autorizado.");
  }

  if (project.estado === "anulado") {
    // English: idempotent response if already annulled
    return res.status(200).json({
      id: projectId,
      estado: project.estado,
      message: "Proyecto ya se encontraba anulado.",
    });
  }

  project.estado = "anulado";
  await project.save();

  res.status(200).json({
    id: projectId,
    estado: project.estado,
    message: "Proyecto anulado correctamente.",
  });
});

/**
 * Assign project to a user
 * - Only admin or coordinator can assign
 * - Updates the userId of the project
 */

const assignProject = asyncHandler(async (req, res) => {
  const projectId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("userId is required in the request body.");
  }

  const project = await Project.findByPk(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Proyecto no encontrado.");
  }

  // Optionally, verify that the userId exists in the User table
  const user = await User.findByPk(userId);
  if (!user) {
    res.status(404);
    throw new Error("Usuario no encontrado.");
  }

  project.userId = userId;
  await project.save();

  res.status(200).json({
    id: projectId,
    userId: project.userId,
    message: "Proyecto asignado correctamente.",
  });
});

module.exports = {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  delUserProject,
  annulUserProject,
  getAllProjects,
  assignProject,
};
