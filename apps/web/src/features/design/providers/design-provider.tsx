import {
  addTextLayer as addText,
  addImageLayer as addImage,
  addShapeLayer as addShape,
  addGraphicLayer as addGraphic,
  addEmojiLayer as addEmoji,
  removeLayer as removeLayerOp,
  reorderLayer as reorderLayerOp,
  moveLayerToIndex as moveLayerToIndexOp,
  type NewTextLayerInput,
} from '@shirtify/canvas';
import {
  applyTemplate as applyTemplateOp,
  type Scene,
  type SceneSide,
  type Layer,
  type ShapeKind,
  type FilterKind,
  type GraphicNode,
  type DesignTemplate,
  type PublicSessionResponse,
} from '@shirtify/core';
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { useSaveDesign } from '../api/use-save-design.ts';
import { useDebouncedCallback } from '../utils/use-debounced-callback.ts';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface DesignContextValue {
  token: string;
  context: PublicSessionResponse;
  scenes: { front: Scene; back: Scene };
  side: SceneSide;
  setSide: (side: SceneSide) => void;
  selectedLayerId: string | null;
  selectLayer: (id: string | null) => void;
  activeScene: Scene;
  selectedLayer: Layer | null;
  saveState: SaveState;
  // mutations
  patchLayer: (id: string, patch: Partial<Layer>) => void;
  addTextLayer: (input?: NewTextLayerInput) => void;
  addImageLayer: (assetKey: string) => void;
  addShapeLayer: (shape: ShapeKind) => void;
  addGraphicLayer: (icon: { iconId: string; nodes: GraphicNode[]; viewBox: number }) => void;
  addEmojiLayer: (emoji: string) => void;
  removeLayer: (id: string) => void;
  reorderLayer: (id: string, direction: 1 | -1) => void;
  moveLayerToIndex: (id: string, index: number) => void;
  setShirtColor: (color: string) => void;
  setSceneFilter: (filter: FilterKind) => void;
  applyTemplate: (template: DesignTemplate) => void;
  replaceScenes: (next: { front: Scene; back: Scene }) => void;
}

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({
  token,
  context,
  children,
}: {
  token: string;
  context: PublicSessionResponse;
  children: ReactNode;
}) {
  const save = useSaveDesign();
  const [scenes, setScenes] = useState({
    front: context.design.canvas_front,
    back: context.design.canvas_back,
  });
  const [side, setSide] = useState<SceneSide>('front');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const latest = useRef(scenes);

  const persist = useDebouncedCallback((next: { front: Scene; back: Scene }) => {
    setSaveState('saving');
    save.mutate(
      { token, canvas_front: next.front, canvas_back: next.back },
      {
        onSuccess: () => setSaveState('saved'),
        onError: () => setSaveState('error'),
      },
    );
  }, 1200);

  const commit = (next: { front: Scene; back: Scene }) => {
    latest.current = next;
    setScenes(next);
    persist(next);
  };

  const updateActive = (mutate: (scene: Scene) => Scene) => {
    const next = { ...latest.current, [side]: mutate(latest.current[side]) };
    commit(next);
  };

  const activeScene = scenes[side];
  const selectedLayer = useMemo(
    () => activeScene.layers.find((l) => l.id === selectedLayerId) ?? null,
    [activeScene.layers, selectedLayerId],
  );

  const value: DesignContextValue = {
    token,
    context,
    scenes,
    side,
    setSide: (s) => {
      setSide(s);
      setSelectedLayerId(null);
    },
    selectedLayerId,
    selectLayer: setSelectedLayerId,
    activeScene,
    selectedLayer,
    saveState,
    patchLayer: (id, patch) =>
      updateActive((scene) => ({
        ...scene,
        layers: scene.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
      })),
    addTextLayer: (input) => {
      const { scene, layerId } = addText(latest.current[side], input);
      commit({ ...latest.current, [side]: scene });
      setSelectedLayerId(layerId);
    },
    addImageLayer: (assetKey) => {
      const { scene, layerId } = addImage(latest.current[side], assetKey);
      commit({ ...latest.current, [side]: scene });
      setSelectedLayerId(layerId);
    },
    addShapeLayer: (shape) => {
      const { scene, layerId } = addShape(latest.current[side], shape);
      commit({ ...latest.current, [side]: scene });
      setSelectedLayerId(layerId);
    },
    addGraphicLayer: (icon) => {
      const { scene, layerId } = addGraphic(latest.current[side], icon);
      commit({ ...latest.current, [side]: scene });
      setSelectedLayerId(layerId);
    },
    addEmojiLayer: (emoji) => {
      const { scene, layerId } = addEmoji(latest.current[side], emoji);
      commit({ ...latest.current, [side]: scene });
      setSelectedLayerId(layerId);
    },
    removeLayer: (id) => {
      updateActive((scene) => removeLayerOp(scene, id));
      setSelectedLayerId((cur) => (cur === id ? null : cur));
    },
    reorderLayer: (id, direction) => updateActive((scene) => reorderLayerOp(scene, id, direction)),
    moveLayerToIndex: (id, index) => updateActive((scene) => moveLayerToIndexOp(scene, id, index)),
    setShirtColor: (color) =>
      updateActive((scene) => ({ ...scene, shirt: { ...scene.shirt, color } })),
    setSceneFilter: (filter) => updateActive((scene) => ({ ...scene, filter })),
    applyTemplate: (template) => updateActive((scene) => applyTemplateOp(scene, template)),
    replaceScenes: commit,
  };

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
}

export function useDesign(): DesignContextValue {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used inside DesignProvider');
  return ctx;
}
