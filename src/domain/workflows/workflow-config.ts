export type WorkflowId = 'prestaging' | 'create-pptx'

export type WorkflowMode = 'story' | 'pptx'

export interface WorkflowConfig {
  id: WorkflowId
  label: string
  triggerLabel: string
  mode: WorkflowMode
  instructionFile: string
  summary: string
  goal: string
  steps: string[]
  agentDirective: string
  triggerPrompt: string
}

export const WORKFLOW_CONFIGS: Record<WorkflowId, WorkflowConfig> = {
  prestaging: {
    id: 'prestaging',
    label: 'Prestaging Workflow',
    triggerLabel: 'Brainstorm',
    mode: 'story',
    instructionFile: 'prestaging.md',
    summary: 'Understand source content, select a business framework, and stage the draft slide story in the workspace.',
    goal: 'Create preliminary slide definitions in the slide panel without generating PPTX code.',
    steps: [
      'Understand the available content, business objective, audience, and constraints.',
      'Choose or justify the most suitable business framework for the presentation.',
      'Generate or refine the preliminary slide scenario in the slide panel.',
      'Leave room for the user to tweak slides and attach images before PPTX creation.',
      'Do not generate python-pptx code in this workflow.',
    ],
    agentDirective: 'Use this workflow for content understanding and slide planning only. Produce or update the slide scenario in the workspace panel and stop before PPTX generation.',
    triggerPrompt: 'Start the prestaging workflow now. Understand the content, choose the best business framework, and generate the preliminary slide scenario in the slide panel. Do not generate PPTX code in this step.',
  },
  'create-pptx': {
    id: 'create-pptx',
    label: 'Create PPTX Workflow',
    triggerLabel: 'Create PPTX',
    mode: 'pptx',
    instructionFile: 'create-pptx.md',
    summary: 'Generate the final PPTX composition from approved slide inputs, theme, icons, and attached images.',
    goal: 'Review design consistency, generate python-pptx code, and let the app update the preview images after rendering.',
    steps: [
      'Use the approved slide panel content as the source of truth.',
      'Apply the selected icon set, theme, palette, and any images attached to each slide.',
      'Run the slide-final-review workflow before code generation to catch visual inconsistencies.',
      'Generate the final python-pptx code only after the composition has been corrected.',
      'Return only the final python code block so the app can render preview images in the center area.',
    ],
    agentDirective: 'Use this workflow for final PPTX creation only. Treat slide-final-review as mandatory before writing python-pptx code, then output only the final code block.',
    triggerPrompt: 'Run the create PPTX workflow now. Use the approved slides, theme, icons, colors, and attached images. Review the composition with slide-final-review before generating python-pptx code, then return only the final python code block.',
  },
}

export function getWorkflowConfig(id: WorkflowId): WorkflowConfig {
  return WORKFLOW_CONFIGS[id]
}

export function formatWorkflowForPrompt(workflow: WorkflowConfig): string {
  return [
    `Workflow: ${workflow.label}`,
    `Summary: ${workflow.summary}`,
    `Goal: ${workflow.goal}`,
    'Required steps:',
    ...workflow.steps.map((step, index) => `${index + 1}. ${step}`),
    `Agent directive: ${workflow.agentDirective}`,
  ].join('\n')
}