/**
 * Domain Port: IPC API surface exposed by electron/preload.ts
 * This interface is mirrored by window.electronAPI in the renderer.
 */

import type { ScenarioPayload, SlideUpdatePayload } from '../entities/slide-work';
import type { PaletteColor, ThemeSlots, ThemeTokens } from '../entities/palette';
import type { IconifyCollectionId } from '../icons/iconify';
import type { GeneratedSlidePreview } from '../entities/slide-work';

export interface SourceArtifact {
  markdownPath: string;
  summaryPath: string;
  summaryText: string;
}

export interface DataFile {
  path: string;
  name: string;
  type: 'csv' | 'docx' | 'txt' | 'md';
  headers?: string[];
  rows?: Record<string, string>[];
  text?: string;
  summary: string;
  consumed?: SourceArtifact;
}

export interface ScrapeResult {
  url: string;
  title: string;
  text: string;
  lists: string[];
  error?: string;
  consumed?: SourceArtifact;
}

export interface IpcChatAPI {
  send(
    message: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    workspace: {
      title: string;
      slides: import('../entities/slide-work').SlideItem[];
      designBrief: import('../entities/slide-work').DesignBrief | null;
      framework: import('../entities/slide-work').FrameworkType | null;
      theme: ThemeTokens | null;
      dataSources: DataFile[];
      urlSources: Array<{ url: string; status: string; result?: ScrapeResult }>;
      iconProvider: 'iconify';
      iconCollection: IconifyCollectionId;
      availableIcons: string[];
    },
  ): void;

  onStream(cb: (delta: { content?: string; thinking?: string }) => void): () => void;
  onScenario(cb: (payload: ScenarioPayload) => void): () => void;
  onSlideUpdate(cb: (slide: SlideUpdatePayload) => void): () => void;
  onFrameworkSuggested(cb: (payload: { primary: string; reasoning: string }) => void): () => void;
  onError(cb: (msg: string) => void): () => void;
  onDone(cb: () => void): () => void;
}

export interface IpcThemeAPI {
  generatePalette(seeds: string[]): Promise<PaletteColor[]>;
  autoAssign(colors: PaletteColor[]): Promise<ThemeSlots>;
  exportThmx(tokens: ThemeTokens): Promise<{ success: boolean; path?: string; error?: string }>;
}

export interface IpcPptxAPI {
  generate(
    code: string,
    themeTokens: ThemeTokens | null,
    title: string,
  ): Promise<{ success: boolean; path?: string; error?: string }>;
  exportSlides(
    slides: import('../entities/slide-work').SlideItem[],
    themeTokens: ThemeTokens | null,
    title: string,
  ): Promise<{ success: boolean; path?: string; error?: string }>;
  executeCode(code: string, themeTokens: ThemeTokens | null): Promise<ArrayBuffer>;
  inspectCode(code: string, themeTokens: ThemeTokens | null): Promise<GeneratedSlidePreview[]>;
}

export interface IpcFsAPI {
  openDirectory(): Promise<DataFile[]>;
  readFile(filePath: string): Promise<DataFile>;
}

export interface IpcScrapeAPI {
  scrapeUrl(url: string): Promise<ScrapeResult>;
}

export interface IpcImagesAPI {
  resolveForSlides(slides: Array<{
    number: number;
    title: string;
    keyMessage: string;
    bullets: string[];
    imageQuery?: string | null;
  }>): Promise<Array<{
    number: number;
    imageQuery: string | null;
    imageUrl: string | null;
    imagePath: string | null;
    imageAttribution: string | null;
  }>>;
}

export interface IpcSettingsAPI {
  get(): Promise<Record<string, string>>;
  save(settings: Record<string, string>): Promise<void>;
}

export interface PptAppProject {
  version: 1;
  savedAt: string;
  workspaceDir: string;
  title: string;
  slidesWork: import('../entities/slide-work').SlideWork;
  chatMessages: Array<{ id: string; role: string; content: string; thinking?: string; timestamp: number }>;
  palette: {
    seeds: string[];
    colors: import('../entities/palette').PaletteColor[];
    slots: import('../entities/palette').ThemeSlots | null;
    tokens: import('../entities/palette').ThemeTokens | null;
    themeName: string;
    iconDir?: string | null;
    selectedIconCollection?: IconifyCollectionId;
  };
  dataSources?: {
    files: DataFile[];
    urls: Array<{ url: string; status: string; result?: ScrapeResult }>;
  };
}

export interface IpcProjectAPI {
  getWorkspaceDir(): Promise<string>;
  setWorkspaceDir(): Promise<string | null>;
  save(projectData: PptAppProject, suggestedName: string): Promise<{ success: boolean; path?: string }>;
  load(): Promise<{ data: PptAppProject; path: string } | null>;
  listWorkspaceFiles(): Promise<Array<{ name: string; path: string }>>;
}

/** Matches window.electronAPI exposed by preload.ts */
export interface ElectronAPI {
  chat: IpcChatAPI;
  theme: IpcThemeAPI;
  pptx: IpcPptxAPI;
  fs: IpcFsAPI;
  scrape: IpcScrapeAPI;
  images: IpcImagesAPI;
  settings: IpcSettingsAPI;
  project: IpcProjectAPI;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
