const { Project, Activity, ActivityVersion } = require("../models");

// POST /api/activities
// Creates a new activity and its initial draft version
const createActivity = async (req, res) => {
  try {
    const { projectId, version } = req.body;

    if (!projectId || !version || !version.nombre) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const activity = await Activity.create({ projectId });

    const draftVersion = await ActivityVersion.create({
      activityId: activity.id,
      nombre: version.nombre,
      parentId: version.parentId ?? 0,
      orden: version.orden ?? 0,
      nroVersion: 0, // draft = version 0
      tipoVersion: "base", // now distinguishes baseline/tracking
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      plazo: version.plazo,
      responsable: version.responsable || "", // no NULL
      comentario: version.comentario || "",
      predecesorId: version.predecesorId || "",
      avance: 0, // baseline has 0 progress
      sustento: "", // baseline has no justification
      medidasCorrectivas: version.medidasCorrectivas || "",
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

    const draft = await ActivityVersion.findOne({
      where: {
        activityId,
        tipoVersion: "base",
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
    const drafts = await ActivityVersion.findAll({
      include: [{ model: Activity, as: "activity", where: { projectId } }],
      where: {
        tipoVersion: "base",
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
      const tracking = await ActivityVersion.create({
        activityId: draft.activityId,

        nombre: draft.nombre,
        parentId: draft.parentId,
        orden: draft.orden,
        nroVersion: 1,
        tipoVersion: "seguimiento",
        fechaInicio: draft.fechaInicio,
        fechaFin: draft.fechaFin,
        plazo: draft.plazo,
        responsable: draft.responsable,
        comentario: draft.comentario,
        predecesorId: draft.predecesorId,
        avance: 0,
        sustento: "", // default for new tracking records
        vigente: true,
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

    //console.log(projectId, tipoVersion);
    // Select table and alias depending on tipoVersion
    // let includeModel = ActivityBaseline;
    // let alias = "baselines";

    // if (tipoVersion === "seguimiento") {
    //   includeModel = ActivityTracking;
    //   alias = "trackings";
    // }

    const activities = await Activity.findAll({
      where: { projectId },
      include: [
        {
          model: ActivityVersion,
          as: "versions",
          where: { tipoVersion, vigente: true },
          required: false,
        },
      ],
      order: [["id", "ASC"]],
    });

    const result = activities
      .filter((act) => act.versions.length > 0)
      .map((act) => {
        const version = act.versions[0];

        return {
          id: act.id,
          parentId: version.parentId,
          orden: version.orden,
          predecesorId: version.predecesorId ?? null,
          nombre: version.nombre ?? "",
          fechaInicio: version.fechaInicio ?? null,
          fechaFin: version.fechaFin ?? null,
          responsable: version.responsable ?? "",
          avance: version.avance ?? 0,
          plazo: version.plazo,
          sustento: version.sustento ?? "", // will only exist in seguimiento
          tipo: tipoVersion ?? "",
          comentario: version.comentario ?? null,
          medidasCorrectivas: version.medidasCorrectivas ?? "",
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
    const version = await ActivityVersion.findOne({
      where: {
        activityId: id,
        tipoVersion: "base",
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
    await ActivityVersion.destroy({ where: { activityId: id } });

    // Delete the activity itself
    await Activity.destroy({ where: { id } });

    res.status(200).json({ message: "Actividad Eliminada." });
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
