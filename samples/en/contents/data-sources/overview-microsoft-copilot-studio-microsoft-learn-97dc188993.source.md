---
layout: Conceptual
title: Overview - Microsoft Copilot Studio | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio
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
ms.custom: fundamentals, ceX
description: Build intelligent AI agents effortlessly with Microsoft Copilot Studio. Create, customize, and deploy agents across platforms using a low-code interface.
ms.date: 2026-02-09T00:00:00.0000000Z
ms.topic: overview
author: iaanw
ms.author: iawilt
ms.reviewer: stephkent
manager: kjette
locale: en-us
document_id: 05d66d0e-fa35-dc78-b6b8-fbab1081d2e8
document_version_independent_id: 05d66d0e-fa35-dc78-b6b8-fbab1081d2e8
updated_at: 2026-02-10T01:02:00.0000000Z
original_content_git_url: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/live/copilot-studio/fundamentals-what-is-copilot-studio.md
gitcommit: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/ca5691a6b6a56799d1a0be2a2e1f19dc9cc2de19/copilot-studio/fundamentals-what-is-copilot-studio.md
git_commit_id: ca5691a6b6a56799d1a0be2a2e1f19dc9cc2de19
site_name: Docs
depot_name: Learn.copilot-studio
page_type: conceptual
toc_rel: toc.json
feedback_help_link_type: ''
feedback_help_link_url: ''
word_count: 1334
asset_id: fundamentals-what-is-copilot-studio
moniker_range_name:
monikers: []
item_type: Content
source_path: copilot-studio/fundamentals-what-is-copilot-studio.md
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://authoring-docs-microsoft.poolparty.biz/devrel/1ae5c491-970a-4062-8301-6336e69f9026
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://authoring-docs-microsoft.poolparty.biz/devrel/f2c3e52e-3667-4e8a-bf11-20b9eaccdc8c
platformId: d6b4d1b3-6e6c-3c5f-90af-9143891d567a
---

# Overview - Microsoft Copilot Studio | Microsoft Learn

Copilot Studio is a graphical, low-code tool for building agents and agent flows.

[![Screenshot of the Copilot Studio Home page.](media/fundamentals-what-is-copilot-studio/home-page.png)](media/fundamentals-what-is-copilot-studio/home-page.png#lightbox)

One of the standout features of Copilot Studio is its ability to connect to other data sources by using prebuilt or custom connectors. With this flexibility, you can create and orchestrate sophisticated logic, ensuring that your agent experiences are powerful and intuitive.

The platform's low-code experience puts the power of AI at your fingertips, making it accessible even if you don't have an extensive technical background.

## What is an agent?

An agent is a powerful AI companion that can handle a range of interactions and tasks. It can resolve issues that require complex conversations and autonomously determine the best action to take based on its instructions and context. It coordinates language models, along with instructions, context, knowledge sources, topics, tools, inputs, and triggers to accomplish your goals.

Agents can engage with customers and employees in multiple languages across websites, mobile apps, Facebook, Microsoft Teams, or any channel supported by the Azure Bot Service. They can also improve productivity by performing tasks as part of a conversation or in reaction to a trigger to assist users and organizations.

You can easily create agents in Copilot Studio without the need for data scientists or developers. Some of the ways you might use agents include:

- Sales help and support issues
- Opening hours and store information
- Employee health and vacation benefits
- Public health tracking information
- Common employee questions for businesses

Use agents on their own or to extend Microsoft 365 Copilot with enterprise data and scenarios.

## What is an agent flow?

Agent flows offer a powerful way to automate repetitive tasks and integrate your apps and services. Agent flows can be triggered manually, by other automated events or agents, or based on a schedule.

With Copilot Studio, you can create agent flows by using natural language or a visual editor.

You can run agent flows as standalone automations. You can also configure an agent flow to trigger from an agent as a tool, and return results to the same agent.

## How does an agent conversation work?

Copilot Studio agents use customized NLU model and AI capabilities to understand what a user types or says, then respond with the best topic. A topic is a portion of a conversational thread between a user and the agent. For more information, see [Create and edit topics](authoring-create-edit-topics).

For example, you might create an agent for your customers to ask common questions about your business. Your agent reduces support overhead by deflecting support calls. In the agent, you can create a topic about your store's opening hours and name the topic **Store hours**.

When a customer asks a question such as "When do you open?" or "What are your opening hours?", the agent uses natural language understanding (NLU) to understand the *intent* behind the question. The agent matches that intent to the best topic, the **Store hours** topic.

The agent follows the *conversation flow*—which is a group of connected nodes—that you define in the **Store hours** topic. Some nodes can ask questions, while others use conditions (if/else) to determine which store the customer wants. The final output of the topic shows the hours and contact information for that specific store.

However, you can't anticipate all the types of questions your customers ask. To help mitigate this issue, Copilot Studio incorporates powerful AI-powered capabilities that use the latest advancements in NLU models. Once your agent is linked to knowledge sources, it can automatically generate responses. These responses are conversational, plain language, and you don't need to create topics for every eventuality.

You can also choose to let your agent access information outside its knowledge sources.

Copilot Studio can use AI powered by the Azure OpenAI GPT model, also used in Bing, to create topics from a simple description of your needs. Similarly, you can modify and update any topic in your agent by describing the changes you want to make.

## Access Copilot Studio

Access Copilot Studio as a standalone web app or as a discrete app within Teams. The Copilot Studio app for Teams supports classic chatbots only.

### Web app

Use cases:

- You're an IT admin who wants to create agents to perform tasks or interact with customers.
- You're familiar with agent services and want to trial or test Copilot Studio.
- You want to explore advanced agent concepts, such as entities and variables, and create complex agents.

Go to the web app at https://copilotstudio.microsoft.com

[Explore the Copilot Studio demo](https://copilotstudio.microsoft.com/tryit?azure-portal=true)

### Teams app

Use cases:

- You're an employee or member of an organization who wants to use chatbots to answer common employee questions.
- You want to use advanced concepts, such as entities and variables, and have a chatbot internally available in Teams.
- You want to create and distribute a chatbot quickly.

[Open or add the Copilot Studio app in Teams](https://aka.ms/PVATeamsApp?azure-portal=true)

## Plan your agent

Consider the following points when planning your agent.

### Extend Microsoft 365 Copilot with an agent

Consider extending Microsoft 365 Copilot with an agent if:

- You want to craft your own agent by declaring instructions, tools, and knowledge to customize Microsoft 365 Copilot for specific tasks and domain knowledge.
- You wish to utilize the existing Copilot orchestrator.
- You want a standalone custom version of the Microsoft 365 Copilot chat experience.

### Create an agent

Copilot Studio makes it easy to create agents. You only need to describe the agent you want in plain language. Tell Copilot Studio what specific instructions, triggers, knowledge sources, and tools you want for your agent. Then test your agent before you deploy it. Publish your agent when you're ready across multiple channels.

Consider creating an agent if:

- You want an agent that can:

    - Integrate company data and documents
    - Retrieve real-time data from external APIs
    - Take actions in response to external events
    - Be embedded in company applications
- You require a customized end-to-end solution for your web or mobile app or automation workflow that meets specific business needs and allows for complete control over product branding.
- You want to surface your agent to other agents as their supported agent extension.
- You're a proficient developer looking to create a customized end-to-end solution to cater to your business needs, and want:

    - Full control on product branding
    - Choice of language models and orchestration

    Or, if you're building products like:

    - A customer service chatbot for your e-commerce site
    - A virtual assistant to schedule appointments for your healthcare service
    - Gaming experiences that incorporate generative AI

## Accessibility

The agent authoring canvas is built for accessibility in accordance with [Microsoft accessibility guidelines](https://www.microsoft.com/accessibility/) and supports standard navigational patterns.

## Important information

Important

Microsoft Copilot Studio (1) is not intended or made available as a medical device for the diagnosis of disease or other conditions, or in the cure, mitigation, treatment or prevention of disease, or otherwise to be used as a component of any clinical offering or product, and no license or right is granted to use Microsoft Copilot Studio for such purposes, (2) is not designed or intended to be a substitute for professional medical advice, diagnosis, treatment, or judgment and should not be used as a substitute for, or to replace, professional medical advice, diagnosis, treatment, or judgment, and (3) should not be used for emergencies and does not support emergency calls. Any agent you create using Microsoft Copilot Studio is your own product or service, separate and apart from Microsoft Copilot Studio. You are solely responsible for the design, development, and implementation of your agent (including incorporation of it into any product or service intended for medical or clinical use) and for explicitly providing end users with appropriate warnings and disclaimers pertaining to use of your agent. You are solely responsible for any personal injury or death that may occur as a result of your agent or your use of Microsoft Copilot Studio in connection with your agent, including (without limitation) any such injuries to end users.