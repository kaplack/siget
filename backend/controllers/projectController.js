const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");

// @desc    Crear nuevo proyecto
// @route   POST /api/projects
// @access  Public (puedes cambiarlo si usas auth)
const createProject = asyncHandler(async (req, res) => {
  try {
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

    console.log("Datos recibidos:", req.body);
    const userId = req.user.id; // Assumes user is authenticated and ID is available

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
      direccion,
      modeloConvenio,
      nivelGobierno,
      alias,
    });

    console.log("Proyecto creado:", newProject);

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    res.status(500).json({
      message: "Error al crear el proyecto",
      error: error.message,
    });
  }
});

// GET /api/projects/user
// Retrieves all projects assigned to the logged-in user
const getUserProjects = async (req, res) => {
  //console.log(req.user);
  try {
    const userId = req.user.id;

    const projects = await Project.findAll({
      where: { userId },
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
    "direccion",
    "modeloConvenio",
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

// @desc get all projects for admin
// @route /api/projects/delete/:id
// @access PRIVATE

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener todos los proyectos" });
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProject,
  updateProject,
  delUserProject,
  getAllProjects,
};
