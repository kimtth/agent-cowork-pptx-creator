---
layout: Conceptual
title: Security and governance - Microsoft Copilot Studio | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/en-us/microsoft-copilot-studio/security-and-governance
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
description: Use the security and governance controls in Power Platform and Microsoft 365 to manage the security of your data when creating, publishing, and using agents built with Microsoft Copilot Studio.
ms.date: 2026-01-27T00:00:00.0000000Z
ms.topic: concept-article
author: iaanw
ms.author: digantak
ms.reviewer: iawilt
locale: en-us
document_id: c7034308-b622-990d-06b0-3f58ada51141
document_version_independent_id: c7034308-b622-990d-06b0-3f58ada51141
updated_at: 2026-03-13T07:03:00.0000000Z
original_content_git_url: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/live/copilot-studio/security-and-governance.md
gitcommit: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/259f34bd847df9b0ea3f48407a1e0e27fe072868/copilot-studio/security-and-governance.md
git_commit_id: 259f34bd847df9b0ea3f48407a1e0e27fe072868
site_name: Docs
depot_name: Learn.copilot-studio
page_type: conceptual
toc_rel: toc.json
feedback_help_link_type: ''
feedback_help_link_url: ''
word_count: 635
asset_id: security-and-governance
moniker_range_name:
monikers: []
item_type: Content
source_path: copilot-studio/security-and-governance.md
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/c389ea6b-b6a0-46df-93a1-1e21f25e19e7
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/19ada1b6-705b-4ed7-aad0-bffd1bd03dfa
platformId: 970a3815-c6b1-7c10-3176-8f8c33d9a1b9
---

# Security and governance - Microsoft Copilot Studio | Microsoft Learn

Copilot Studio follows a number of security and governance controls and processes, including geographic data residency, data loss prevention (DLP), multiple standards certifications, regulatory compliance, [environment routing](/en-us/power-platform/admin/default-environment-routing), and regional customization. For more information and details on how Copilot Studio agent handle data, see [Geographic data residency in Copilot Studio](geo-data-residency).

This article provides an overview of the security practices followed by Copilot Studio, a list of security and governance controls and features, and examples and suggestions for employing safety and security within Copilot Studio for your agent makers and users.

## Security and governance controls

| Control | Core scenario | Related content |
| --- | --- | --- |
| Agent runtime protection status | Makers can see the security status of their agents from the Agents page. | [Agent runtime protection status](security-agent-runtime-view) |
| Data policy controls | Admins can use data policies in the Power Platform admin center to govern the use and availability of Copilot Studio features and agent capabilities, including:<br>- Maker and user authentication<br>- Knowledge sources<br>- Actions, connectors, and skills<br>- HTTP requests<br>- Publication to channels<br>- AppInsights<br>- Triggers | [Configure data policies for agents](admin-data-loss-prevention) |
| Makers audit logs in Microsoft Purview for admins | Admins have full visibility into maker audit logs in Microsoft Purview. | [View audit logs](admin-logging-copilot-studio) |
| Audit logs in Microsoft Sentinel for admins | Admins can monitor and receive alerts on agent activities through Microsoft Sentinel. | [View audit logs](admin-logging-copilot-studio) |
| Run tools with user credentials | Agent makers can configure tools to use the user’s credentials by default. | [Use tools with custom agents](add-tools-custom-agent#authentication-considerations-for-tools) |
| Sensitivity label for Knowledge with SharePoint | Agent makers and users can see the highest sensitivity label applied to sources used in the agent's response and individual reference labels in the chat. | [View sensitivity labels for SharePoint data sources](sensitivity-label-copilot-studio) |
| User authentication with certificates | Admins and makers can configure agents to use Entra ID manual authentication with certificate provider. | [Configure user authentication](configuration-end-user-authentication#authenticate-manually) |
| Maker security warning | Makers can see security alerts for their agent before publishing it when security and governance default configurations are modified. | [Automatic security scan in Copilot Studio](security-scan) |
| Environment routing | Admins can configure environment routing to provide their makers a safe space to build agents. | [Work with Power Platform environments](environments-first-run-experience) |
| Maker welcome message | Admins can configure a maker welcome message to inform makers about important privacy and compliance requirements. | [Work with Power Platform environments](environments-first-run-experience) |
| Autonomous agents governance with data policies | Admins can manage agent capabilities with triggers using data policies, ensuring protection against data exfiltration and other risks. | [Configure data policies for agents](admin-data-loss-prevention) |
| CMK | Admins can enable customer-managed encryption keys (CMK) for their Copilot Studio environments. | [Configure customer-managed encryption keys](admin-customer-managed-keys) |

## Security Development Lifecycle

Copilot Studio follows the Security Development Lifecycle (SDL). The SDL is a set of strict practices that support security assurance and compliance requirements. Learn more at [Microsoft Security Development Lifecycle Practices](https://www.microsoft.com/securityengineering/sdl/practices).

## Data processing and license agreements

The Copilot Studio service is governed by your commercial license agreements, including the [Microsoft Product Terms](https://go.microsoft.com/fwlink/?linkid=2182773) and the [Data Protection Addendum](https://go.microsoft.com/fwlink/?linkid=2153219). For the location of data processing, refer to the [geographical availability documentation](https://dynamics.microsoft.com/availability-reports/).

## Compliance with standards and practices

The [Microsoft Trust Center](https://www.microsoft.com/trustcenter) is the primary resource for Power Platform compliance information.

Learn more at [Copilot Studio compliance offerings](admin-certification).

## Data loss prevention and governance

Copilot Studio supports an extensive set of [data loss prevention features](admin-data-loss-prevention) to help you manage the security of your data, along with [Power Platform data policies](/en-us/power-platform/admin/prevent-data-loss).

Additionally, to further govern and secure Copilot Studio using generative AI features in your organization, you can:

- Disable agent publishing: Your admin can use the Power Platform admin center to turn off the ability to publish agents that use generative AI features for your tenant.

    ![Screenshot of the Power Platform admin center showing the option to turn off the ability to publish agents that use generative AI features.](media/security-governance/disable-ai-bot-publishing.png)
- [Disable data movement across geographic locations](manage-data-movement-outside-us) for Copilot Studio generative AI features outside the United States.
- [Use the Microsoft 365 admin center to govern the conversational and AI actions and agents that show in Microsoft 365 Copilot](copilot-plugins-enable-admin).

Finally, Copilot Studio supports securely accessing customer data using [Customer Lockbox](/en-us/power-platform/admin/about-lockbox).