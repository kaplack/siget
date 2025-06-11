const Activity = require("../models/activityModel");
const ActivityVersion = require("../models/activityVersionModel");
const Project = require("../models/projectModel");

/**
 * Creates a new activity and its initial version (base version 1)
 */
const createActivity = async (req, res) => {
  try {
    const {
      projectId,
      parentId = 0,
      nombre,
      orden,
      version, // objeto con los datos de la versión
    } = req.body;

    if (!projectId || !nombre || !version) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // 1. Create the activity
    const activity = await Activity.create({
      projectId,
      parentId,
      nombre,
      orden,
    });

    // 2. Create the version (base, nroVersion 1)
    const nuevaVersion = await ActivityVersion.create({
      activityId: activity.id,
      tipo: version.tipo || "base",
      nroVersion: version.nroVersion || 1,
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      plazo: version.plazo,
      avance: version.avance || 0,
      responsable: version.responsable || null,
      sustento: version.sustento || null,
      vigente: true,
    });

    res.status(201).json({
      activity,
      version: nuevaVersion,
    });
  } catch (error) {
    console.error("Error al crear actividad:", error);
    res.status(500).json({ message: "Error al crear actividad." });
  }
};

/**
 * Adds a new version to an existing activity
 */
const addActivityVersion = async (req, res) => {
  try {
    const {
      activityId,
      tipo, // 'base' o 'seguimiento'
      fechaInicio,
      fechaFin,
      plazo,
      avance = 0,
      responsable = null,
      sustento = null,
    } = req.body;

    if (!activityId || !tipo || !fechaInicio || !fechaFin || !plazo) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    // Contar versiones previas del mismo tipo
    const count = await ActivityVersion.count({
      where: { activityId, tipo },
    });

    // Desactivar versiones previas del mismo tipo
    await ActivityVersion.update(
      { vigente: false },
      { where: { activityId, tipo } }
    );

    // Crear nueva versión
    const nuevaVersion = await ActivityVersion.create({
      activityId,
      tipo,
      nroVersion: count + 1,
      fechaInicio,
      fechaFin,
      plazo,
      avance,
      responsable,
      sustento,
      vigente: true,
    });

    res.status(201).json({ version: nuevaVersion });
  } catch (error) {
    console.error("Error al agregar versión:", error);
    res.status(500).json({ message: "Error al agregar versión." });
  }
};

/**
 * Returns all activities for a given projectId with their latest version
 */
const getActivitiesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "projectId es requerido." });
    }

    const activities = await Activity.findAll({
      where: { projectId },
      include: [
        {
          model: ActivityVersion,
          as: "versions",
          where: { vigente: true },
          required: false, // Mostrar actividades aunque aún no tengan versiones
        },
      ],
      order: [["orden", "ASC"]],
    });

    res.status(200).json({ activities });
  } catch (error) {
    console.error("Error al obtener actividades:", error);
    res.status(500).json({ message: "Error al obtener actividades." });
  }
};

module.exports = {
  createActivity,
  addActivityVersion,
  getActivitiesByProject,
};
