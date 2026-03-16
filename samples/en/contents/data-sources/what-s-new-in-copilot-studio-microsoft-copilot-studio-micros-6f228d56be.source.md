---
layout: Conceptual
title: What's new in Copilot Studio - Microsoft Copilot Studio | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new
breadcrumb_path: /microsoft-copilot-studio/breadcrumb/toc.json
uhfHeaderId: MSDocsHeader-MicrosoftCopilotStudio
feedback_system: Standard
feedback_product_url: https://powerusers.microsoft.com/t5/Power-Virtual-Agents-Community/ct-p/PVACommunity
search.app:
- capaedac-pva
- powervirtualagents-docs
recommendations: true
ms.service: copilot-studio
ms.collection: bap-ai-copilot
ms.update-cycle: 180-days
ms.custom: ignite-2024
description: Find information about new Microsoft Copilot Studio features and features releasing in the next few months.
ms.date: 2026-03-06T00:00:00.0000000Z
author: rapraj
ms.author: rapraj
ms.reviewer: kjette
manager: rickcatalano
ms.topic: whats-new
locale: en-us
document_id: 2e045506-dde0-f379-4874-f26758bc471b
document_version_independent_id: 2e045506-dde0-f379-4874-f26758bc471b
updated_at: 2026-03-09T14:42:00.0000000Z
original_content_git_url: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/live/copilot-studio/whats-new.md
gitcommit: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/8087b38ebadb2e407b9ec5928535193962d9e153/copilot-studio/whats-new.md
git_commit_id: 8087b38ebadb2e407b9ec5928535193962d9e153
site_name: Docs
depot_name: Learn.copilot-studio
page_type: conceptual
toc_rel: toc.json
feedback_help_link_type: ''
feedback_help_link_url: ''
word_count: 1673
asset_id: whats-new
moniker_range_name:
monikers: []
item_type: Content
source_path: copilot-studio/whats-new.md
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/c389ea6b-b6a0-46df-93a1-1e21f25e19e7
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/19ada1b6-705b-4ed7-aad0-bffd1bd03dfa
platformId: 7423340e-b329-cc37-70c6-4df57c4b3962
---

# What's new in Copilot Studio - Microsoft Copilot Studio | Microsoft Learn

This article provides resources to learn about new features in Copilot Studio.

## Release plans

For information about new features being released over the next few months that you can use for planning, see [Release Planner](https://aka.ms/BAP/ReleasePlanning/Portal).

## Released versions

For information about the new features, fixes, and improvements released in the past few weeks, see [Released versions of Microsoft Copilot Studio](/en-us/power-platform/released-versions/copilotstudio).

Note

Releases are rolled out over several days. New or updated functionality might not appear immediately.

## Notable changes

The following sections list features released in the past months, with links to related information.

### March 2026

- (Preview) Use [Work IQ](use-work-iq) tools to connect Microsoft 365 Copilot and your agents to the Work IQ service, enabling access to real-time work insights and context from Microsoft 365 files, emails, meetings, chats, and more.

### February 2026

- Improved agent responses for ticket‑based Microsoft 365 Graph [connectors](advanced-connectors). Agents more accurately retrieve [ServiceNow](/en-us/connectors/service-now/) tickets and [Azure DevOps](/en-us/connectors/visualstudioteamservices/) work items and generate clear, actionable summaries, which improves workflow reliability, and time to value.
- Select Claude Sonnet 4.5 (beta) for [Computer Use](computer-use) agents. This model improves nuanced decision‑making for complex tasks, increasing reliability, and success rates for advanced uses.
- Enhancements to the [prompt builder](prompts-overview) include:

    - Configure [content moderation sensitivity per prompt](prompt-model-settings) to control how hate/fairness, sexual, violence, and self‑harm content is filtered—supporting regulated and document‑processing scenarios with low or high sensitivity settings for managed models.
    - Optimize [prompts](prompt-model-settings) with new Claude models by choosing Claude Opus 4.6 or Claude Sonnet 4.5, enabling fine‑grained control over reasoning depth, quality, latency, and cost per prompt.
    - [Edit prompt instructions and settings inline](nlu-generative-answers-prompt-modification) in agent tool details, bringing model selection, inputs, knowledge, and testing into a single, streamlined authoring experience.

### January 2026

- (Preview) New enhancements to agent evaluations:

    - Provide real‑time [thumbs‑up/down feedback](analytics-agent-evaluation-results#see-and-rate-a-detailed-analysis-for-a-test-case) on evaluation results to verify grading performance and drive ongoing improvements to evaluation reliability.
    - View your agent's sequence of inputs, decisions, and outputs with [activity maps](analytics-agent-evaluation-results#see-and-rate-a-detailed-analysis-for-a-test-case) so you can quickly diagnose issues and get clearer insight into how your agent behaves at runtime.
    - Use a validated [CSV template](analytics-agent-evaluation-create#create-a-test-set-file-to-import) to create test sets, reducing formatting errors, and helping your team standardize evaluation data more quickly.
- (Preview) Expand [computer use](computer-use) capabilities with new model support, built‑in credentials, [enhanced audit logging](monitor-computer-use#configure-advanced-computer-use-logging) with session replay, and [Cloud PC pooling](use-cloud-pc-pool)—giving you greater security, scalability, and governance for agent‑driven workflows.
- (General availability) Use the [Microsoft Copilot Studio extension for Microsoft Visual Studio Code](visual-studio-code-extension-overview) to build, edit, and manage agents inside Microsoft Visual Studio Code, supporting advanced and highly flexible developer workflows.

### December 2025

- Compare multiple agent versions side by side to validate improvements and quickly spot regressions when [evaluating agents with test sets](analytics-agent-evaluation-results).

### November 2025

- Updates for models used in Copilot Studio:

    - On November 24, 2025, GPT-5 Chat rolls out to Copilot Studio in [general availability](authoring-select-agent-model#model-availability-by-region) for European and United States regions. You can use generally available models for orchestration in production agents. For more information on choosing orchestration models, see [Select a primary AI model for your agent](authoring-select-agent-model).
- (Preview) Automatically create [Microsoft Entra agent identities](admin-use-entra-agent-identities) for agents. When turned on, automatically apply identity management to individual agents by assigning a Microsoft Entra agent identity, helping admins secure and manage agents more effectively.
- Improved knowledge retrieval for SharePoint-grounded agents using [tenant graph grounding](knowledge-copilot-studio#tenant-graph-grounding-with-semantic-search). Updated system architecture and new retrieval methods deliver more precise, context-rich responses, enhancing answer quality.

Note

Some queries might lead to slightly higher latency.

- Improve response accuracy with [SharePoint metadata filters](knowledge-add-sharepoint). Use metadata like filename, owner, and modified date to refine knowledge retrieval and ensure responses come from the most relevant, up-to-date documents.
- [Orchestrate multiple agents](authoring-add-other-agents) to break down complex tasks across specialized agents, improving accuracy and speeding up end‑to‑end automation. Enhance your agents by linking them to other agents—either within your environment or external sources like [Microsoft Fabric](add-agent-fabric-data-agent) data agents—for modular, task-specific functionality.
- (Preview) Add tool groups to agents for faster setup. Quickly equip your agents with curated sets of tools from Outlook and SharePoint connectors in one step. This streamlines setup, reduces errors, and ensures consistent, reliable orchestration.
- Copy agents from [Microsoft 365 Copilot to Copilot Studio](/en-us/microsoft-365-copilot/extensibility/copilot-studio-experience?context=%2Fmicrosoft-copilot-studio%2Fcontext). Easily move agents you created in Microsoft 365 Copilot into Copilot Studio to unlock advanced capabilities like multistep workflows, custom integrations, and broader deployment options.
- (Preview) Add human input to agent workflows with the [request for information](flows-request-for-information) action. Pause an agent flow to collect details from designated reviewers via Outlook, then resume execution using their responses as dynamic parameters. This action ensures workflows can handle missing data or context without relying on hard-coded values.
- Update Power Platform API calls to use the [new 'copilotstudio' namespace](admin-api-quarantine). The previous namespace will continue to work temporarily, but switching now ensures compatibility with future updates.
- Use [component collections](authoring-export-import-copilot-components) with new enhancements. Access collections directly from the sidebar, quickly export or import collections, and take advantage of support for primary agents and new connector types, including child agents and Model Context Protocol (MCP).

### October 2025

- Updates for models used in Copilot Studio:

    - Between October 27 and 31, 2025, GPT‑4o will be retired in Copilot Studio for agents using generative orchestration, except for GCC customers who can continue using GPT‑4o. The new default model is [GPT‑4.1](authoring-select-agent-model), which delivers improved performance, reliability, and consistency across experiences. GPT‑4o remains available until November 26, 2025 if you turn on the "[Continue using retired models](authoring-retired-model)" option.
    - Choose from multiple [AI models](authoring-select-agent-model) to tailor your agent's performance to your needs.
    - (Preview) Test and deploy [GPT‑5](authoring-select-agent-model) models to explore advanced capabilities and enhance your agent's performance.
- Learn about [Copilot Studio Kit](guidance/kit-overview), a suite of tools developed by the Power Customer Advisory Team (Power CAT) to help test custom agents, validate AI-generated content, analyze conversation key performance indicators, and more.
- (Preview) Group related user questions into [themes](analytics-themes) and drill down into analytics to uncover patterns and gain deeper insights.
- Track [time and cost savings](analytics-cost-savings) for both autonomous and conversational agents to measure ROI and optimize performance.
- Access a [unified activity and transcript view](authoring-review-activity), pin sessions, and submit feedback for faster, more effective troubleshooting.
- (Preview) [Accelerate flow execution](agent-flow-express-mode) to minimize timeouts and deliver a faster, smoother user experience.
- Use the [Model Context Protocol (MCP) server](mcp-add-components-to-agent) to access dynamic, real-time content—such as files, database records, and API responses—for richer context and improved agent responses.
- (Preview) Evaluate your agents using customizable [test sets](analytics-agent-evaluation-create)—whether uploaded, manually created, or AI-generated. Test sets can include test cases using different test methods (graders) measured against defined reference answers, helping teams identify strengths and areas for improvement. This capability supports more reliable, high-quality agent experiences across diverse scenarios.

### September 2025

- (Preview) Automate tasks in desktop applications on Windows using [Computer-Using Agents (CUA)](computer-use), which combines vision and reasoning to interact with interfaces—even when APIs aren't available.
- Embed Copilot agents into Android, iOS, and Windows apps using the [Client SDK](publication-communicate-with-agent-from-native-app) to provide rich, multimodal conversations within native experiences.
- (Preview) Upload Excel, CSV, and PDF files for your agent to analyze using Python code, powered by the [code interpreter in chat](code-interpreter-for-prompts).

### August 2025

- (General availability) Use [code interpreter](code-interpreter-for-prompts) to generate Python code-based actions from natural language in both the prompt builder and agent workflows.
- (General availability) Enhance agentic response accuracy in Copilot Studio agents by using [file groups](knowledge-file-groups) to organize local files to be uploaded as a single knowledge source and apply variable-based instructions.
- Allow users to [upload files and images](image-input-analysis) that your Copilot Studio agent can analyze and use to generate responses, then pass those files to downstream systems using Agent Flows, Power Automate, connectors, tools, and topics for seamless integration.
- (General availability) Track and analyze unanswered queries and response generative AI quality with the [generated answer rate and quality](analytics-improve-agent-effectiveness) section in the Analytics page to improve your agent's performance.
- Connect to an existing [MCP server](mcp-add-existing-server-to-agent#option-1-use-the-mcp-onboarding-wizard-recommended) directly within Copilot Studio using a guided experience.

### July 2025

- Use [advanced NLU customization](nlu-plus-configure) to define topics and entities using your own data for higher accuracy and improved containment, especially for Dynamics 365 scenarios.
- [Search across your agent](authoring-search-within-agent)'s knowledge, topics, tools, skills, and entities instantly using a new in-app search experience accessible via keyboard shortcut or top-level search.
- Estimate time and cost savings based on successful runs or actions and customizable to your organization's metrics with [ROI analytics](analytics-cost-savings) for agents with autonomous capabilities.
- View user comments submitted with [thumbs up/down reactions](analytics-improve-agent-effectiveness) in analytics, offering deeper insight into customer feedback on agent responses.
- (Preview) Display [Microsoft Information Protection (MIP)](sensitivity-label-copilot-studio) labels across connectors, test chat, Teams, and Microsoft 365 Copilot to prevent oversharing and support secure, compliant AI experiences. With new integrations between Copilot Studio, Dataverse, and Microsoft Purview, you can automatically classify sensitive data and ensure agents respect Purview sensitivity labels.
- Publish agents directly to a [WhatsApp](publication-add-bot-to-whatsapp) phone number, making it easier to reach customers.
- (Preview) Streamline authentication for Microsoft Entra ID–backed actions and connectors with the SSO Consent Card by allowing users to grant consent directly within the chat with no redirects and no interruptions.

### June 2025

- Improved experience for tools:

    - Grouping and filtering for easier search and discovery of tools.
    - Support for IntelliSense automatic completion and input widgets such as calendar control, file picker, and timezone picker, when configuring tools.
    - Improved tool invocation experience for customers with more affordances for complex inputs and clearer error messaging.
    - Automatic detection of SSO for connectors.
- (Preview) [Support for Microsoft 365 Copilot Tuning](microsoft-copilot-fine-tune-model) to train models on your own enterprise data for domain-specific tasks and integrate these models into Microsoft 365 experiences like Copilot in Teams, Word, and Chat. You can also connect your fine-tuned models to custom agents.
- Actionable insights for questions that generative AI left unanswered, grouped by themes, in the **Answer rate and quality** section of the **Analytics** page.
- Knowledge sources analysis for autonomous agents.
- Ability to insert Power Fx formulas directly in the embedded [prompt builder prompt editor](nlu-prompt-node#configure-and-test-a-prompt-with-the-prompt-editor).
- Simplified text validation and extraction with regular expression support for [Power Fx formulas](advanced-power-fx) that use IsMatch, Match, or MatchAll functions.
- (Preview) Support for [file groups](knowledge-file-groups) as knowledge sources.
- (Preview) Generative orchestration available for all [supported languages](advanced-generative-actions#multilingual-support-with-generative-orchestration).
- Redesigned **Channels** page.
- (US-only preview) Ability to select the GPT-4.1 mini [experimental response model](nlu-preview-model) for generative answers.