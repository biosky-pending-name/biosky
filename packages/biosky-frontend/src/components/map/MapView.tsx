import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { fetchObservationsGeoJSON, fetchObservation, getImageUrl } from "../../services/api";
import type { Observation } from "../../services/types";
import styles from "./MapView.module.css";

export function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || isInitialized) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [-122.4194, 37.7749],
      zoom: 10,
    });

    mapInstance.addControl(new maplibregl.NavigationControl(), "bottom-right");

    mapInstance.on("load", () => {
      mapInstance.addSource("observations", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      mapInstance.addLayer({
        id: "clusters",
        type: "circle",
        source: "observations",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#22c55e",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            20,
            10,
            25,
            50,
            30,
            100,
            35,
          ],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0a0a0a",
        },
      });

      mapInstance.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "observations",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#0a0a0a",
        },
      });

      mapInstance.addLayer({
        id: "observation-points",
        type: "circle",
        source: "observations",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#22c55e",
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#0a0a0a",
        },
      });

      loadObservations(mapInstance);
      setIsInitialized(true);
    });

    mapInstance.on("click", "clusters", async (e) => {
      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0].properties?.cluster_id;
      const source = mapInstance.getSource("observations") as maplibregl.GeoJSONSource;
      try {
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const geometry = features[0].geometry;
        if (geometry.type === "Point") {
          mapInstance.easeTo({
            center: geometry.coordinates as [number, number],
            zoom,
          });
        }
      } catch {
        // Ignore cluster expansion errors
      }
    });

    mapInstance.on("click", "observation-points", async (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const props = feature.properties;
      const geometry = feature.geometry;
      if (geometry.type !== "Point") return;

      const result = await fetchObservation(props?.uri);
      if (!result) return;

      showPopup(mapInstance, result.observation, geometry.coordinates as [number, number]);
    });

    mapInstance.on("mouseenter", "clusters", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });
    mapInstance.on("mouseleave", "clusters", () => {
      mapInstance.getCanvas().style.cursor = "";
    });
    mapInstance.on("mouseenter", "observation-points", () => {
      mapInstance.getCanvas().style.cursor = "pointer";
    });
    mapInstance.on("mouseleave", "observation-points", () => {
      mapInstance.getCanvas().style.cursor = "";
    });

    mapInstance.on("moveend", () => {
      loadObservations(mapInstance);
    });

    map.current = mapInstance;

    return () => {
      mapInstance.remove();
    };
  }, [isInitialized]);

  return (
    <div className={styles.container}>
      <div ref={mapContainer} className={styles.map} />
    </div>
  );
}

async function loadObservations(map: maplibregl.Map) {
  const bounds = map.getBounds();
  try {
    const geojson = await fetchObservationsGeoJSON({
      minLat: bounds.getSouth(),
      minLng: bounds.getWest(),
      maxLat: bounds.getNorth(),
      maxLng: bounds.getEast(),
    });
    const source = map.getSource("observations") as maplibregl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    }
  } catch (error) {
    console.error("Failed to load observations:", error);
  }
}

function showPopup(
  map: maplibregl.Map,
  observation: Observation,
  coords: [number, number]
) {
  const imageHtml = observation.images[0]
    ? `<img src="${getImageUrl(observation.images[0])}" alt="${observation.scientificName}" />`
    : "";

  new maplibregl.Popup({ maxWidth: "300px" })
    .setLngLat(coords)
    .setHTML(
      `
      <div class="observation-popup" style="padding: 1rem;">
        ${imageHtml}
        <h3 style="font-size: 1rem; font-style: italic; color: #22c55e; margin-bottom: 0.25rem;">
          ${observation.scientificName || "Unknown species"}
        </h3>
        <div style="font-size: 0.875rem; color: #999; margin-bottom: 0.5rem;">
          by @${observation.observer.handle || observation.observer.did.slice(0, 20)}
        </div>
        <div style="font-size: 0.75rem; color: #666;">
          ${new Date(observation.eventDate).toLocaleDateString()}
          ${observation.verbatimLocality ? ` &bull; ${observation.verbatimLocality}` : ""}
        </div>
      </div>
    `
    )
    .addTo(map);
}
