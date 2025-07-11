const Activity = require("../models/activityModel");
const { ActivityBaseline, ActivityTracking } = require("../models");

const Project = require("../models/projectModel");
const {
  updateParentProgress,
  updateProjectProgress,
} = require("../utils/avanceUtils");

// POST /api/activities/:activityId/tracking
// Adds a new tracking version if a baseline exists
// POST /api/activities/:activityId/tracking
const addTrackingVersion = async (req, res) => {
  try {
    const { activityId } = req.params;
    const {
      fechaInicio,
      fechaFin,
      plazo,
      avance = 0,
      sustento = null,
      comentario = null,
    } = req.body;

    // Validate that baseline exists
    const baseline = await ActivityBaseline.findOne({
      where: { activityId, nroVersion: 1 },
    });

    if (!baseline) {
      return res.status(400).json({ message: "Baseline version not found." });
    }

    // Get activity and project
    const activity = await Activity.findByPk(activityId);
    const project = await Project.findByPk(activity.projectId);

    // Validate project has required dates
    if (!project.firmaConvenio || !project.inicioConvenio) {
      return res.status(400).json({
        message:
          "El proyecto debe tener registradas la fecha de firma e inicio de convenio antes de continuar.",
      });
    }

    // Continue with seguimiento creation
    const count = await ActivityTracking.count({
      where: { activityId },
    });

    await ActivityTracking.update(
      { vigente: false },
      { where: { activityId } }
    );

    const nroVersion = count + 1;

    const lastVersion = await ActivityTracking.findOne({
      where: { activityId },
      order: [["nroVersion", "DESC"]],
    });

    const newTracking = await ActivityTracking.create({
      activityId,
      nombre: lastVersion?.nombre ?? "Sin nombre",
      parentId: lastVersion?.parentId ?? 0,
      orden: lastVersion?.orden ?? 0,
      predecesorId: lastVersion?.predecesorId ?? null,
      responsable: lastVersion?.responsable ?? null,
      comentario: req.body.hasOwnProperty("comentario")
        ? req.body.comentario
        : lastVersion?.comentario ?? null,
      sustento: req.body.hasOwnProperty("sustento")
        ? sustento
        : lastVersion?.sustento ?? null,
      fechaInicio: req.body.hasOwnProperty("fechaInicio")
        ? fechaInicio
        : lastVersion?.fechaInicio,
      fechaFin: req.body.hasOwnProperty("fechaFin")
        ? fechaFin
        : lastVersion?.fechaFin,
      plazo: req.body.hasOwnProperty("plazo") ? plazo : lastVersion?.plazo,
      avance: req.body.hasOwnProperty("avance")
        ? avance
        : lastVersion?.avance ?? 0,
      nroVersion,
      vigente: true,
    });

    // Update project to 'ejecucion' if conditions are met
    if (nroVersion >= 2 && avance > 0 && project) {
      if (project.estado === "linea_base") {
        await project.update({ estado: "ejecucion" });
      }
    }

    res.status(201).json({ version: newTracking });
  } catch (error) {
    console.error("❌ Error adding tracking version:", error);
    res.status(500).json({ message: "Error adding tracking version." });
  }
};

// NO SE UTILIZA POR EL MOMENTO 09/07/2025
const updateActivityProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { avance } = req.body;

    const activityVersion = await ActivityTracking.findOne({
      where: {
        id,
        vigente: true,
      },
      include: {
        model: Activity,
        include: Project,
      },
    });

    if (!activityVersion) {
      return res.status(404).json({
        message:
          "Actividad no válida o no editable (requiere versión seguimiento vigente).",
      });
    }

    const project = activityVersion.activity?.Project;

    if (!project?.firmaConvenio || !project?.inicioConvenio) {
      return res.status(400).json({
        message:
          "El proyecto debe tener registradas la fecha de firma e inicio de convenio antes de registrar avance.",
      });
    }

    await ActivityTracking.update({ avance });

    await updateParentProgress(id);
    await updateProjectProgress(activityVersion);

    res.json({ message: "Avance actualizado correctamente." });
  } catch (error) {
    console.error("Error al actualizar avance:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

module.exports = {
  addTrackingVersion,
  updateActivityProgress,
};
