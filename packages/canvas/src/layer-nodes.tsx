import {
  fontFamilyById,
  type Layer,
  type TextLayer,
  type ImageLayer,
  type ShapeLayer,
  type GraphicLayer,
} from '@shirtify/core';
import { forwardRef, useEffect, useRef, useMemo } from 'react';
import {
  Text as KonvaText,
  Image as KonvaImage,
  Path,
  Rect,
  Circle,
  Ellipse,
  RegularPolygon,
  Star,
  Line,
  Group,
} from 'react-konva';
import type Konva from 'konva';

import { toKonvaFill } from './fill.ts';
import { toKonvaFilters } from './filters.ts';
import { useAssetImage } from './use-asset-image.ts';

export interface LayerNodeProps {
  layer: Layer;
  stageSize: number;
  draggable: boolean;
  resolveAssetUrl: (key: string) => Promise<string>;
  onSelect: () => void;
  onChange: (patch: Partial<Layer>) => void;
}

const toPx = (n: number, size: number): number => n * size;

function useTransformHandlers(layer: Layer, stageSize: number, onChange: (p: Partial<Layer>) => void) {
  const onDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onChange({ x: node.x() / stageSize, y: node.y() / stageSize });
  };
  const onTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const nextScale = layer.scale * node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    onChange({
      x: node.x() / stageSize,
      y: node.y() / stageSize,
      scale: nextScale,
      rotation: node.rotation(),
    });
  };
  return { onDragEnd, onTransformEnd };
}

export const TextLayerNode = forwardRef<Konva.Text, LayerNodeProps>(function TextLayerNode(
  { layer, stageSize, draggable, onSelect, onChange },
  ref,
) {
  const text = layer as TextLayer;
  const { onDragEnd, onTransformEnd } = useTransformHandlers(layer, stageSize, onChange);
  const fontSize = stageSize * 0.08 * text.scale;
  const approxW = (text.text.length || 1) * fontSize * 0.6;
  const fillProps = toKonvaFill(text.color, approxW, fontSize);

  return (
    <KonvaText
      ref={ref}
      text={text.text || ' '}
      x={toPx(text.x, stageSize)}
      y={toPx(text.y, stageSize)}
      rotation={text.rotation}
      opacity={text.opacity}
      fontFamily={fontFamilyById(text.font)}
      fontSize={fontSize}
      fontStyle="bold"
      {...fillProps}
      stroke={text.stroke?.color}
      strokeWidth={text.stroke ? text.stroke.width : 0}
      shadowColor={text.shadow ? '#000' : undefined}
      shadowBlur={text.shadow ? 6 : 0}
      shadowOpacity={text.shadow ? 0.4 : 0}
      align="center"
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
});

export const ImageLayerNode = forwardRef<Konva.Image, LayerNodeProps>(function ImageLayerNode(
  { layer, stageSize, draggable, resolveAssetUrl, onSelect, onChange },
  ref,
) {
  const image = layer as ImageLayer;
  const bitmap = useAssetImage(image.assetKey, resolveAssetUrl);
  const { onDragEnd, onTransformEnd } = useTransformHandlers(layer, stageSize, onChange);
  const innerRef = useRef<Konva.Image | null>(null);

  const filterSpec = useMemo(() => toKonvaFilters(image.filter ?? 'none'), [image.filter]);

  // Cache + re-cache when the bitmap or filter changes so Konva applies filters.
  useEffect(() => {
    const node = innerRef.current;
    if (!node || !bitmap) return;
    if (filterSpec.filters.length > 0) {
      node.cache();
      node.getLayer()?.batchDraw();
    } else {
      node.clearCache();
      node.getLayer()?.batchDraw();
    }
  }, [bitmap, filterSpec]);

  if (!bitmap) return null;
  const base = stageSize * 0.4 * image.scale;
  const ratio = bitmap.height / bitmap.width;
  const w = base;
  const h = base * ratio;

  const setRef = (node: Konva.Image | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.MutableRefObject<Konva.Image | null>).current = node;
  };

  return (
    <KonvaImage
      ref={setRef}
      image={bitmap}
      x={toPx(image.x, stageSize)}
      y={toPx(image.y, stageSize)}
      offsetX={w / 2}
      offsetY={h / 2}
      width={w}
      height={h}
      rotation={image.rotation}
      opacity={image.opacity}
      filters={filterSpec.filters}
      {...(filterSpec.params ?? {})}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
});

// ---- Shapes ----
const heartPoints = (s: number): number[] => {
  // A coarse heart polyline, centred, fitting roughly in s×s.
  const r = s / 2;
  const pts: number[] = [];
  for (let t = 0; t <= Math.PI * 2; t += 0.2) {
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push((x / 16) * r, (y / 16) * r);
  }
  return pts;
};

export const ShapeLayerNode = forwardRef<Konva.Node, LayerNodeProps>(function ShapeLayerNode(
  { layer, stageSize, draggable, onSelect, onChange },
  ref,
) {
  const shape = layer as ShapeLayer;
  const { onDragEnd, onTransformEnd } = useTransformHandlers(layer, stageSize, onChange);
  const size = (shape.size ?? 0.25) * stageSize * shape.scale;
  const fillProps = toKonvaFill(shape.fill, size, size);

  const common = {
    x: toPx(shape.x, stageSize),
    y: toPx(shape.y, stageSize),
    rotation: shape.rotation,
    opacity: shape.opacity,
    ...fillProps,
    stroke: shape.stroke?.color,
    strokeWidth: shape.stroke ? shape.stroke.width : 0,
    draggable,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd,
    onTransformEnd,
  } as const;

  const r = size / 2;
  switch (shape.shape) {
    case 'circle':
      return <Circle ref={ref as never} radius={r} {...common} />;
    case 'ellipse':
      return <Ellipse ref={ref as never} radiusX={r} radiusY={r * 0.65} {...common} />;
    case 'rect':
      return <Rect ref={ref as never} width={size} height={size} offsetX={r} offsetY={r} {...common} />;
    case 'rounded-rect':
      return <Rect ref={ref as never} width={size} height={size} cornerRadius={size * 0.15} offsetX={r} offsetY={r} {...common} />;
    case 'triangle':
      return <RegularPolygon ref={ref as never} sides={3} radius={r} {...common} />;
    case 'pentagon':
      return <RegularPolygon ref={ref as never} sides={5} radius={r} {...common} />;
    case 'hexagon':
      return <RegularPolygon ref={ref as never} sides={6} radius={r} {...common} />;
    case 'diamond':
      return <RegularPolygon ref={ref as never} sides={4} radius={r} {...common} />;
    case 'star':
      return <Star ref={ref as never} numPoints={5} innerRadius={r * 0.45} outerRadius={r} {...common} />;
    case 'burst':
      return <Star ref={ref as never} numPoints={12} innerRadius={r * 0.7} outerRadius={r} {...common} />;
    case 'heart':
      return <Line ref={ref as never} points={heartPoints(size)} closed tension={0.05} {...common} />;
    case 'cross':
      return (
        <Path
          ref={ref as never}
          data={`M ${-r * 0.33} ${-r} h ${r * 0.66} v ${r * 0.66} h ${r * 0.34} v ${r * 0.66} h ${-r * 0.66} v ${r * 0.34} h ${-r * 0.66} v ${-r * 0.34} h ${-r * 0.34} v ${-r * 0.66} h ${r * 0.34} z`}
          {...common}
        />
      );
    case 'arrow':
      return (
        <Line
          ref={ref as never}
          points={[-r, -r * 0.3, r * 0.2, -r * 0.3, r * 0.2, -r * 0.6, r, 0, r * 0.2, r * 0.6, r * 0.2, r * 0.3, -r, r * 0.3]}
          closed
          {...common}
        />
      );
    case 'line':
      return <Rect ref={ref as never} width={size} height={size * 0.08} offsetX={r} offsetY={size * 0.04} {...common} />;
    default:
      return <RegularPolygon ref={ref as never} sides={shape.sides ?? 6} radius={r} {...common} />;
  }
});

// ---- Graphic (lucide icon) ----
const num = (v: string | number | undefined, d = 0): number =>
  typeof v === 'number' ? v : v !== undefined ? parseFloat(v) : d;

/** Render one lucide [tag, attrs] primitive as the matching Konva shape. */
function GraphicPrimitive({
  tag,
  attrs,
  stroke,
  strokeWidth,
  fillProps,
  filled,
}: {
  tag: string;
  attrs: Record<string, string | number>;
  stroke: string | undefined;
  strokeWidth: number;
  fillProps: ReturnType<typeof toKonvaFill>;
  filled: boolean;
}) {
  const strokeProps = filled
    ? fillProps
    : { stroke, strokeWidth, lineCap: 'round' as const, lineJoin: 'round' as const };
  switch (tag) {
    case 'path':
      return <Path data={String(attrs.d ?? '')} {...strokeProps} />;
    case 'circle':
      return <Circle x={num(attrs.cx)} y={num(attrs.cy)} radius={num(attrs.r)} {...strokeProps} />;
    case 'ellipse':
      return (
        <Ellipse x={num(attrs.cx)} y={num(attrs.cy)} radiusX={num(attrs.rx)} radiusY={num(attrs.ry)} {...strokeProps} />
      );
    case 'rect':
      return (
        <Rect
          x={num(attrs.x)}
          y={num(attrs.y)}
          width={num(attrs.width)}
          height={num(attrs.height)}
          cornerRadius={num(attrs.rx)}
          {...strokeProps}
        />
      );
    case 'line':
      return <Line points={[num(attrs.x1), num(attrs.y1), num(attrs.x2), num(attrs.y2)]} {...strokeProps} />;
    case 'polyline':
    case 'polygon': {
      const pts = String(attrs.points ?? '')
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      return <Line points={pts} closed={tag === 'polygon'} {...strokeProps} />;
    }
    default:
      return null;
  }
}

export const GraphicLayerNode = forwardRef<Konva.Group, LayerNodeProps>(function GraphicLayerNode(
  { layer, stageSize, draggable, onSelect, onChange },
  ref,
) {
  const g = layer as GraphicLayer;
  const { onDragEnd, onTransformEnd } = useTransformHandlers(layer, stageSize, onChange);
  const box = (g.size ?? 0.3) * stageSize * g.scale;
  const vb = g.viewBox || 24;
  const s = box / vb;
  const filled = !g.strokeMode;
  const fillProps = toKonvaFill(g.color, vb, vb);
  const strokeColor = typeof g.color === 'string' ? g.color : '#16140F';
  // lucide stroke width is in viewBox units; keep it proportional.
  const sw = g.strokeWidth || 2;

  return (
    <Group
      ref={ref as never}
      x={toPx(g.x, stageSize)}
      y={toPx(g.y, stageSize)}
      rotation={g.rotation}
      opacity={g.opacity}
      scaleX={s}
      scaleY={s}
      offsetX={vb / 2}
      offsetY={vb / 2}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    >
      {g.nodes.map((node, i) => (
        <GraphicPrimitive
          key={i}
          tag={node[0]}
          attrs={node[1]}
          stroke={strokeColor}
          strokeWidth={sw}
          fillProps={fillProps}
          filled={filled}
        />
      ))}
    </Group>
  );
});
