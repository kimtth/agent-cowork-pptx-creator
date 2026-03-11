/**
 * Store: Slides + Workspace state
 */

import { create } from 'zustand';
import type {
  SlideItem,
  SlideWork,
  ScenarioPayload,
  SlideUpdatePayload,
  FrameworkType,
  DesignBrief,
  GeneratedSlidePreview,
} from '../domain/entities/slide-work';

function mapLayout(raw: string): SlideItem['layout'] {
  const valid = ['title', 'agenda', 'section', 'bullets', 'cards', 'stats', 'comparison', 'timeline', 'diagram', 'summary'] as const;
  return valid.includes(raw as SlideItem['layout']) ? (raw as SlideItem['layout']) : 'bullets';
}

const ACCENT_CYCLE: SlideItem['accent'][] = ['blue', 'green', 'purple', 'teal', 'orange'];

interface SlidesStore {
  work: SlideWork;
  applyScenario(payload: ScenarioPayload): void;
  applySlideUpdate(update: SlideUpdatePayload): void;
  applyResolvedImages(images: Array<{ number: number; imageQuery: string | null; imageUrl: string | null; imagePath: string | null; imageAttribution: string | null }>): void;
  setSlideImageQuery(number: number, imageQuery: string | null): void;
  setFramework(fw: FrameworkType): void;
  setStreaming(v: boolean): void;
  setThinking(delta: string): void;
  appendChatContent(delta: string): void;
  setPptxCode(code: string): void;
  setGeneratedPreviewSlides(slides: GeneratedSlidePreview[] | null): void;
  reset(): void;
  moveSlide(from: number, to: number): void;
  deleteSlide(number: number): void;
  moveToAppendix(number: number): void;
}

const initial: SlideWork = {
  phase: 'empty',
  title: '',
  story: null,
  designBrief: null,
  framework: null,
  slides: [],
  pptxCode: null,
  generatedPreviewSlides: null,
  thinking: null,
  isStreaming: false,
};

export const useSlidesStore = create<SlidesStore>((set) => ({
  work: initial,

  applyScenario(payload) {
    const slides: SlideItem[] = payload.slides.map((s, i) => ({
      id: nanoid(),
      number: s.number,
      title: s.title,
      keyMessage: s.keyMessage,
      layout: mapLayout(s.layout),
      bullets: s.bullets,
      notes: s.notes,
      icon: s.icon ?? null,
      imageQuery: s.imageQuery ?? null,
      imageUrl: null,
      imagePath: null,
      imageAttribution: null,
      code: null,
      accent: ACCENT_CYCLE[i % ACCENT_CYCLE.length],
    }));
    set((state) => ({
      work: {
        ...state.work,
        phase: 'story',
        title: payload.title,
        slides,
        pptxCode: null,
        generatedPreviewSlides: null,
        designBrief: (payload.designBrief as DesignBrief | undefined) ?? state.work.designBrief,
        framework: (payload.framework as FrameworkType | undefined) ?? state.work.framework,
      },
    }));
  },

  applySlideUpdate(update) {
    set((state) => ({
      work: {
        ...state.work,
        pptxCode: null,
        generatedPreviewSlides: null,
        slides: state.work.slides.map((s) =>
          s.number === update.number
            ? {
                ...s,
                title: update.title,
                keyMessage: update.keyMessage,
                layout: mapLayout(update.layout),
                bullets: update.bullets,
                notes: update.notes,
                icon: update.icon ?? s.icon,
                imageQuery: update.imageQuery ?? s.imageQuery,
                imageUrl: update.imageQuery && update.imageQuery !== s.imageQuery ? null : s.imageUrl,
                imagePath: update.imageQuery && update.imageQuery !== s.imageQuery ? null : s.imagePath,
                imageAttribution: update.imageQuery && update.imageQuery !== s.imageQuery ? null : s.imageAttribution,
              }
            : s,
        ),
      },
    }));
  },

  applyResolvedImages(images) {
    set((state) => ({
      work: {
        ...state.work,
        slides: state.work.slides.map((slide) => {
          const resolved = images.find((item) => item.number === slide.number);
          return resolved
            ? {
                ...slide,
                imageQuery: resolved.imageQuery,
                imageUrl: resolved.imageUrl,
                imagePath: resolved.imagePath,
                imageAttribution: resolved.imageAttribution,
              }
            : slide;
        }),
      },
    }));
  },

  setSlideImageQuery(number, imageQuery) {
    set((state) => ({
      work: {
        ...state.work,
        slides: state.work.slides.map((slide) =>
          slide.number === number
            ? {
                ...slide,
                imageQuery,
                imageUrl: imageQuery !== slide.imageQuery ? null : slide.imageUrl,
                imagePath: imageQuery !== slide.imageQuery ? null : slide.imagePath,
                imageAttribution: imageQuery !== slide.imageQuery ? null : slide.imageAttribution,
              }
            : slide,
        ),
      },
    }));
  },

  setFramework(fw) {
    set((state) => ({
      work: { ...state.work, framework: fw, phase: state.work.phase === 'empty' ? 'planning' : state.work.phase },
    }));
  },

  setStreaming(v) {
    set((state) => ({ work: { ...state.work, isStreaming: v } }));
  },

  setThinking(delta) {
    set((state) => ({
      work: { ...state.work, thinking: (state.work.thinking ?? '') + delta },
    }));
  },

  appendChatContent(_delta) {
    // Chat content is handled by the chat store; this is a no-op
  },

  setPptxCode(code) {
    set((state) => ({ work: { ...state.work, pptxCode: code, phase: 'ready' } }));
  },

  setGeneratedPreviewSlides(slides) {
    set((state) => ({ work: { ...state.work, generatedPreviewSlides: slides } }));
  },

  reset() {
    set({ work: initial });
  },

  moveSlide(from, to) {
    set((state) => {
      const slides = [...state.work.slides];
      const [item] = slides.splice(from - 1, 1);
      slides.splice(to - 1, 0, item);
      const renumbered = slides.map((s, i) => ({ ...s, number: i + 1 }));
      return { work: { ...state.work, slides: renumbered } };
    });
  },

  deleteSlide(number) {
    set((state) => {
      const slides = state.work.slides
        .filter((s) => s.number !== number)
        .map((s, i) => ({ ...s, number: i + 1 }));
      return { work: { ...state.work, slides } };
    });
  },

  moveToAppendix(number) {
    set((state) => {
      const idx = state.work.slides.findIndex((s) => s.number === number);
      if (idx === -1) return state;
      const slides = [...state.work.slides];
      const [item] = slides.splice(idx, 1);
      slides.push({ ...item, accent: 'orange' });
      const renumbered = slides.map((s, i) => ({ ...s, number: i + 1 }));
      return { work: { ...state.work, slides: renumbered } };
    });
  },
}));

/** Tiny alias for easier import */
function nanoid(): string {
  return Math.random().toString(36).slice(2, 11);
}
