// src/components/MapaConvenios.jsx
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDepartmentCounts } from "../../../utils/dashboardUtil";

const normalize = (str) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const MapaConvenios = ({ agreements }) => {
  const [geoData, setGeoData] = useState(null);

  // 1) Carga del GeoJSON
  useEffect(() => {
    fetch("/departamentos.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setGeoData(json))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  // 2) Mapa de nombre normalizado → count
  const convenioMap = useMemo(() => {
    const m = new Map();
    getDepartmentCounts(agreements).forEach(({ departamento, count }) => {
      m.set(normalize(departamento), count);
    });
    return m;
  }, [agreements]);

  // 3) Escala de color
  const getColor = (convenios) => {
    if (convenios > 20) return "#2ECC71";
    if (convenios > 10) return "#F1C40F";
    if (convenios > 5) return "#E67E22";
    if (convenios > 0) return "#E74C3C";
    return "#CCCCCC"; // color neutro para 0 convenios
  };

  // 4) Estilo de cada feature
  const styleFeature = (feature) => {
    const key = normalize(feature.properties.NOMBDEP);
    const count = convenioMap.get(key) ?? 0;
    return {
      fillColor: getColor(count),
      weight: 1,
      color: "white",
      fillOpacity: 0.7,
    };
  };

  // 5) Tooltip permanente
  const onEachFeature = (feature, layer) => {
    const nombre = feature.properties.NOMBDEP;
    const count = convenioMap.get(normalize(nombre)) ?? 0;
    layer.bindTooltip(`${nombre}: ${count}`, {
      permanent: false,
      direction: "center",
      className: "label-tooltip",
    });
  };

  // 6) Guard para no pintar hasta tener datos
  if (!geoData || !Array.isArray(geoData.features)) {
    return <p>Cargando mapa…</p>;
  }

  return (
    <div className="siget-card-style shadow-sm">
      <MapContainer
        center={[-9.19, -75.0152]}
        zoom={5}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <GeoJSON
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
};

export default MapaConvenios;
