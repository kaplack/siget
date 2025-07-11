const {
  Project,
  Activity,
  ActivityBaseline,
  ActivityTracking,
} = require("../models");

// POST /api/activities
// Creates a new activity and its initial draft version
const createActivity = async (req, res) => {
  try {
    const { projectId, version } = req.body;

    if (!projectId || !version || !version.nombre) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const activity = await Activity.create({ projectId });

    const draftVersion = await ActivityBaseline.create({
      activityId: activity.id,
      nombre: version.nombre,
      parentId: version.parentId ?? 0,
      orden: version.orden ?? 0,
      nroVersion: 0,
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      plazo: version.plazo,
      responsable: version.responsable || null,
      comentario: version.comentario || null,
      predecesorId: version.predecesorId || null,
      vigente: true,
    });

    res.status(201).json({ activity, version: draftVersion });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({ message: "Error creating activity." });
  }
};

// PATCH /api/activities/draft/:activityId
// Updates the draft version of an activity
// PATCH /api/activities/:activityId/draft
const updateDraftActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const updates = req.body;

    const draft = await ActivityBaseline.findOne({
      where: {
        activityId,
        nroVersion: 0,
        vigente: true,
      },
    });

    if (!draft) {
      return res
        .status(400)
        .json({ message: "Solo puede modificarse la versión base borrador." });
    }

    await draft.update(updates);

    res.status(200).json({
      message: "Versión base actualizada correctamente.",
      version: draft,
    });
  } catch (error) {
    console.error("Error actualizando versión base:", error);
    res.status(500).json({ message: "Error al actualizar versión base." });
  }
};

// POST /api/activities/project/:projectId/set-baseline
// Sets the baseline by updating the draft and cloning it for tracking
const setBaselineForProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch all draft versions for the project
    const drafts = await ActivityBaseline.findAll({
      include: [{ model: Activity, as: "activity", where: { projectId } }],
      where: {
        nroVersion: 0,
        vigente: true,
      },
    });

    if (drafts.length === 0) {
      return res.status(400).json({ message: "No draft versions found." });
    }

    const trackingVersions = [];

    for (const draft of drafts) {
      // Step 1: Update draft to become baseline (nroVersion = 1)
      await draft.update({ nroVersion: 1 });

      // Step 2: Clone baseline into tracking table (tipo: seguimiento)
      const tracking = await ActivityTracking.create({
        activityId: draft.activityId,
        nroVersion: 1,
        vigente: true,
        nombre: draft.nombre,
        parentId: draft.parentId,
        orden: draft.orden,
        fechaInicio: draft.fechaInicio,
        fechaFin: draft.fechaFin,
        plazo: draft.plazo,
        avance: 0, // initial progress
        responsable: draft.responsable,
        comentario: draft.comentario,
        predecesorId: draft.predecesorId,
        sustento: null,
      });

      trackingVersions.push(tracking);
    }

    // Update project state
    await Project.update(
      { estado: "linea_base" },
      { where: { id: projectId } }
    );

    res.status(201).json({
      message: "Linea base establecida correctamente.",
      seguimientoVersions: trackingVersions,
    });
  } catch (error) {
    console.error("Error setting baseline:", error);
    res.status(500).json({ message: "Error setting baseline for project." });
  }
};

// GET /api/activities/project/:projectId/:tipoVersion?
// Returns all activities of a project with the specified version type (default: vigente=true)
const getActivitiesByProject = async (req, res) => {
  try {
    const { projectId, tipoVersion } = req.params;

    console.log(projectId, tipoVersion);
    // Select table and alias depending on tipoVersion
    let includeModel = ActivityBaseline;
    let alias = "baselines";

    if (tipoVersion === "seguimiento") {
      includeModel = ActivityTracking;
      alias = "trackings";
    }

    const activities = await Activity.findAll({
      where: { projectId },
      include: [
        {
          model: includeModel,
          as: alias,
          where: { vigente: true },
          required: false,
        },
      ],
      order: [["id", "ASC"]],
    });

    const result = activities
      .filter((activity) => activity[alias].length > 0)
      .map((activity) => {
        const version = activity[alias][0];

        return {
          id: activity.id,
          parentId: version.parentId,
          orden: version.orden,
          predecesorId: version.predecesorId ?? null,
          nombre: version.nombre ?? "",
          fechaInicio: version.fechaInicio ?? null,
          fechaFin: version.fechaFin ?? null,
          responsable: version.responsable ?? "",
          avance: version.avance ?? 0,
          plazo: version.plazo ?? 0,
          sustento: version.sustento ?? "", // will only exist in seguimiento
          tipo: tipoVersion ?? "",
          comentario: version.comentario ?? null,
        };
      });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Error fetching activities." });
  }
};

// DELETE /api/activities/:id
// Deletes an activity only if its version is base (tipo = "base", nroVersion = 0, vigente = true)
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the baseline draft version exists
    const version = await ActivityBaseline.findOne({
      where: {
        activityId: id,
        nroVersion: 0,
        vigente: true,
      },
    });

    if (!version) {
      return res.status(400).json({
        message:
          "Cannot delete: only baseline draft version (nroVersion = 0, vigente) is allowed.",
      });
    }

    // Delete all baselines and tracking versions related to this activity
    await ActivityBaseline.destroy({ where: { activityId: id } });
    await ActivityTracking.destroy({ where: { activityId: id } });

    // Delete the activity itself
    await Activity.destroy({ where: { id } });

    res.status(200).json({ message: "Activity deleted successfully." });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Error deleting activity." });
  }
};

const deleteAllActivitiesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Elimina todas las actividades del proyecto (versions se eliminan en cascada)
    await Activity.destroy({ where: { projectId } });

    res.status(200).json({
      message:
        "Todas las actividades del proyecto fueron eliminadas correctamente.",
    });
  } catch (err) {
    console.error("❌ Error al eliminar actividades del proyecto:", err);
    res.status(500).json({
      message: "Error interno al eliminar actividades del proyecto.",
    });
  }
};

module.exports = {
  createActivity,
  updateDraftActivity,
  setBaselineForProject,
  getActivitiesByProject,
  deleteActivity,
  deleteAllActivitiesByProject,
};
