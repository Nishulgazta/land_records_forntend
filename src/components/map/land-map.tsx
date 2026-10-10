"use client";

import { useEffect, useRef } from "react";
import {
  AttributionControl,
  GeoJSONSource,
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
  type ExpressionSpecification,
  type LayerSpecification,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { BasemapId, Parcel } from "@/lib/types";
import type { LngLat, MeasurementResult, MeasureTool } from "@/lib/types-gis";
import {
  CLASSIFICATION_COLORS,
  TERRAIN_SOURCE_ID,
  TERRAIN_TILES,
  basemapStyle,
} from "@/lib/gis/basemaps";
import {
  boundsForParcels,
  geometryBounds,
  parcelsToFeatureCollection,
} from "@/lib/gis/parcel-features";
import {
  bearingDegrees,
  pathLengthMeters,
  polygonAreaSquareMeters,
  polygonPerimeterMeters,
} from "@/lib/gis/geo";

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).toString());

const SRC_PARCELS = "parcels";
const SRC_MEASURE = "measure";
const LAYER_FILL = "parcels-fill";
const LAYER_LINE = "parcels-line";
const LAYER_EXTRUDE = "parcels-extrude";
const LAYER_MEASURE_LINE = "measure-line";
const LAYER_MEASURE_POLYGON = "measure-polygon";
const LAYER_MEASURE_POINTS = "measure-points";

const CLASSIFICATION_EXPRESSION = [
  "match",
  ["get", "classification"],
  ...Object.entries(CLASSIFICATION_COLORS).flatMap(([name, color]) => [name, color]),
  "#9ca3af",
] as unknown as ExpressionSpecification;

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function measureCollections(points: LngLat[], tool: MeasureTool) {
  const pointsCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: points.map((point, index) => ({
      type: "Feature",
      id: index,
      properties: { index },
      geometry: { type: "Point", coordinates: [point.lng, point.lat] },
    })),
  };

  const lineCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features:
      points.length >= 2
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: points.map((point) => [point.lng, point.lat]),
              },
            },
          ]
        : [],
  };

  const polygonCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features:
      tool === "area" && points.length >= 3
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [
                  [
                    ...points.map((point) => [point.lng, point.lat]),
                    [points[0].lng, points[0].lat],
                  ],
                ],
              },
            },
          ]
        : [],
  };

  return { pointsCollection, lineCollection, polygonCollection };
}

export interface LandMapProps {
  parcels: Parcel[];
  basemap: BasemapId;
  pitch?: number;
  terrain?: { enabled: boolean; exaggeration: number } | null;
  extrusion?: boolean;
  selectedId?: string | null;
  focusParcelId?: string | null;
  fitAllSignal?: number;
  measureTool?: MeasureTool;
  measureResetSignal?: number;
  onSelect?: (parcel: Parcel | null) => void;
  onCursor?: (position: LngLat | null) => void;
  onMeasurement?: (result: MeasurementResult | null) => void;
  className?: string;
}

interface RuntimeContext {
  parcels: Parcel[];
  basemap: BasemapId;
  terrain: LandMapProps["terrain"];
  extrusion: boolean;
  measureTool: MeasureTool;
  selectedId: string | null;
  onSelect?: (parcel: Parcel | null) => void;
  onCursor?: (position: LngLat | null) => void;
  onMeasurement?: (result: MeasurementResult | null) => void;
}

export default function LandMap(initialProps: LandMapProps) {
  const {
    parcels,
    basemap,
    pitch = 0,
    terrain = null,
    extrusion = false,
    selectedId = null,
    focusParcelId = null,
    fitAllSignal = 0,
    measureTool = "none",
    measureResetSignal = 0,
    onSelect,
    onCursor,
    onMeasurement,
    className,
  } = initialProps;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const contextRef = useRef<RuntimeContext | null>(null);
  const measurePointsRef = useRef<LngLat[]>([]);
  const selectedIdRef = useRef<string | null>(selectedId);
  const didFitAllRef = useRef(false);

  useEffect(() => {
    contextRef.current = {
      parcels,
      basemap,
      terrain: terrain ?? null,
      extrusion,
      measureTool,
      selectedId: selectedId ?? null,
      onSelect,
      onCursor,
      onMeasurement,
    };
  }, [
    parcels,
    basemap,
    terrain,
    extrusion,
    measureTool,
    selectedId,
    onSelect,
    onCursor,
    onMeasurement,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const context = () => contextRef.current!;

    const allBounds = boundsForParcels(context().parcels);
    const center: [number, number] = allBounds
      ? [(allBounds.west + allBounds.east) / 2, (allBounds.south + allBounds.north) / 2]
      : [80.5, 16.2];

    const map = new MapLibreMap({
      container,
      style: basemapStyle(context().basemap) as StyleSpecification | string,
      center,
      zoom: 8,
      pitch: initialProps.pitch ?? 0,
      attributionControl: false,
      maxPitch: 75,
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new ScaleControl({ maxWidth: 110, unit: "metric" }), "bottom-left");
    map.addControl(new AttributionControl({ compact: true }), "bottom-right");

    const applyParcelData = () => {
      const source = map.getSource(SRC_PARCELS) as GeoJSONSource | undefined;
      if (source) source.setData(parcelsToFeatureCollection(context().parcels));
    };

    const applyTerrain = () => {
      if (!map.isStyleLoaded()) return;
      const settings = context().terrain;
      if (settings?.enabled) {
        if (!map.getSource(TERRAIN_SOURCE_ID)) {
          map.addSource(TERRAIN_SOURCE_ID, {
            type: "raster-dem",
            tiles: TERRAIN_TILES,
            encoding: "terrarium",
            tileSize: 256,
            maxzoom: 15,
          });
        }
        map.setTerrain({
          source: TERRAIN_SOURCE_ID,
          exaggeration: settings.exaggeration,
        });
        map.setSky({
          "sky-color": "#8fb8d8",
          "horizon-color": "#e6eef2",
          "fog-color": "#dde6ea",
          "fog-ground-blend": 0.55,
          "horizon-fog-blend": 0.5,
          "sky-horizon-blend": 0.6,
          "atmosphere-blend": 0.6,
        });
      } else {
        map.setTerrain(null);
        map.setSky({});
      }
    };

    const applyExtrusion = () => {
      if (map.getLayer(LAYER_EXTRUDE)) {
        map.setLayoutProperty(
          LAYER_EXTRUDE,
          "visibility",
          context().extrusion ? "visible" : "none",
        );
      }
    };

    const renderMeasure = () => {
      const tool = context().measureTool;
      const points = measurePointsRef.current;
      const { pointsCollection, lineCollection, polygonCollection } = measureCollections(
        points,
        tool,
      );
      (map.getSource(SRC_MEASURE + "-points") as GeoJSONSource | undefined)?.setData(
        pointsCollection,
      );
      (map.getSource(SRC_MEASURE + "-line") as GeoJSONSource | undefined)?.setData(
        lineCollection,
      );
      (map.getSource(SRC_MEASURE + "-polygon") as GeoJSONSource | undefined)?.setData(
        polygonCollection,
      );

      const onMeasurement = context().onMeasurement;
      if (!onMeasurement) return;
      if (tool === "none" || points.length === 0) {
        onMeasurement(null);
        return;
      }
      const ring = [
        ...points.map((point) => [point.lng, point.lat]),
        [points[0].lng, points[0].lat],
      ];
      const last = points[points.length - 1];
      const previous = points[points.length - 2];
      onMeasurement({
        tool,
        vertices: points,
        distanceMeters: points.length >= 2 ? pathLengthMeters(points) : null,
        areaSquareMeters:
          tool === "area" && points.length >= 3 ? polygonAreaSquareMeters([ring]) : null,
        perimeterMeters:
          tool === "area" && points.length >= 3 ? polygonPerimeterMeters([ring]) : null,
        lastSegmentBearing: last && previous ? bearingDegrees(previous, last) : null,
        finished: tool === "area" ? points.length >= 3 : points.length >= 2,
      });
    };

    const addLayers = () => {
      if (!map.getSource(SRC_PARCELS)) {
        map.addSource(SRC_PARCELS, {
          type: "geojson",
          data: parcelsToFeatureCollection(context().parcels),
          promoteId: "id",
        });
      }

      if (!map.getLayer(LAYER_FILL)) {
        const fill: LayerSpecification = {
          id: LAYER_FILL,
          type: "fill",
          source: SRC_PARCELS,
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#0f6f4a",
              CLASSIFICATION_EXPRESSION,
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              0.85,
              ["boolean", ["feature-state", "hover"], false],
              0.7,
              0.48,
            ],
          },
        };
        map.addLayer(fill);
      }

      if (!map.getLayer(LAYER_LINE)) {
        const line: LayerSpecification = {
          id: LAYER_LINE,
          type: "line",
          source: SRC_PARCELS,
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#083d29",
              "#ffffff",
            ],
            "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.4, 1],
            "line-opacity": 0.9,
          },
        };
        map.addLayer(line);
      }

      if (!map.getLayer(LAYER_EXTRUDE)) {
        const extrude: LayerSpecification = {
          id: LAYER_EXTRUDE,
          type: "fill-extrusion",
          source: SRC_PARCELS,
          layout: {
            visibility: context().extrusion ? "visible" : "none",
          },
          paint: {
            "fill-extrusion-color": CLASSIFICATION_EXPRESSION,
            "fill-extrusion-height": ["+", 12, ["*", ["get", "areaHectares"], 6]],
            "fill-extrusion-opacity": 0.82,
          },
        };
        map.addLayer(extrude);
      }

      if (!map.getSource(SRC_MEASURE + "-polygon")) {
        map.addSource(SRC_MEASURE + "-polygon", { type: "geojson", data: emptyCollection() });
        map.addSource(SRC_MEASURE + "-line", { type: "geojson", data: emptyCollection() });
        map.addSource(SRC_MEASURE + "-points", { type: "geojson", data: emptyCollection() });

        const polygon: LayerSpecification = {
          id: LAYER_MEASURE_POLYGON,
          type: "fill",
          source: SRC_MEASURE + "-polygon",
          paint: { "fill-color": "#0f6f4a", "fill-opacity": 0.16 },
        };
        const measureLine: LayerSpecification = {
          id: LAYER_MEASURE_LINE,
          type: "line",
          source: SRC_MEASURE + "-line",
          paint: {
            "line-color": "#0f6f4a",
            "line-width": 2,
            "line-dasharray": [2, 1.5],
          },
        };
        const pointsLayer: LayerSpecification = {
          id: LAYER_MEASURE_POINTS,
          type: "circle",
          source: SRC_MEASURE + "-points",
          paint: {
            "circle-color": "#ffffff",
            "circle-radius": 4.5,
            "circle-stroke-color": "#0f6f4a",
            "circle-stroke-width": 2,
          },
        };
        map.addLayer(polygon);
        map.addLayer(measureLine);
        map.addLayer(pointsLayer);
      }

      applyExtrusion();
    };

    const onStyleLoad = () => {
      addLayers();
      applyParcelData();
      applyTerrain();
      renderMeasure();
      if (!didFitAllRef.current && allBounds) {
        didFitAllRef.current = true;
        map.fitBounds(
          [
            [allBounds.west, allBounds.south],
            [allBounds.east, allBounds.north],
          ],
          { padding: 48, maxZoom: 12.5, duration: 0 },
        );
      }
    };

    map.on("style.load", onStyleLoad);

    const setFeatureState = (
      id: string | null,
      key: "selected" | "hover",
      value: boolean,
    ) => {
      if (!id || !map.getSource(SRC_PARCELS)) return;
      try {
        map.setFeatureState({ source: SRC_PARCELS, id }, { [key]: value });
      } catch {
        /* feature not yet ready */
      }
    };

    const select = (id: string | null) => {
      setFeatureState(selectedIdRef.current, "selected", false);
      selectedIdRef.current = id;
      setFeatureState(id, "selected", true);
      const parcel = id ? context().parcels.find((candidate) => candidate.id === id) ?? null : null;
      context().onSelect?.(parcel);
    };

    map.on("click", (event) => {
      if (context().measureTool !== "none") {
        measurePointsRef.current = [
          ...measurePointsRef.current,
          { lng: event.lngLat.lng, lat: event.lngLat.lat },
        ];
        renderMeasure();
        return;
      }
      const features = map.queryRenderedFeatures(event.point, { layers: [LAYER_FILL] });
      const first = features[0];
      const id = first ? String(first.id ?? first.properties?.id ?? "") : "";
      select(id || null);
    });

    let hoveredId: string | null = null;
    map.on("mousemove", (event) => {
      context().onCursor?.({ lng: event.lngLat.lng, lat: event.lngLat.lat });
      if (context().measureTool !== "none") {
        map.getCanvas().style.cursor = "crosshair";
        return;
      }
      const features = map.queryRenderedFeatures(event.point, { layers: [LAYER_FILL] });
      const first = features[0];
      const id = first ? String(first.id ?? first.properties?.id ?? "") : "";
      if (id !== hoveredId) {
        setFeatureState(hoveredId, "hover", false);
        hoveredId = id || null;
        setFeatureState(hoveredId, "hover", true);
      }
      map.getCanvas().style.cursor = id ? "pointer" : "";
    });

    map.on("mouseout", () => {
      setFeatureState(hoveredId, "hover", false);
      hoveredId = null;
      context().onCursor?.(null);
    });

    map.on("error", (event) => {
      const message = event.error instanceof Error ? event.error.message : String(event.error);
      if (/terrain|dem/i.test(message)) return;
      console.error("[bhumi] map error", message);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Only run this life-cycle effect once. External changes flow through the
    // dedicated effects below, which read latest props via contextRef/effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    (map.getSource(SRC_PARCELS) as GeoJSONSource | undefined)?.setData(
      parcelsToFeatureCollection(parcels),
    );
  }, [parcels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(basemapStyle(basemap) as StyleSpecification | string);
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ pitch: pitch ?? 0, duration: 500 });
  }, [pitch]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const settings = terrain;
    if (settings?.enabled) {
      if (!map.getSource(TERRAIN_SOURCE_ID)) {
        map.addSource(TERRAIN_SOURCE_ID, {
          type: "raster-dem",
          tiles: TERRAIN_TILES,
          encoding: "terrarium",
          tileSize: 256,
          maxzoom: 15,
        });
      }
      map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: settings.exaggeration });
    } else {
      map.setTerrain(null);
      try {
        map.setSky({});
      } catch {
        /* sky not supported */
      }
    }
  }, [terrain]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.getLayer(LAYER_EXTRUDE)) {
      map.setLayoutProperty(
        LAYER_EXTRUDE,
        "visibility",
        extrusion ? "visible" : "none",
      );
    }
  }, [extrusion]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = selectedId ?? null;
    if (next === selectedIdRef.current) return;
    if (map.getSource(SRC_PARCELS)) {
      try {
        if (selectedIdRef.current) {
          map.setFeatureState(
            { source: SRC_PARCELS, id: selectedIdRef.current },
            { selected: false },
          );
        }
        selectedIdRef.current = next;
        if (next) {
          map.setFeatureState({ source: SRC_PARCELS, id: next }, { selected: true });
        }
      } catch {
        /* ignore */
      }
    } else {
      selectedIdRef.current = next;
    }
  }, [selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusParcelId) return;
    const parcel = parcels.find(
      (candidate) => candidate.id === focusParcelId,
    );
    if (!parcel || !parcel.geometry) return;
    const geometry = geometryBounds(parcel.geometry);
    if (!geometry) return;
    map.fitBounds(
      [
        [geometry.bounds.west, geometry.bounds.south],
        [geometry.bounds.east, geometry.bounds.north],
      ],
      { padding: 120, maxZoom: 16.5, duration: 700 },
    );
  }, [focusParcelId, parcels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitAllSignal || fitAllSignal === 0) return;
    const bounds = boundsForParcels(parcels);
    if (!bounds) return;
    map.fitBounds(
      [
        [bounds.west, bounds.south],
        [bounds.east, bounds.north],
      ],
      { padding: 48, maxZoom: 12.5, duration: 600 },
    );
  }, [fitAllSignal, parcels]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const tool = measureTool ?? "none";
    if (tool === "none") measurePointsRef.current = [];
    map.getCanvas().style.cursor = tool === "none" ? "" : "crosshair";
    const points = measurePointsRef.current;
    const { pointsCollection, lineCollection, polygonCollection } = measureCollections(
      points,
      tool,
    );
    (map.getSource(SRC_MEASURE + "-points") as GeoJSONSource | undefined)?.setData(
      pointsCollection,
    );
    (map.getSource(SRC_MEASURE + "-line") as GeoJSONSource | undefined)?.setData(lineCollection);
    (map.getSource(SRC_MEASURE + "-polygon") as GeoJSONSource | undefined)?.setData(
      polygonCollection,
    );
    if (tool === "none") onMeasurement?.(null);
  }, [measureTool, onMeasurement]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    measurePointsRef.current = [];
    (map.getSource(SRC_MEASURE + "-points") as GeoJSONSource | undefined)?.setData(
      emptyCollection(),
    );
    (map.getSource(SRC_MEASURE + "-line") as GeoJSONSource | undefined)?.setData(
      emptyCollection(),
    );
    (map.getSource(SRC_MEASURE + "-polygon") as GeoJSONSource | undefined)?.setData(
      emptyCollection(),
    );
    onMeasurement?.(null);
  }, [measureResetSignal, onMeasurement]);

  return <div ref={containerRef} className={className} />;
}