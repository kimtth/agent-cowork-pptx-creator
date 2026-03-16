---
layout: Conceptual
title: Choose between Agent Builder in Microsoft 365 Copilot and Copilot Studio to build your agent | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/en-us/microsoft-365-copilot/extensibility/copilot-studio-experience
breadcrumb_path: /microsoft-365-copilot/extensibility/breadcrumb/toc.json
feedback_system: Standard
feedback_product_url: https://learn.microsoft.com/microsoft-365-copilot/extensibility/feedback#microsoft-365-copilot-feedback
feedback_help_link_url: https://learn.microsoft.com/answers/tags/466/copilot-m365-development
feedback_help_link_type: get-help-at-qna
permissioned-type: public
ms.service: microsoft-365-copilot
ms.subservice: developer
ms.collection: ce-skilling-ai-copilot
ms.update-cycle: 180-days
uhfHeaderId: MSDocsHeader-M365CopilotExt
description: Learn how to determine whether Microsoft 365 Copilot or Copilot Studio is the best tool for building your agent.
author: Lauragra
ms.author: lauragra
ms.topic: concept-article
ms.localizationpriority: medium
ms.date: 2025-01-05T00:00:00.0000000Z
locale: en-us
document_id: 9f5b31a5-79b6-20f5-3661-e27a801dce77
document_version_independent_id: 9f5b31a5-79b6-20f5-3661-e27a801dce77
updated_at: 2026-01-05T20:42:00.0000000Z
original_content_git_url: https://github.com/MicrosoftDocs/m365copilot-docs-pr/blob/live/docs/copilot-studio-experience.md
gitcommit: https://github.com/MicrosoftDocs/m365copilot-docs-pr/blob/12450a6fc2769f3bdf59997fe6514acf2b848bac/docs/copilot-studio-experience.md
git_commit_id: 12450a6fc2769f3bdf59997fe6514acf2b848bac
site_name: Docs
depot_name: MSDN.m365copilot-docs
page_type: conceptual
toc_rel: toc.json
word_count: 1194
asset_id: copilot-studio-experience
moniker_range_name:
monikers: []
item_type: Content
source_path: docs/copilot-studio-experience.md
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0fc65d4-7c73-4029-a261-7f99ff744363
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/b2daec57-5914-4967-8ed3-1d444897ba59
platformId: 26f4645c-0a21-1aac-007c-0ba4fc8eab6f
---

# Choose between Agent Builder in Microsoft 365 Copilot and Copilot Studio to build your agent | Microsoft Learn

The Agent Builder feature in Microsoft 365 Copilot and Copilot Studio are powerful tools for building secure, scalable, and intelligent agents that work across Microsoft 365 and line-of-business systems. Both tools allow you to create agents, but they serve different needs. This article describes the differences between the two to help you choose the best one for your scenario.

When choosing which tool to use, consider the following factors:

- **Audience** – Who will use the agent?
- **Deployment scope** – How widely do you plan to share the agent?
- **Functionality** – What tasks will the agent perform?
- **Governance needs** – Does your agent require granular application lifecycle management?

The following decision tree helps you map your scenario to the right tool.

![A flow chart that shows the decision points for choosing Microsoft 365 Copilot and Copilot Studio.](assets/images/copilot-studio-agent-builder/copilot-studio-decision-flow.png)

In summary:

- **Choose Microsoft 365 Copilot** and use the Agent Builder feature if you want to quickly create an agent for yourself or a small team, using natural language and existing content (for example, a bot that answers questions from your team’s SharePoint files or emails). Agent Builder is simple, accessible, and integrated with the Microsoft 365 Copilot experience, so you can build agents in context without any code.
- **Choose Copilot Studio** if you need an agent for a broader audience (such as your whole department, organization, or external customers) or if the agent requires advanced capabilities like multi-step workflows or custom integrations, or you need more control over deployment and management. The full version of Copilot Studio is a standalone web portal with a rich set of tools for complex or scalable solutions.

Note

If you choose to use Microsoft 365 Copilot to create your agent and you later want to take advantage of the features available in Copilot Studio, you can copy your agent to Copilot Studio.

The following table provides a more detailed feature comparison.

| Feature | Microsoft 365 Copilot | Copilot Studio |
| --- | --- | --- |
| Access point | [Microsoft 365 Copilot app](https://www.microsoft365.com/copilot) | [Copilot Studio](https://copilotstudio.microsoft.com) |
| User type | Information workers | Makers and developers |
| Agent target audience | Individuals or small teams. | Department, organization, or external customers. |
| Agent type | Lightweight Q&A agents with organizational knowledge. | Agents with complex scenarios like multi-step workflows or business system integration, and that require enterprise governance and robust controls. |
| Key capabilities | - Natural language authoring<br>- Content-focused Q&A scenarios based on organization context from Microsoft Graph<br>- Respects user permissions to Microsoft 365 data<br>- Uses the Microsoft 365 Copilot orchestrator, foundation models, and services | - Broad and external publishing<br>- Supports multistep logic, approvals, and branching workflows<br>- Supports advanced AI models and integration with Azure AI services<br>- Provides access to prebuilt and custom connectors to connect with data sources beyond Microsoft 365<br>- Autonomous capabilities<br>- Lifecycle management tools including versioning; development, test, and production environments; role-based access controls; and telemetry and analytics. |
| Use cases | Use Microsoft 365 Copilot to build:<br>- Project FAQ bots that answers common questions based on project documentation.<br>- Product documentation assistants that help employees find information from internal product manuals or wikis.<br>- Onboarding agents that help new team members get answers from internal knowledge bases. | Use Copilot Studio to build:<br>- Customer support agents that create support tickets and escalates issues to a human.<br>- IT help desk triage agents that handle employee IT requests and routes them to the right support team.<br>- Sales assistants for CRM that retrieve sales data, makes notes, or kicks off an approval workflow. |
| Management and governance | Managed primarily through the Microsoft 365 admin center. | Managed through the Power Platform admin center with finer-grained controls for enterprise scenarios. |

## Copy agents from Microsoft 365 Copilot to Copilot Studio

You can copy an agent created in Microsoft 365 Copilot to Copilot Studio when you need advanced capabilities or broader integration options. This process ensures that work done in Microsoft 365 Copilot isn't lost and can be extended in Copilot Studio without a need to start over.

Transitioning to Copilot Studio unlocks additional features, such as richer customization, governance controls, and expanded connectors. When you copy your agent, the agent's core configuration and instructions are preserved, and you can enhance them with the advanced settings available only in Copilot Studio.

Consider copying an agent to Copilot Studio when:

- You need enterprise-grade deployment options.
- You want to integrate with more data sources or apply advanced security policies.

For more information, see [Copy an agent to Copilot Studio](copy-agent-to-copilot-studio).

## Licensing requirements

Both Agent Builder in Microsoft 365 Copilot and Copilot Studio are included with a Microsoft 365 Copilot add-on license for authenticated users. If you don’t have a Copilot license, you can use Copilot Credits or a pay-as-you-go plan to access either experience.

You can also use Agent Builder in Microsoft 365 Copilot for free to build agents grounded on web knowledge only. For more information, see [Using agents in Microsoft 365 Copilot Chat](/en-us/copilot/agents).

## Agent Builder governance principles

The Agent Builder feature in Microsoft 365 Copilot allows users to create agents that act as reusable templates. These agents help retrieve insights from Microsoft Graph by packaging repeatable prompts and content connections. They operate within existing enterprise boundaries and respect Microsoft 365 controls.

Agent Builder applies the following key governance principles:

- **No new privileges** - Agents respect existing Microsoft 365 permissions. If a user doesn't have access to a SharePoint site, Teams channel, or Outlook mailbox, the agent doesn't surface content from those sources.
- **Built-in visibility and auditing capabilities** - Agents are surfaced within Microsoft 365. Standard audit logs, activity reports, and DLP/retention policies apply.

IT administrators manage agent visibility, sharing, and lifecycle policies in the Microsoft 365 admin center via the **Copilot** &gt; **Agents** page. Admins can:

- View agent inventory and agent metadata.
- Enable, disable, assign, block, or remove agents to align with organizational policies.
- Configure pay-as-you-go billing and review agent usage and consumption.
- Enforce compliance using Microsoft Purview (sensitivity labels, audit logs).

Admins can also manage agent sharing controls via the **Microsoft 365 Admin Center** &gt; **Copilot** &gt; **Settings** &gt; **Data access** &gt; **Agents** page. For more information, see [Share an agent](agent-builder-share-manage-agents#share-an-agent).

## Copilot Studio governance principles

Copilot Studio supports the creation of more sophisticated agents, often by makers or developers. These agents can integrate external data sources, call APIs, orchestrate complex workflows, and connect to systems beyond Microsoft 365—ideal for departmental or enterprise-wide solutions.

Copilot Studio applies the following key governance principles:

- **Structured development** - Application Lifecycle Management (ALM) enables development across dev, test, and production environments.
- **Connector governance** - Admins control which systems agents can connect to, reducing risk of unauthorized access.
- **Environment-level policies** - Data loss prevention (DLP), role-based access, and auditing are enforced at the environment level.
- **Flexible deployment** - Agents can be published across Teams, websites, and custom endpoints with granular access controls.
- **Secure collaboration** - Agents support view/edit rights for cross-functional teamwork with oversight.
- **Development and publishing oversight** - Application Lifecycle Management (ALM) supports dev/test/prod environments, and publishing to an organization’s app catalog requires admin approval. This ensures visibility and control over what becomes broadly available.

IT administrators use the Power Platform admin center to manage:

- Agent environments and connectors.
- Lifecycle policies and publishing workflows.
- Compliance via Microsoft Purview (sensitivity labels, audit logs, retention).
- Telemetry and usage analytics to monitor agent behavior and ensure policy alignment.