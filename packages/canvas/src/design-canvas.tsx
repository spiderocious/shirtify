import { type Scene, type SceneSide, type Layer } from '@shirtify/core';
import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Stage, Layer as KonvaLayer, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';

import { ImageLayerNode, TextLayerNode, ShapeLayerNode } from './layer-nodes.tsx';
import { MaterialBackdrop } from './material-backdrop.tsx';
import { ShirtBackdrop } from './shirt-backdrop.tsx';
import { toKonvaFilters } from './filters.ts';
import { useFontsReady } from './use-fonts-ready.ts';
import type { CanvasOptions, CanvasHandle, ToPNGOptions } from './types.ts';

export interface DesignCanvasProps extends CanvasOptions {
  /** The currently selected layer id (controlled by the host editor chrome). */
  selectedLayerId?: string | null;
  onSelectLayer?: (id: string | null) => void;
  /** Controlled side. When provided, the host owns front/back; otherwise the
   *  canvas tracks it internally (used by the imperative `mount()` path). */
  side?: SceneSide;
  className?: string;
}

/**
 * The Konva editing surface. Renders a scene's layers on a square stage sized to
 * its container, with a Transformer for drag/scale/rotate. Pure presentation +
 * gesture; all I/O is injected (the host owns fetch, autosave, URL resolution).
 */
export const DesignCanvas = forwardRef<CanvasHandle, DesignCanvasProps>(function DesignCanvas(
  {
    front,
    back,
    onChange,
    resolveAssetUrl,
    readOnly = false,
    initialSide = 'front',
    selectedLayerId = null,
    onSelectLayer,
    side: controlledSide,
    className,
  },
  ref,
) {
  const [internalSide, setInternalSide] = useState<SceneSide>(initialSide);
  const side = controlledSide ?? internalSide;
  const setSide = setInternalSide;
  const [scenes, setScenes] = useState<{ front: Scene; back: Scene }>({ front, back });
  const [stageSize, setStageSize] = useState(360);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const trRef = useRef<Konva.Transformer | null>(null);
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());

  // Keep internal scenes in sync if the host swaps designs (e.g. data load).
  useEffect(() => setScenes({ front, back }), [front, back]);

  // Responsive square: measure container width.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setStageSize(Math.max(240, Math.min(el.clientWidth, 640)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeScene = scenes[side];

  // Attach the transformer to the selected node.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    if (readOnly || !selectedLayerId) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }
    const node = nodeRefs.current.get(selectedLayerId);
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedLayerId, side, readOnly, activeScene.layers]);

  const emit = (next: { front: Scene; back: Scene }) => {
    setScenes(next);
    onChange(next);
  };

  const patchLayer = (layerId: string, patch: Partial<Layer>) => {
    const layers = activeScene.layers.map((l) =>
      l.id === layerId ? ({ ...l, ...patch } as Layer) : l,
    );
    emit({ ...scenes, [side]: { ...activeScene, layers } });
  };

  useImperativeHandle(ref, (): CanvasHandle => ({
    addTextLayer: () => undefined, // host-driven; editor inserts via scene update
    addImageLayer: () => undefined,
    setSide: (s) => setSide(s),
    getScenes: () => scenes,
    toPNG: async ({ side: exportSide, width }: ToPNGOptions): Promise<Blob> => {
      const stage = stageRef.current;
      if (!stage || exportSide !== side) {
        throw new Error('toPNG: switch to the requested side first');
      }
      const pixelRatio = width / stageSize;
      const dataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' });
      const res = await fetch(dataUrl);
      return res.blob();
    },
    destroy: () => undefined,
  }));

  return (
    <div ref={containerRef} className={className}>
      <Stage
        ref={stageRef}
        width={stageSize}
        height={stageSize}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) onSelectLayer?.(null);
        }}
        onTouchStart={(e) => {
          if (e.target === e.target.getStage()) onSelectLayer?.(null);
        }}
      >
        <KonvaLayer>
          <Rect width={stageSize} height={stageSize} fill="transparent" />
          <ShirtBackdrop
            type={activeScene.shirt.type}
            color={activeScene.shirt.color}
            side={side}
            size={stageSize}
          />
        </KonvaLayer>
        <KonvaLayer>
          {activeScene.layers.map((layer) => {
            const common = {
              layer,
              stageSize,
              draggable: !readOnly,
              resolveAssetUrl,
              onSelect: () => onSelectLayer?.(layer.id),
              onChange: (patch: Partial<Layer>) => patchLayer(layer.id, patch),
              ref: (node: Konva.Node | null) => {
                if (node) nodeRefs.current.set(layer.id, node);
                else nodeRefs.current.delete(layer.id);
              },
            };
            return layer.kind === 'text' ? (
              <TextLayerNode key={layer.id} {...common} />
            ) : (
              <ImageLayerNode key={layer.id} {...common} />
            );
          })}
          {!readOnly ? (
            <Transformer
              ref={trRef}
              rotateEnabled
              keepRatio
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              borderStroke="#1F6BFF"
              anchorStroke="#16140F"
              anchorFill="#C6F24E"
              anchorSize={12}
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 ? oldBox : newBox)}
            />
          ) : null}
        </KonvaLayer>
      </Stage>
    </div>
  );
});
