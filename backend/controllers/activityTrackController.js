const Activity = require("../models/activityModel");
const ActivityVersion = require("../models/activityVersionModel");
const Project = require("../models/projectModel");

// POST /api/activities/:activityId/tracking
// Adds a new tracking version if a baseline exists
const addTrackingVersion = async (req, res) => {
  try {
    const { activityId } = req.params;
    const {
      fechaInicio,
      fechaFin,
      plazo,
      avance = 0,
      sustento = null,
    } = req.body;

    // Validate that baseline exists
    const baseline = await ActivityVersion.findOne({
      where: { activityId, tipo: "base", nroVersion: 1 },
    });

    if (!baseline) {
      return res.status(400).json({ message: "Baseline version not found." });
    }

    // Get current seguimiento count
    const count = await ActivityVersion.count({
      where: { activityId, tipo: "seguimiento" },
    });

    // Mark all previous seguimiento versions as not vigente
    await ActivityVersion.update(
      { vigente: false },
      { where: { activityId, tipo: "seguimiento" } }
    );

    const nroVersion = count + 1;

    // Get the last vigente version (base or seguimiento)
    const lastVersion = await ActivityVersion.findOne({
      where: { activityId, vigente: false },
      order: [["nroVersion", "DESC"]],
    });

    const trackingData = {
      activityId,
      nombre: lastVersion?.nombre ?? "Sin nombre",
      parentId: lastVersion?.parentId ?? 0,
      orden: lastVersion?.orden ?? 0,
      predecesorId: lastVersion?.predecesorId ?? null,
      responsable: lastVersion?.responsable ?? null,
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
      tipo: "seguimiento",
      nroVersion,
      vigente: true,
    };

    const newTracking = await ActivityVersion.create(trackingData);

    // Update project to 'ejecucion' if conditions are met
    const activity = await Activity.findByPk(activityId);
    const projectId = activity?.projectId;

    if (nroVersion >= 2 && avance > 0 && projectId) {
      const proyecto = await Project.findByPk(projectId);
      if (proyecto?.estado === "linea_base") {
        await proyecto.update({ estado: "ejecucion" });
      }
    }

    res.status(201).json({ version: newTracking });
  } catch (error) {
    console.error("❌ Error adding tracking version:", error);
    res.status(500).json({ message: "Error adding tracking version." });
  }
};

module.exports = {
  addTrackingVersion,
};
