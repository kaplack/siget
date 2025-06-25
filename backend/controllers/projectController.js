const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");

// @desc    Crear nuevo proyecto
// @route   POST /api/projects
// @access  Public (puedes cambiarlo si usas auth)
const createProject = asyncHandler(async (req, res) => {
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
  } = req.body;

  console.log(req.body);
  const userId = req.user.id; // Asumiendo que el usuario está autenticado y su ID está disponible

  // Validación básica
  if (
    !nombreConvenio ||
    !contraparte ||
    !departamento ||
    !provincia ||
    !distrito ||
    !ubigeo ||
    !servicioPriorizado ||
    !nombreIdeaProyecto ||
    !numeroBeneficiarios ||
    !montoInversion ||
    !userId
  ) {
    res.status(400);
    throw new Error("Todos los campos son obligatorios");
  }

  const newProject = await Project.create({
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
  });

  res.status(201).json(newProject);
});

// GET /api/projects/user
// Retrieves all projects assigned to the logged-in user
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await Project.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!projects || projects.length === 0) {
      return res
        .status(404)
        .json({ message: "No projects found for this user." });
    }

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
    const project = await Project.findByPk(id);

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

module.exports = {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
};
