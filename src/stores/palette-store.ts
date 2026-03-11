/**
 * Store: Palette + Theme state
 */

import { create } from 'zustand';
import type { PaletteColor, ThemeSlots, ThemeTokens } from '../domain/entities/palette';
import { buildThemeTokens } from '../application/palette-use-case';
import { DEFAULT_ICONIFY_COLLECTION } from '../domain/icons/iconify';
import type { IconifyCollectionId } from '../domain/icons/iconify';

const DEFAULT_SEEDS = ['#0078D4', '#5C2D91'];

interface PaletteStore {
  seeds: string[];
  colors: PaletteColor[];
  slots: ThemeSlots | null;
  tokens: ThemeTokens | null;
  themeName: string;
  selectedIconCollection: IconifyCollectionId;
  isGenerating: boolean;

  setSeeds(seeds: string[]): void;
  setColors(colors: PaletteColor[]): void;
  setSlots(slots: ThemeSlots): void;
  setThemeName(name: string): void;
  setSelectedIconCollection(collection: IconifyCollectionId): void;
  setGenerating(v: boolean): void;
  /** Called after slots + colors are set — builds fully typed ThemeTokens */
  commitTokens(): void;
}

export const usePaletteStore = create<PaletteStore>((set, get) => ({
  seeds: DEFAULT_SEEDS,
  colors: [],
  slots: null,
  tokens: null,
  themeName: 'My Theme',
  selectedIconCollection: DEFAULT_ICONIFY_COLLECTION,
  isGenerating: false,

  setSeeds: (seeds) => set({ seeds }),
  setColors: (colors) => set({ colors }),
  setSlots: (slots) => set({ slots }),
  setThemeName: (name) => set({ themeName: name }),
  setSelectedIconCollection: (selectedIconCollection) => set({ selectedIconCollection }),
  setGenerating: (v) => set({ isGenerating: v }),

  commitTokens() {
    const { themeName, slots, colors } = get();
    if (!slots) return;
    const tokens = buildThemeTokens(themeName, slots, colors);
    set({ tokens });
  },
}));
