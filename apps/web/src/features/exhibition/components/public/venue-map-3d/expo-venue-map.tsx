'use client';

import type { PublicVenueMapSnapshotResponse } from '@toonexpo/contracts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Vector3 } from 'three';

import {
  BOOTH_COLORS,
  type VenueBoothMesh,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-booth-meshes';
import { boothsFromSnapshot } from '@/features/exhibition/components/public/venue-map-3d/booths-from-snapshot';
import {
  boothLabel,
  type VenueBooth,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-booths';
import { Link } from '@/i18n/navigation';
import {
  clampVenueCamera,
  focusBooth,
  panVenueCamera,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-camera';
import {
  toMetres,
  VENUE_CAMERA_HOME,
  worldX,
  worldZ,
  VENUE_CAMERA_LERP,
  VENUE_CLICK_MOVE_PX,
  VENUE_FLAT_POL,
  VENUE_LIFT_LERP,
  VENUE_HOVER_LIFT,
  VENUE_SELECTED_LIFT,
  VENUE_TILT_POL,
  VENUE_WHEEL_ZOOM,
  VENUE_ZOOM_STEP,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-scene-math';
import {
  applyVenueCamera,
  createVenueMapStage,
  resizeVenueStage,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-stage';
import {
  VENUE_MARKS,
  venueMarkScale,
  venueMarkVisible,
} from '@/features/exhibition/components/public/venue-map-3d/venue-map-marks';
import css from '@/features/exhibition/components/public/venue-map-3d/venue-map-view.module.css';

type VenueMapCss = {
  stage: string;
  canvasHost: string;
  dragging: string;
  labels: string;
  label: string;
  labelArea: string;
  labelOpen: string;
  labelBig: string;
  labelSelected: string;
  zoneLabel: string;
  pill: string;
  poi: string;
  panel: string;
  brand: string;
  brandRow: string;
  logo: string;
  date: string;
  tools: string;
  search: string;
  chips: string;
  chip: string;
  chipOn: string;
  list: string;
  group: string;
  item: string;
  itemOn: string;
  itemOpen: string;
  empty: string;
  foot: string;
  prices: string;
  mail: string;
  card: string;
  cardClose: string;
  controls: string;
  hint: string;
};

const styles = css as VenueMapCss;

const DIM_OPACITY = 0.25;
const LABEL_NAME_MIN_W = 30;
const LABEL_NAME_MIN_H = 10;
const LABEL_OPEN_MIN_W = 40;
const LABEL_OPEN_MIN_H = 14;
const FONT_MIN = 8;
const FONT_MAX = 14;
const FONT_MAX_BIG = 20;
const LABEL_FONT_WIDTH_DIVISOR = 7.8;
const LABEL_FONT_WIDTH_DIVISOR_BIG = 8.5;
const LABEL_FONT_HEIGHT_DIVISOR = 2.6;
const LABEL_AREA_MIN_HEIGHT_FACTOR = 3.4;
const LABEL_WIDTH_RATIO = 0.94;
const LABEL_MIN_WIDTH_PX = 30;
const LABEL_CHAR_WIDTH_EM = 0.66;
const LABEL_CHAR_WIDTH_EM_BIG = 0.74;

const matches = (booth: VenueBooth, query: string): boolean => {
  const normalized = query.trim().toLowerCase();
  return normalized.length === 0 || booth.searchText.includes(normalized);
};

const labelSpan = (
  item: VenueBoothMesh,
  project: (point: Vector3) => { x: number; y: number; z: number },
): { w: number; h: number } => {
  const part = item.booth.parts[0];
  if (!part) return { w: 0, h: 0 };
  const y = 0.3 + item.height + item.lift;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  const corners: Array<[number, number]> = [
    [part[0], part[1]],
    [part[2], part[1]],
    [part[0], part[3]],
    [part[2], part[3]],
  ];
  corners.forEach(([x, z]) => {
    const point = project(new Vector3(worldX(toMetres(x)), y, worldZ(toMetres(z))));
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });
  return { w: maxX - minX, h: maxY - minY };
};

const colorOf = (booth: VenueBoothMesh, selected: boolean, hovered: boolean): number => {
  if (selected) return BOOTH_COLORS.selected;
  if (hovered) return BOOTH_COLORS.hover;
  if (booth.booth.kind === 'svc') return BOOTH_COLORS.svc;
  if (!booth.booth.name) return BOOTH_COLORS.open;
  if (booth.booth.kind === 'big') return BOOTH_COLORS.big;
  return BOOTH_COLORS.base;
};

type ExpoVenueMapViewProps = {
  snapshot: PublicVenueMapSnapshotResponse;
};

export const ExpoVenueMapView = ({ snapshot }: ExpoVenueMapViewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flat, setFlat] = useState(true);
  const [mounted, setMounted] = useState(false);
  const booths = useMemo(() => boothsFromSnapshot(snapshot), [snapshot]);
  const selected = booths.find((booth) => booth.id === selectedId) ?? null;
  const filterRef = useRef(query);
  const selectedRef = useRef(selectedId);
  const flatRef = useRef(flat);
  filterRef.current = query;
  selectedRef.current = selectedId;
  flatRef.current = flat;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const labels = labelsRef.current;
    if (!host || !labels) return undefined;
    const stage = createVenueMapStage(host, booths);
    const labelNodes = new Map<string, HTMLDivElement>();
    stage.booths.forEach((item) => {
      const node = document.createElement('div');
      node.className = styles.label;
      labels.appendChild(node);
      labelNodes.set(item.booth.id, node);
    });
    const markClass = (kind: (typeof VENUE_MARKS)[number]['kind']): string => {
      if (kind === 'zone') return styles.zoneLabel;
      if (kind === 'poi') return styles.poi;
      return styles.pill;
    };
    const markNodes = VENUE_MARKS.map((mark) => {
      const node = document.createElement('div');
      node.className = [styles.label, markClass(mark.kind)].join(' ');
      node.textContent = mark.text;
      labels.appendChild(node);
      return node;
    });
    let frame = 0;
    let hoveredId: string | null = null;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerp = reduce ? 1 : VENUE_CAMERA_LERP;
    const liftLerp = reduce ? 1 : VENUE_LIFT_LERP;

    const paint = (): void => {
      const currentQuery = filterRef.current;
      const filtering = currentQuery.trim().length > 0;
      stage.booths.forEach((item) => {
        const selectedNow = item.booth.id === selectedRef.current;
        const hovered = item.booth.id === hoveredId;
        const visible = matches(item.booth, currentQuery);
        item.material.color.setHex(colorOf(item, selectedNow, hovered));
        item.material.opacity = filtering && !visible && !selectedNow ? DIM_OPACITY : 1;
        const goal = selectedNow ? VENUE_SELECTED_LIFT : hovered ? VENUE_HOVER_LIFT : 0;
        item.lift += (goal - item.lift) * liftLerp;
        item.meshes.forEach((mesh) => {
          mesh.position.y = 0.3 + item.height / 2 + item.lift;
        });
      });
    };

    const project = (point: Vector3): { x: number; y: number; z: number } => {
      const projected = point.clone().project(stage.camera);
      return {
        x: ((projected.x + 1) / 2) * host.clientWidth,
        y: ((1 - projected.y) / 2) * host.clientHeight,
        z: projected.z,
      };
    };

    const placeLabels = (): void => {
      stage.booths.forEach((item) => {
        const node = labelNodes.get(item.booth.id);
        if (!node) return;
        const top = item.top.clone();
        top.y += item.lift;
        const point = project(top);
        const selectedNow = item.booth.id === selectedRef.current;
        const dim = item.material.opacity < 1;
        const span = labelSpan(item, project);
        const named = Boolean(item.booth.name);
        const largeEnough = named
          ? span.w > LABEL_NAME_MIN_W && span.h > LABEL_NAME_MIN_H
          : span.w > LABEL_OPEN_MIN_W && span.h > LABEL_OPEN_MIN_H;
        const show = point.z <= 1 && (selectedNow || (!dim && largeEnough));
        node.style.display = show ? 'block' : 'none';
        if (!show) return;
        const name = boothLabel(item.booth);
        const area = item.booth.sqm ? `${item.booth.sqm} m²` : '';
        node.className = [
          styles.label,
          item.booth.kind === 'big' ? styles.labelBig : '',
          item.booth.kind === 'open' ? styles.labelOpen : '',
          selectedNow ? styles.labelSelected : '',
        ]
          .filter(Boolean)
          .join(' ');
        node.replaceChildren();
        node.append(
          document.createTextNode(selectedNow || item.booth.name ? name : area || 'Open'),
        );
        const big = item.booth.kind === 'big';
        const labelWidth = Math.max(LABEL_MIN_WIDTH_PX, span.w * LABEL_WIDTH_RATIO);
        const divisor = big ? LABEL_FONT_WIDTH_DIVISOR_BIG : LABEL_FONT_WIDTH_DIVISOR;
        const longestWord = name.split(/\s+/).reduce((max, word) => Math.max(max, word.length), 1);
        const charWidth = big ? LABEL_CHAR_WIDTH_EM_BIG : LABEL_CHAR_WIDTH_EM;
        const fitted = Math.min(
          labelWidth / divisor,
          labelWidth / Math.max(longestWord * charWidth, 1),
          span.h / LABEL_FONT_HEIGHT_DIVISOR,
        );
        const fontSize = Math.min(big ? FONT_MAX_BIG : FONT_MAX, Math.max(FONT_MIN, fitted));
        const showArea =
          Boolean(area && item.booth.name) &&
          (selectedNow || span.h >= fontSize * LABEL_AREA_MIN_HEIGHT_FACTOR);
        if (showArea) {
          const areaNode = document.createElement('span');
          areaNode.className = styles.labelArea;
          areaNode.textContent = area;
          node.append(areaNode);
        }
        node.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%)`;
        if (selectedNow) {
          node.style.width = 'max-content';
          node.style.fontSize = '';
          return;
        }
        node.style.fontSize = `${fontSize}px`;
        node.style.width = `${labelWidth}px`;
      });
      markNodes.forEach((node, index) => {
        const mark = VENUE_MARKS[index];
        if (!mark) return;
        const point = project(
          new Vector3(worldX(toMetres(mark.x)), mark.y, worldZ(toMetres(mark.z))),
        );
        const visible = point.z <= 1 && venueMarkVisible(mark, stage.cameraState.dist);
        node.style.display = visible ? (mark.kind === 'poi' ? 'flex' : 'block') : 'none';
        if (!visible) return;
        const scale = venueMarkScale(mark, stage.cameraState.dist);
        node.style.transform = `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) scale(${scale})`;
      });
    };

    const loop = (): void => {
      const goal = stage.cameraGoal;
      const current = stage.cameraState;
      (Object.keys(goal) as Array<keyof typeof goal>).forEach((key) => {
        current[key] += (goal[key] - current[key]) * lerp;
      });
      applyVenueCamera(stage);
      paint();
      stage.renderer.render(stage.scene, stage.camera);
      placeLabels();
      frame = requestAnimationFrame(loop);
    };

    const hit = (x: number, y: number): string | null => {
      const rect = stage.renderer.domElement.getBoundingClientRect();
      stage.pointer.set(
        ((x - rect.left) / rect.width) * 2 - 1,
        -((y - rect.top) / rect.height) * 2 + 1,
      );
      stage.raycaster.setFromCamera(stage.pointer, stage.camera);
      const meshes = stage.booths.flatMap((item) => item.meshes);
      const found = stage.raycaster.intersectObjects(meshes, false)[0];
      const id = found?.object.userData['boothId'];
      return typeof id === 'string' ? id : null;
    };

    const pointers = new Map<number, { x: number; y: number }>();
    let last = { x: 0, y: 0 };
    let moved = 0;
    let mode: 'pan' = 'pan';

    const onDown = (event: PointerEvent): void => {
      stage.renderer.domElement.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      last = { x: event.clientX, y: event.clientY };
      moved = 0;
      mode = 'pan';
      host.classList.add(styles.dragging);
    };
    const onMove = (event: PointerEvent): void => {
      if (!pointers.has(event.pointerId)) {
        hoveredId = hit(event.clientX, event.clientY);
        return;
      }
      const dx = event.clientX - last.x;
      const dy = event.clientY - last.y;
      last = { x: event.clientX, y: event.clientY };
      moved += Math.abs(dx) + Math.abs(dy);
      if (mode === 'pan') panVenueCamera(stage.cameraGoal, dx, dy);
      clampVenueCamera(stage.cameraGoal);
    };
    const onUp = (event: PointerEvent): void => {
      const click = pointers.size === 1 && moved < VENUE_CLICK_MOVE_PX;
      pointers.delete(event.pointerId);
      if (pointers.size === 0) host.classList.remove(styles.dragging);
      if (click) {
        const id = hit(event.clientX, event.clientY);
        setSelectedId(id);
        const booth = stage.booths.find((item) => item.booth.id === id);
        if (booth) focusBooth(stage.cameraGoal, booth, flatRef.current);
      }
    };
    const onWheel = (event: WheelEvent): void => {
      event.preventDefault();
      stage.cameraGoal.dist *= Math.exp(event.deltaY * VENUE_WHEEL_ZOOM);
      clampVenueCamera(stage.cameraGoal);
    };
    const canvas = stage.renderer.domElement;
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());
    const onResize = (): void => resizeVenueStage(stage, host.clientWidth, host.clientHeight);
    onResize();
    window.addEventListener('resize', onResize);
    frame = requestAnimationFrame(loop);

    const api = {
      zoom: (factor: number) => {
        stage.cameraGoal.dist *= factor;
        clampVenueCamera(stage.cameraGoal);
      },
      reset: () => {
        Object.assign(stage.cameraGoal, VENUE_CAMERA_HOME);
      },
      focus: (id: string) => {
        const booth = stage.booths.find((item) => item.booth.id === id);
        if (booth) focusBooth(stage.cameraGoal, booth, flatRef.current);
      },
      setFlat: (next: boolean) => {
        stage.cameraGoal.pol = next ? VENUE_FLAT_POL : VENUE_TILT_POL;
        if (next) stage.cameraGoal.az = 0;
      },
    };
    Object.assign(host, { venueApi: api });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      stage.dispose();
      labels.replaceChildren();
    };
  }, [mounted, booths]);

  const fly = (id: string): void => {
    setSelectedId(id);
    const host = hostRef.current as HTMLDivElement & {
      venueApi?: { focus: (boothId: string) => void };
    };
    host?.venueApi?.focus(id);
  };

  const items = booths
    .filter((booth) => matches(booth, query))
    .sort((a, b) => boothLabel(a).localeCompare(boothLabel(b)));

  if (!mounted) return null;

  return createPortal(
    <section className={styles.stage} aria-label="Venue map">
      <div className={styles.canvasHost} ref={hostRef}>
        <div className={styles.labels} ref={labelsRef} />
      </div>
      <aside className={styles.panel}>
        <div className={styles.brand}>
          <div className={styles.brandRow}>
            <img
              className={styles.logo}
              src="/brand/toon-expo-logo-over-hero.png"
              alt="TOON Expo"
            />
            <div>
              <h1>{snapshot.title}</h1>
            </div>
          </div>
        </div>
        <div className={styles.tools}>
          <input
            className={styles.search}
            type="search"
            value={query}
            placeholder="Search exhibitors"
            aria-label="Search exhibitors"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className={styles.list}>
          {items.length === 0 ? <p className={styles.empty}>No exhibitors match.</p> : null}
          <div className={styles.group}>{`${snapshot.title} (${items.length})`}</div>
          {items.map((booth) => (
            <button
              key={booth.id}
              type="button"
              className={[
                styles.item,
                booth.id === selectedId ? styles.itemOn : '',
                booth.name ? '' : styles.itemOpen,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => fly(booth.id)}
            >
              <span>{boothLabel(booth)}</span>
              <small>{booth.sqm ? `${booth.sqm} m²` : ''}</small>
            </button>
          ))}
        </div>
      </aside>
      {selected ? (
        <div className={styles.card} role="status">
          <button
            type="button"
            className={styles.cardClose}
            aria-label="Close"
            onClick={() => setSelectedId(null)}
          >
            ×
          </button>
          <h2>{boothLabel(selected)}</h2>
          <p>
            {[selected.code, selected.sqm ? `${selected.sqm} m²` : null].filter(Boolean).join(', ')}
          </p>
          {selected.href ? (
            <Link className={styles.mail} href={selected.href}>
              Open profile
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => callApi(hostRef.current, (api) => api.zoom(1 / VENUE_ZOOM_STEP))}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => callApi(hostRef.current, (api) => api.zoom(VENUE_ZOOM_STEP))}
        >
          −
        </button>
        <button
          type="button"
          aria-label={flat ? 'Switch to 3D view' : 'Switch to 2D view'}
          onClick={() => {
            const next = !flat;
            setFlat(next);
            callApi(hostRef.current, (api) => api.setFlat(next));
          }}
        >
          {flat ? '3D' : '2D'}
        </button>
        <button
          type="button"
          aria-label="Reset view"
          onClick={() => {
            setFlat(true);
            setSelectedId(null);
            callApi(hostRef.current, (api) => {
              api.setFlat(true);
              api.reset();
            });
          }}
        >
          ↺
        </button>
      </div>
      <p className={styles.hint}>Drag to pan. Scroll to zoom.</p>
    </section>,
    document.body,
  );
};

type VenueApi = {
  zoom: (factor: number) => void;
  reset: () => void;
  focus: (id: string) => void;
  setFlat: (next: boolean) => void;
};

const callApi = (host: HTMLDivElement | null, run: (api: VenueApi) => void): void => {
  const api = (host as (HTMLDivElement & { venueApi?: VenueApi }) | null)?.venueApi;
  if (api) run(api);
};
