---
layout: Conceptual
title: Get access to Copilot Studio - Microsoft Copilot Studio | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/en-us/microsoft-copilot-studio/requirements-licensing-subscriptions
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
ms.custom: licensing, admin, ceX
description: Learn how to sign up for a trial account, access Microsoft Copilot Studio, and find licensing information.
ms.date: 2026-01-21T00:00:00.0000000Z
ms.topic: concept-article
author: MAiNGUY
ms.author: mainguy
ms.reviewer: kjette
manager: rickcatalano
locale: en-us
document_id: 4de9657f-4ab2-1e94-b062-0a2c7eaf88aa
document_version_independent_id: 4de9657f-4ab2-1e94-b062-0a2c7eaf88aa
updated_at: 2026-01-23T01:01:00.0000000Z
original_content_git_url: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/live/copilot-studio/requirements-licensing-subscriptions.md
gitcommit: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/5821cd22dc788ec19e14e254a0489a83a1bc6b9d/copilot-studio/requirements-licensing-subscriptions.md
git_commit_id: 5821cd22dc788ec19e14e254a0489a83a1bc6b9d
site_name: Docs
depot_name: Learn.copilot-studio
page_type: conceptual
toc_rel: toc.json
feedback_help_link_type: ''
feedback_help_link_url: ''
word_count: 798
asset_id: requirements-licensing-subscriptions
moniker_range_name:
monikers: []
item_type: Content
source_path: copilot-studio/requirements-licensing-subscriptions.md
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
platformId: 11e9a600-6428-3651-e40c-475559e30892
---

# Get access to Copilot Studio - Microsoft Copilot Studio | Microsoft Learn

This article provides information about Copilot Studio licensing and the free trial.

Important

- For the most complete and up-to-date Copilot Studio licensing and billing information, refer to the [Microsoft Copilot Studio Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2320995).
- Forecast your agent's Copilot Credits volume using the [Microsoft Copilot Studio agent usage estimator](https://microsoft.github.io/copilot-studio-estimator/). Create estimates and potential consumption impacts by selecting from agent type, traffic, orchestration, knowledge, and tools.

If you already have licenses or you're an administrator, see the [Assign licenses and manage access to Copilot Studio](requirements-licensing) article.

Copilot Studio is [available in the US Government Community Cloud (GCC) plan](requirements-licensing-gcc).

First, [sign up for Copilot Studio](https://copilotstudio.microsoft.com). For more information and to request assistance, visit the [Microsoft Copilot Studio Community](https://powerusers.microsoft.com/t5/Power-Virtual-Agents-Community/ct-p/PVACommunity).

## Prerequisites

A modern web browser such as:

- Chrome version 91 (May 2021) or more recent
- Firefox version 89 (June 2021) or more recent
- Safari version 16.4 (March 2023) or more recent

## Sign up for a Copilot Studio trial

You can sign up for Copilot Studio as an individual. After you finish the sign-up process, your free trial for Copilot Studio starts. You see notifications and receive emails to inform you about the trial expiry. When the trial expires, you can extend it by 30 days.

Your agent continues to work for up to 90 days after your trial expires, so you don't have to worry about extending at the exact time of expiry.

Note

The trial license gives you access to Copilot Studio to create agents. You can test your agents using the test chat panel. However, you can't publish the agent.

1. Go to the [sign-up page](https://go.microsoft.com/fwlink/?LinkId=2107702).
2. Enter your email address and select **Next**.
3. Follow the instructions. After you complete the process, you can use Copilot Studio to [create agents](fundamentals-get-started).

Note

If you have trouble signing up for the trial, check the following common issues:

- Rejected email address: This problem might happen if you used a personal email address for the trial. Instead, use a work or school account.
- Received a message that your sign-up couldn't be completed: This problem likely means your organization's IT administrator disabled the self-service sign-up for Copilot Studio. To finish signing up, contact your IT administrator and ask them to follow the instructions to [enable sign-up](requirements-licensing#trial-plans).

## Standalone Copilot Studio subscription

The standalone Copilot Studio subscription allows you to build agents on any supported channel and connect to any data by using premium connectors.

You can get a standalone Copilot Studio subscription from the Microsoft 365 admin center. For more information, see [Assign licenses and manage access to Copilot Studio](requirements-licensing).

## Copilot Studio for Microsoft Teams plans

Copilot Studio for Teams enables customers to build conversational interfaces within Teams. The agents can use data stored in Microsoft Dataverse for Teams or many other sources, using the supplied standard connectors.

Capabilities available in the Copilot Studio app in Teams are available as part of select Microsoft 365 subscriptions with Microsoft Power Platform and Teams capabilities. This plan excludes plans for US government environments (GCC, GCC High, and DoD), EDU A1, and SUB SKUs.

This table compares key capabilities in the Copilot Studio for Teams plan, which is available in select Microsoft 365 subscriptions, against the standalone Copilot Studio subscription. For a full, comparative list, see the [Microsoft Power Platform Licensing Guide](https://go.microsoft.com/fwlink/?linkid=2085130).

Also see the [Quotas and limits](requirements-quotas) article for other capacity considerations.

| Capability | Select Microsoft 365 subscriptions | Standalone Copilot Studio subscription |
| --- | --- | --- |
| Generative orchestration | Not available | [Orchestrate agent behavior with generative AI](advanced-generative-actions) |
| Deploy agents to channels | [Teams](publication-add-bot-to-microsoft-teams) | [Any channel supported by Copilot Studio](publication-fundamentals-publish-channels) |
| Power Platform connectors | [Standard connector tools in Copilot Studio](/en-us/connectors/connector-reference/connector-reference-standard-connectors) | [Premium connector tools in Copilot Studio](/en-us/connectors/connector-reference/connector-reference-premium-connectors) |
| Power Automate flows (automated, instant, scheduled) | Not available | [Create a flow](advanced-flow-create) |
| Web security | [Secure access enabled by default, can't generate secrets to enable secure access](configure-web-security) | [Can generate secrets and turn on or off secure access by the agent author](configure-web-security) |
| Create and edit with Copilot | Not available | [Can create and iterate on topics by describing what you want, then AI builds it](nlu-authoring) |
| Use Microsoft Bot Framework skills | Not available | [Can extend Copilot Studio agents with Microsoft Bot Framework skills](advanced-use-skills) |
| Use a Copilot Studio classic chatbot as a Bot Framework skill | Not available | [Use a classic chatbot as a skill in a Bot Framework bot](advanced-use-pva-as-a-skill) |
| Hand off agent conversation to a live representative | Not available | [Hand off to a live agent](advanced-hand-off) |

To access the full range of Copilot Studio capabilities, upgrade your plan to a standalone Copilot Studio subscription.

After you upgrade your license, you can continue using the same agent in the same environment. Capabilities that require a standalone license are now available. These capabilities might include [billed sessions that require Copilot Studio capacity](requirements-messages-management).

## Other subscriptions that include Copilot Studio

Entitlements for Copilot Studio are included in Digital Messaging and Chat add-ons for Dynamics 365 Customer Service. For more information, see the [Dynamics 365 Licensing Guide](https://go.microsoft.com/fwlink/?LinkId=866544&amp;usg=AOvVaw31TJQMIji481LIHcfzy3Qw).