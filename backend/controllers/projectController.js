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
    !cui ||
    !ci ||
    !firmaConvenio ||
    !inicioConvenio ||
    !numeroBeneficiarios ||
    !montoInversion
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
  });

  res.status(201).json(newProject);
});

module.exports = {
  createProject,
};
