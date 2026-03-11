/**
 * Domain Entities: Slide Work
 * Portable between main and renderer via IPC serialization.
 */

export interface SlideStory {
  intro: string;
  storyContent: string;
}

export interface DesignBrief {
  objective: string;
  audience: string;
  tone: string;
  visualStyle: string;
  colorMood: string;
  density: string;
  layoutApproach: string;
  directions: string[];
}

export type SlideLayout =
  | 'title'
  | 'agenda'
  | 'section'
  | 'bullets'
  | 'cards'
  | 'stats'
  | 'comparison'
  | 'timeline'
  | 'diagram'
  | 'summary';

export type FrameworkType =
  | 'mckinsey'
  | 'scqa'
  | 'pyramid'
  | 'mece'
  | 'action-title'
  | 'assertion-evidence'
  | 'exec-summary-first';

export interface SlideItem {
  id: string;
  number: number;
  title: string;
  keyMessage: string;
  layout: SlideLayout;
  bullets: string[];
  notes: string;
  icon: string | null;
  imageQuery: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  imageAttribution: string | null;
  code: string | null;
  accent: 'blue' | 'green' | 'purple' | 'teal' | 'orange';
}

export interface GeneratedSlidePreviewObject {
  kind: 'text' | 'shape' | 'image';
  shape?: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string | null;
  fontSize?: number | null;
  color?: string | null;
  fillColor?: string | null;
  lineColor?: string | null;
  lineWidth?: number | null;
  path?: string | null;
  data?: string | null;
  rotate?: number | null;
  transparency?: number | null;
  align?: string | null;
  valign?: string | null;
}

export interface GeneratedSlidePreview {
  id: string;
  number: number;
  title: string;
  backgroundColor: string | null;
  backgroundImageData: string | null;
  notes: string | null;
  objects: GeneratedSlidePreviewObject[];
}

export type SlidePhase = 'empty' | 'planning' | 'story' | 'generating' | 'ready';

export interface SlideWork {
  phase: SlidePhase;
  title: string;
  story: SlideStory | null;
  designBrief: DesignBrief | null;
  framework: FrameworkType | null;
  slides: SlideItem[];
  pptxCode: string | null;
  generatedPreviewSlides: GeneratedSlidePreview[] | null;
  thinking: string | null;
  isStreaming: boolean;
}

/** Scenario payload emitted by set_scenario tool */
export interface ScenarioPayload {
  title: string;
  slides: Array<{
    number: number;
    title: string;
    keyMessage: string;
    layout: string;
    bullets: string[];
    notes: string;
    icon?: string;
    imageQuery?: string;
  }>;
  designBrief?: DesignBrief;
  framework?: FrameworkType;
}

/** Slide update payload emitted by update_slide tool */
export interface SlideUpdatePayload {
  number: number;
  title: string;
  keyMessage: string;
  layout: string;
  bullets: string[];
  notes: string;
  icon?: string;
  imageQuery?: string;
}
