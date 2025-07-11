const { Project, Activity, ActivityBaseline } = require("../models");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const { calcularAvancePlanificado } = require("../utils/dashboardHelper");

const calcularAvanceGlobal = (proyectos) => {
  let totalPeso = 0;
  let avancePonderado = 0;

  for (const p of proyectos) {
    if (p.avance !== null && p.totalPeso > 0) {
      totalPeso += p.totalPeso;
      avancePonderado += p.avance * p.totalPeso;
    }
  }

  if (totalPeso === 0) {
    return {
      avanceGlobal: null,
      mensajeAvanceGlobal: "Plazos no definidos",
    };
  }

  return {
    avanceGlobal: +(avancePonderado / totalPeso).toFixed(2),
    mensajeAvanceGlobal: null,
  };
};

const getDashboard = async (req, res) => {
  console.log("entregando datos del getDashboard controller");
  try {
    // 1 Total number of projects
    const totalProjects = await Project.count();

    // 2 Total of signed projects (firmaConvenio is not null)
    const totalFirmados = await Project.count({
      where: {
        firmaConvenio: {
          [Sequelize.Op.not]: null,
        },
      },
    });

    // 3 Total sum of beneficiaries
    const totalBeneficiarios = await Project.sum("numeroBeneficiarios");

    // 4 Total investment amount
    const totalInversion = await Project.sum("montoInversion");

    // 5 Avance por Proyecto

    const proyectosConAvance = await Project.findAll({
      attributes: ["id", "alias", "avance", "plazoSeguimiento"],
      where: {
        estado: {
          [Op.notIn]: ["borrador", "linea_base"],
        },
      },
    });

    const avancePorProyecto = proyectosConAvance.map((p) => ({
      projectId: p.id,
      alias: p.alias,
      avance: p.avance,
      totalPeso: p.plazoSeguimiento || 0,
    }));

    // 6 Avance Global
    const { avanceGlobal, mensajeAvanceGlobal } =
      calcularAvanceGlobal(avancePorProyecto);

    // 7 Projects grouped by status
    const proyectosPorEstado = await Project.findAll({
      attributes: [
        "estado",
        [Sequelize.fn("COUNT", Sequelize.col("estado")), "cantidad"],
      ],
      group: ["estado"],
    });

    // 8 Acuerdos
    const agreements = await Project.findAll({
      attributes: [
        "id",
        "alias",
        "firmaConvenio",
        "contraparte",
        "nombreConvenio",
        "servicioPriorizado",
        "estado",
        "direccion",
      ],
    });

    // 9 AVANCE PLANIFICADO
    const actividadesBase = await ActivityBaseline.findAll({
      where: {
        nroVersion: 1, // usamos solo línea base establecida
        vigente: true,
      },
      include: {
        model: Activity,
        as: "activity",
        include: {
          model: Project,
          as: "project",
          attributes: ["id", "direccion", "alias"],
          where: {
            estado: {
              [Op.notIn]: ["borrador", "linea_base"],
            },
          },
        },
      },
      attributes: ["fechaInicio", "fechaFin", "plazo"],
    });

    // Mapear datos a formato plano
    const actividades = actividadesBase.map((av) => ({
      fechaInicio: av.fechaInicio,
      fechaFin: av.fechaFin,
      plazo: av.plazo,
      direccion: av.activity?.project?.direccion || "Sin Dirección",
      proyecto: av.activity?.project?.alias || "Sin Nombre",
      projectId: av.activity?.project?.id || null,
    }));

    const avancePlanificado = calcularAvancePlanificado(actividades);

    // 10

    const avanceTabla = avancePlanificado.avancePorProyecto.map(
      (planificado) => {
        const real = avancePorProyecto.find(
          (r) => r.projectId === planificado.projectId
        );

        const avancePlan = planificado.avancePonderado ?? 0;
        const avanceReal = real?.avance ?? 0;

        const desviacion = +(avanceReal - avancePlan).toFixed(2);

        let semaforo = "verde";
        if (desviacion < -15) semaforo = "rojo";
        else if (desviacion < -5) semaforo = "amarillo";

        return {
          projectId: planificado.projectId,
          alias: planificado.alias,
          direccion: planificado.direccion,
          estado:
            agreements.find((a) => a.id === planificado.projectId)?.estado ??
            "sin seguimiento",
          avancePlanificado: +avancePlan.toFixed(2),
          avanceReal: +avanceReal.toFixed(2),
          desviacion,
          semaforo,
        };
      }
    );

    // RESULTADO FINAL

    res.json({
      totalProjects,
      totalFirmados,
      totalBeneficiarios,
      totalInversion,
      avanceGlobal,
      mensajeAvanceGlobal,
      avancePorProyecto,

      proyectosPorEstado,
      agreements,

      avancePlanificado,
      avanceTabla,
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    res.status(500).json({ error: "Error loading dashboard data" });
  }
};

const getAgreement = async (req, res) => {
  res.json({
    msn: "hola",
  });
};

module.exports = { getDashboard, getAgreement };
