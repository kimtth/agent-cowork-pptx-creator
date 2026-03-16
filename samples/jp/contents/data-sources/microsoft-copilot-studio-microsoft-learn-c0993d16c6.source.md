---
layout: Conceptual
title: セキュリティとガバナンス - Microsoft Copilot Studio | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/ja-jp/microsoft-copilot-studio/security-and-governance
schema: Conceptual
author: iaanw
breadcrumb_path: /microsoft-copilot-studio/breadcrumb/toc.json
depot_name: Learn.copilot-studio
description: Microsoft Copilot Studioで構築されたエージェントを作成、発行、および使用するときに、Power Platform とMicrosoft 365のセキュリティとガバナンスのコントロールを使用して、データのセキュリティを管理します。
document_id: c7034308-b622-990d-06b0-3f58ada51141
document_version_independent_id: c7034308-b622-990d-06b0-3f58ada51141
feedback_product_url: https://powerusers.microsoft.com/t5/Power-Virtual-Agents-Community/ct-p/PVACommunity
feedback_system: Standard
git_commit_id: 259f34bd847df9b0ea3f48407a1e0e27fe072868
gitcommit: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/259f34bd847df9b0ea3f48407a1e0e27fe072868/copilot-studio/security-and-governance.md
locale: ja-jp
ms.author: digantak
ms.collection: bap-ai-copilot
ms.custom: ignite-2024
ms.date: 2026-01-27T00:00:00.0000000Z
ms.reviewer: iawilt
ms.service: copilot-studio
ms.topic: concept-article
ms.update-cycle: 180-days
original_content_git_url: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/live/copilot-studio/security-and-governance.md
recommendations: true
search.app:
- capaedac-pva
- powervirtualagents-docs
site_name: Docs
uhfHeaderId: MSDocsHeader-MicrosoftCopilotStudio
updated_at: 2026-03-13T09:21:00.0000000Z
ms.translationtype: MT
ms.contentlocale: ja-jp
loc_version: 2026-03-13T07:04:15.3286456Z
loc_source_id: Github-695322009#live
loc_file_id: Github-695322009.live.Learn.copilot-studio.security-and-governance.md
page_type: conceptual
toc_rel: toc.json
feedback_help_link_type: ''
feedback_help_link_url: ''
word_count: 1921
asset_id: security-and-governance
item_type: Content
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/c389ea6b-b6a0-46df-93a1-1e21f25e19e7
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/19ada1b6-705b-4ed7-aad0-bffd1bd03dfa
platformId: 970a3815-c6b1-7c10-3176-8f8c33d9a1b9
---

# セキュリティとガバナンス - Microsoft Copilot Studio | Microsoft Learn

Copilot Studio は、地理的なデータ所在地、データ損失防止 (DLP)、複数の標準認定、規制コンプライアンス、環境ルーティング、地域のカスタマイズなど、さまざまなセキュリティとガバナンスの制御とプロセスに従います。 Copilot Studio エージェントがデータをどのように処理するかの詳細については、「Copilot Studio の[Geographic data residency](geo-data-residency)」をご参照ください。

この記事では、Copilot Studio に続くセキュリティプラクティスの概要、セキュリティとガバナンスの制御と機能の一覧、エージェントの作成者とユーザーに対して Copilot Studio 内の安全性とセキュリティを採用するための例と推奨事項について説明します。

## セキュリティとガバナンスに関する制御

| コントロール | コア シナリオ | 関連するコンテンツ |
| --- | --- | --- |
| エージェント ランタイム保護の状態 | 作成者は、[エージェント] ページからエージェントのセキュリティ状態を確認できます。 | [エージェント ランタイム保護の状態](security-agent-runtime-view) |
| データ ポリシーの制御 | 管理者は、Power Platform 管理センターのデータ ポリシーを使用して、次のような Copilot Studio の機能とエージェント機能の使用と可用性を管理できます。<br>- 作成者とユーザーの認証<br>- ナレッジ ソース<br>- アクション、コネクタ、スキル<br>- HTTP リクエスト<br>- チャネルへの公開<br>- AppInsights<br>- トリガー | [エージェントのデータ ポリシーを構成する](admin-data-loss-prevention) |
| 管理者向けのMicrosoft Purviewの作成者監査ログ | 管理者は、Microsoft Purviewで作成者監査ログを完全に可視化できます。 | [監査ログの表示](admin-logging-copilot-studio) |
| Microsoft Sentinel 管理者用の監査ログ | 管理者は、Microsoft Sentinelを介してエージェント アクティビティのアラートを監視および受信できます。 | [監査ログの表示](admin-logging-copilot-studio) |
| ユーザー資格情報を使用してツールを実行する | エージェント作成者は、既定でユーザーの資格情報を使用するようにツールを構成できます。 | [カスタム エージェントでツールを使用する](add-tools-custom-agent#authentication-considerations-for-tools) |
| SharePointと共に使用するナレッジの感度ラベル | エージェント作成者とユーザーは、エージェントの応答で使用されるソースに適用される最高の秘密度ラベルと、チャット内の個々の参照ラベルを確認できます。 | [SharePoint データ ソースの秘密度ラベルを表示する](sensitivity-label-copilot-studio) |
| 証明書によるユーザー認証 | 管理者と作成者は、エージェントを構成することで、証明書プロバイダーで Entra ID 手動認証を使用するように設定できます。 | [ユーザー認証を構成する](configuration-end-user-authentication#authenticate-manually) |
| 作成者のセキュリティ警告 | 作成者は、セキュリティとガバナンスの既定の構成が変更されたときに、エージェント を公開する前にセキュリティ アラートを確認できます。 | [Copilot Studio での自動セキュリティ スキャン](security-scan) |
| 環境ルーティング | 管理者は、環境ルーティングを構成することで、作成者がエージェントを構築するための安全なスペースを提供できるようになります。 | [Power Platform 環境に関する作業](environments-first-run-experience) |
| 作成者のようこそメッセージ | 管理者は、作成者のウェルカム メッセージを構成して、重要なプライバシーとコンプライアンスの要件について作成者に通知できます。 | [Power Platform 環境に関する作業](environments-first-run-experience) |
| データ ポリシーを使用した自律エージェントのガバナンス | 管理者は、データ ポリシーを使用してトリガーを使用してエージェント機能を管理し、データ流出やその他のリスクに対する保護を確保できます。 | [エージェントのデータ ポリシーを構成する](admin-data-loss-prevention) |
| CMK | 管理者は、Copilot Studio 環境でカスタマー マネージド暗号化キー (CMK) を有効にすることができます。 | [カスタマー マネージド暗号化キーを構成する](admin-customer-managed-keys) |

## セキュリティ開発ライフサイクル

Copilot Studio は、セキュリティ開発ライフサイクル (SDL) に従います。 SDL は、セキュリティ保証とコンプライアンス要件をサポートする一連の厳格なプラクティスです。 詳細については、[Microsoft セキュリティ開発ライフサイクル プラクティス](https://www.microsoft.com/securityengineering/sdl/practices) を参照してください。

## データ処理とライセンス契約

Copilot Studio サービスは、[Microsoft 製品使用条件](https://go.microsoft.com/fwlink/?linkid=2182773)および[Data Protection 補遺](https://go.microsoft.com/fwlink/?linkid=2153219)を含む、商用ライセンス契約によって管理されます。 データ処理の場所については、[地理的な可用性に関するドキュメント](https://dynamics.microsoft.com/availability-reports/)を参照してください。

## 標準と慣行の遵守

[Microsoft セキュリティ センター](https://www.microsoft.com/trustcenter) は、Power Platform コンプライアンス情報の主要なリソースです。

詳細については、[Copilot Studio コンプライアンス オファリング](admin-certification)を参照してください。

## データ損失の防止とガバナンス

Copilot Studio では、[データ損失防止機能](admin-data-loss-prevention)の広範なセットがサポートされ、[Power Platform データ ポリシー](/ja-jp/power-platform/admin/prevent-data-loss)と共にデータのセキュリティを管理できます。

さらに、組織内のジェネレーティブ AI 機能を使用して、Copilot Studio をさらに管理およびセキュリティで保護するために、次のことができます。

- エージェントの発行を無効にする: 管理者は Power Platform 管理センターを使用して、テナントに対して生成 AI 機能を使用するエージェントを発行する機能をオフにすることができます。

    ![生成 AI 機能を使用するエージェントの公開機能をオフにするオプションを示す Power Platform 管理センターのスクリーンショット。](media/security-governance/disable-ai-bot-publishing.png)
- [アメリカ合衆国外での Copilot Studio の生成 AI 機能に対する地理的な場所を横断するデータの移動を無効にする](manage-data-movement-outside-us).
- Microsoft 365 管理センターを使用して、Microsoft 365 Copilot。

最後に、Copilot Studio では、[Customer Lockbox](/ja-jp/power-platform/admin/about-lockbox) を使用して顧客データに安全にアクセスできます。