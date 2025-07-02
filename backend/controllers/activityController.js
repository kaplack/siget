const Activity = require("../models/activityModel");
const ActivityVersion = require("../models/activityVersionModel");
const Project = require("../models/projectModel");

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
      tipo: "base",
      nroVersion: 0,
      fechaInicio: version.fechaInicio,
      fechaFin: version.fechaFin,
      plazo: version.plazo,
      avance: version.avance ?? 0,
      responsable: version.responsable || null,
      sustento: version.sustento || null,
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
        tipo: "base",
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
        tipo: "base",
        nroVersion: 0,
        vigente: true,
      },
    });

    if (drafts.length === 0) {
      return res.status(400).json({ message: "No draft versions found." });
    }

    const seguimientoVersions = [];

    for (const draft of drafts) {
      // Step 1: Update draft to become the baseline
      await draft.update({ nroVersion: 1 });

      // Step 2: Clone the new baseline into a tracking version
      const seguimiento = await ActivityVersion.create({
        ...draft.toJSON(),
        id: undefined, // prevent Sequelize from reusing the ID
        tipo: "seguimiento",
        nroVersion: 1,
        vigente: true,
      });

      seguimientoVersions.push(seguimiento);
    }

    await Project.update(
      { estado: "linea_base" },
      { where: { id: projectId } }
    );

    res.status(201).json({
      message: "Linea base establecida correctamente.",
      seguimientoVersions,
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

    const versionFilter = tipoVersion
      ? { tipo: tipoVersion, vigente: true }
      : { vigente: true };

    const activities = await Activity.findAll({
      where: { projectId },
      include: [
        {
          model: ActivityVersion,
          as: "versions",
          where: versionFilter,
          required: false,
        },
      ],
      order: [["id", "ASC"]],
    });

    const result = activities
      .filter((activity) => activity.versions.length > 0)
      .map((activity) => {
        const version = activity.versions[0];

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
          sustento: version.sustento ?? "",
          tipo: version.tipo ?? "",
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

    const version = await ActivityVersion.findOne({
      where: {
        activityId: id,
        tipo: "base",
        nroVersion: 0,
        vigente: true,
      },
    });

    if (!version) {
      return res.status(400).json({
        message:
          "Cannot delete: only base version (type 'base', version 0, vigente) is allowed.",
      });
    }

    await ActivityVersion.destroy({ where: { activityId: id } });
    await Activity.destroy({ where: { id } });

    res.status(200).json({ message: "Activity deleted successfully." });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({ message: "Error deleting activity." });
  }
};

module.exports = {
  createActivity,
  updateDraftActivity,
  setBaselineForProject,
  getActivitiesByProject,
  deleteActivity,
};
