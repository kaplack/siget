const Activity = require("../models/activityModel");
const ActivityVersion = require("../models/activityVersionModel");
const Project = require("../models/projectModel");

// POST /api/activities/:activityId/tracking
// Adds a new tracking version if a baseline exists
const addTrackingVersion = async (req, res) => {
  try {
    const { activityId } = req.params;
    const {
      nombre,
      parentId = 0,
      orden = 0,
      fechaInicio,
      fechaFin,
      plazo,
      avance = 0,
      predecesorId = 0,
      responsable = null,
      sustento = null,
    } = req.body;

    //baseline check
    const baseline = await ActivityVersion.findOne({
      where: { activityId, tipo: "base", nroVersion: 1 },
    });

    if (!baseline) {
      return res.status(400).json({ message: "Baseline version not found." });
    }

    // Check
    const count = await ActivityVersion.count({
      where: { activityId, tipo: "seguimiento" },
    });

    await ActivityVersion.update(
      { vigente: false },
      { where: { activityId, tipo: "seguimiento" } }
    );
    const nroVersion = count + 1;

    const newTracking = await ActivityVersion.create({
      activityId,
      nombre,
      parentId,
      orden,
      tipo: "seguimiento",
      nroVersion,
      fechaInicio,
      fechaFin,
      plazo,
      avance,
      responsable,
      sustento,
      predecesorId,
      vigente: true,
    });

    // Get projectId from activity
    const activity = await Activity.findByPk(activityId);
    const projectId = activity?.projectId;

    // 🟠 Si esta es la segunda (o más) versión de seguimiento Y el avance es real → cambiar estado a 'ejecucion'
    if (nroVersion >= 2 && avance > 0 && projectId) {
      const proyecto = await Project.findByPk(projectId);
      if (proyecto?.estado === "linea_base") {
        await proyecto.update({ estado: "ejecucion" });
      }
    }

    res.status(201).json({ version: newTracking });
  } catch (error) {
    console.error("Error adding tracking version:", error);
    res.status(500).json({ message: "Error adding tracking version." });
  }
};

module.exports = {
  addTrackingVersion,
};
