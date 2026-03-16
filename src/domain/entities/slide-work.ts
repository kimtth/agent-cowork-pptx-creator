/**
 * Domain Entities: Slide Work
 * Portable between main and renderer via IPC serialization.
 */

export interface SlideStory {
  intro: string;
  storyContent: string;
}

export type DesignStyle = import('../design-styles').DesignStyle;

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
  | 'summary'
  | 'chart';

export type FrameworkType =
  | 'mckinsey'
  | 'scqa'
  | 'pyramid'
  | 'mece'
  | 'action-title'
  | 'assertion-evidence'
  | 'exec-summary-first';

export interface SlideSelectedImage {
  id: string;
  imageQuery: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  imageAttribution: string | null;
  sourcePageUrl: string | null;
  thumbnailUrl: string | null;
}

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
  imageQueries: string[];
  imageUrl: string | null;
  imagePath: string | null;
  imageAttribution: string | null;
  selectedImages: SlideSelectedImage[];
  code: string | null;
  accent: 'blue' | 'green' | 'purple' | 'teal' | 'orange';
}

export type SlidePhase = 'empty' | 'planning' | 'story' | 'generating' | 'ready';

export interface SlideWork {
  phase: SlidePhase;
  title: string;
  story: SlideStory | null;
  designBrief: DesignBrief | null;
  designStyle: DesignStyle | null;
  framework: FrameworkType | null;
  slides: SlideItem[];
  pptxCode: string | null;
  pptxBuildError: string | null;
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
    imageQueries?: string[];
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
  imageQueries?: string[];
}
