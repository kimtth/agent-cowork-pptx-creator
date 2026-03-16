---
layout: Conceptual
title: Microsoft 365 Copilotでエージェント ビルダーを選択し、エージェントをビルドするCopilot Studioを選択します | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/ja-jp/microsoft-365-copilot/extensibility/copilot-studio-experience
schema: Conceptual
author: Lauragra
breadcrumb_path: /microsoft-365-copilot/extensibility/breadcrumb/toc.json
depot_name: MSDN.m365copilot-docs
description: エージェントを構築するための最適なツールMicrosoft 365 CopilotまたはCopilot Studioかどうかを判断する方法について説明します。
document_id: 9f5b31a5-79b6-20f5-3661-e27a801dce77
document_version_independent_id: 9f5b31a5-79b6-20f5-3661-e27a801dce77
feedback_help_link_type: get-help-at-qna
feedback_help_link_url: https://learn.microsoft.com/answers/tags/466/copilot-m365-development
feedback_product_url: https://learn.microsoft.com/microsoft-365-copilot/extensibility/feedback#microsoft-365-copilot-feedback
feedback_system: Standard
git_commit_id: 12450a6fc2769f3bdf59997fe6514acf2b848bac
gitcommit: https://github.com/MicrosoftDocs/m365copilot-docs-pr/blob/12450a6fc2769f3bdf59997fe6514acf2b848bac/docs/copilot-studio-experience.md
locale: ja-jp
ms.author: lauragra
ms.collection: ce-skilling-ai-copilot
ms.date: 2025-01-05T00:00:00.0000000Z
ms.localizationpriority: medium
ms.service: microsoft-365-copilot
ms.subservice: developer
ms.topic: concept-article
ms.update-cycle: 180-days
original_content_git_url: https://github.com/MicrosoftDocs/m365copilot-docs-pr/blob/live/docs/copilot-studio-experience.md
permissioned-type: public
site_name: Docs
uhfHeaderId: MSDocsHeader-M365CopilotExt
updated_at: 2026-01-06T20:39:00.0000000Z
ms.translationtype: MT
ms.contentlocale: ja-jp
loc_version: 2026-01-05T20:42:50.5777792Z
loc_source_id: Github-683119341#live
loc_file_id: Github-683119341.live.MSDN.m365copilot-docs.copilot-studio-experience.md
page_type: conceptual
toc_rel: toc.json
word_count: 3690
asset_id: copilot-studio-experience
item_type: Content
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0fc65d4-7c73-4029-a261-7f99ff744363
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/b2daec57-5914-4967-8ed3-1d444897ba59
platformId: 26f4645c-0a21-1aac-007c-0ba4fc8eab6f
---

# Microsoft 365 Copilotでエージェント ビルダーを選択し、エージェントをビルドするCopilot Studioを選択します | Microsoft Learn

Microsoft 365 CopilotおよびCopilot Studioのエージェント ビルダー機能は、Microsoft 365 および基幹業務システム全体で機能する、セキュリティで保護されたスケーラブルでインテリジェントなエージェントを構築するための強力なツールです。 どちらのツールでもエージェントを作成できますが、さまざまなニーズに対応します。 この記事では、シナリオに最適なものを選択するのに役立つ 2 つの違いについて説明します。

使用するツールを選択するときは、次の要因を考慮してください。

- **対象ユーザー** - エージェントを使用するユーザー
- **デプロイ スコープ** – エージェントをどの程度広く共有する予定ですか?
- **機能** – エージェントはどのようなタスクを実行しますか?
- **ガバナンスのニーズ** – エージェントには詳細なアプリケーション ライフサイクル管理が必要ですか?

次のデシジョン ツリーは、シナリオを適切なツールにマップするのに役立ちます。

![Microsoft 365 CopilotとCopilot Studioを選択するための決定ポイントを示すフローチャート。](assets/images/copilot-studio-agent-builder/copilot-studio-decision-flow.png)

まとめると、以下のようになります。

- 自然言語と既存のコンテンツ (たとえば、チームの SharePoint ファイルやメールからの質問に回答するボット) を使用して、自分または小規模なチーム用のエージェントをすばやく作成する場合は、**Microsoft 365 Copilotを選択**し、エージェント ビルダー機能を使用します。 エージェント ビルダーはシンプルでアクセスしやすく、Microsoft 365 Copilot エクスペリエンスと統合されているため、コードなしでコンテキストでエージェントを構築できます。
- 幅広い対象ユーザー (部署全体、organization、外部顧客など) のエージェントが必要な場合、またはエージェントにマルチステップ ワークフローやカスタム統合などの高度な機能が必要な場合、またはデプロイと管理をより詳細に制御する必要がある場合は、**Copilot Studioを選択**します。 Copilot Studioの完全版は、複雑またはスケーラブルなソリューション用の豊富なツールセットを備えたスタンドアロンの Web ポータルです。

注:

Microsoft 365 Copilotを使用してエージェントを作成し、後でCopilot Studioで使用できる機能を利用する場合は、エージェントをCopilot Studioにコピーできます。

次の表に、より詳細な機能の比較を示します。

| 機能 | Microsoft 365 Copilot | Copilot Studio |
| --- | --- | --- |
| アクセス ポイント | [Microsoft 365 Copilot アプリ](https://www.microsoft365.com/copilot) | [Copilot Studio](https://copilotstudio.microsoft.com) |
| ユーザーの種類 | インフォメーション ワーカー | 作成者と開発者 |
| エージェントターゲットの対象ユーザー | 個人または小規模のチーム。 | 部署、organization、または外部の顧客。 |
| エージェントの種類 | 軽量 Q&組織の知識を持つエージェント。 | マルチステップ ワークフローやビジネス システム統合などの複雑なシナリオで、エンタープライズ ガバナンスと堅牢な制御が必要なエージェント。 |
| 主な機能 | - 自然言語オーサリング<br>- コンテンツに焦点を当てた Q&Microsoft Graph のorganization コンテキストに基づくシナリオ<br>- Microsoft 365 データに対するユーザーのアクセス許可を尊重します<br>- Microsoft 365 Copilot オーケストレーター、基盤モデル、およびサービスを使用します | - 広範な公開と外部公開<br>- マルチステップ ロジック、承認、分岐ワークフローをサポート<br>- 高度な AI モデルとAzure AI サービスとの統合をサポート<br>- Microsoft 365 以外のデータ ソースと接続するための事前構築済みコネクタとカスタム コネクタへのアクセスを提供します<br>- 自律機能<br>- バージョン管理を含むライフサイクル管理ツール。開発、テスト、および運用環境。ロールベースのアクセス制御。テレメトリと分析。 |
| ユース ケース | Microsoft 365 Copilotを使用してビルドします。<br>- プロジェクトドキュメントに基づいて一般的な質問に回答するプロジェクト FAQ ボット。<br>- 従業員が内部製品マニュアルまたは Wiki から情報を見つけるのに役立つ製品ドキュメント アシスタント。<br>- 新しいチーム メンバーが内部ナレッジ ベースから回答を得るのに役立つオンボード エージェント。 | Copilot Studioを使用してビルドします。<br>- サポート チケットを作成し、問題を人間にエスカレートするカスタマー サポート エージェント。<br>- 従業員の IT 要求を処理し、適切なサポート チームにルーティングする IT ヘルプ デスクトリアージ エージェント。<br>- 販売データの取得、メモの作成、または承認ワークフローの開始を行う CRM のセールス アシスタント。 |
| 管理とガバナンス | 主にMicrosoft 365 管理センターを介して管理されます。 | エンタープライズ シナリオに対してきめ細かい制御を使用して、Power Platform 管理センターを通じて管理します。 |

## エージェントをMicrosoft 365 CopilotからCopilot Studioにコピーする

高度な機能または広範な統合オプションが必要な場合は、Microsoft 365 Copilotで作成されたエージェントをCopilot Studioにコピーできます。 このプロセスにより、Microsoft 365 Copilotで行われた作業が失われず、やり直す必要なくCopilot Studioで拡張できます。

Copilot Studioに移行すると、豊富なカスタマイズ、ガバナンス コントロール、拡張コネクタなどの追加機能がロック解除されます。 エージェントをコピーすると、エージェントのコア構成と手順が保持され、Copilot Studioでのみ使用できる詳細設定で拡張できます。

次の場合は、エージェントをコピーしてCopilot Studioすることを検討してください。

- エンタープライズ レベルのデプロイ オプションが必要です。
- より多くのデータ ソースと統合するか、高度なセキュリティ ポリシーを適用する必要があります。

詳細については、「[エージェントをCopilot Studioにコピーする](copy-agent-to-copilot-studio)」を参照してください。

## ライセンスの要件

Microsoft 365 Copilotのエージェント ビルダーとCopilot Studioの両方が、認証されたユーザーのMicrosoft 365 Copilotアドオン ライセンスに含まれています。 Copilot ライセンスをお持ちでない場合は、Copilot クレジットまたは従量課金制プランを使用して、どちらのエクスペリエンスにもアクセスできます。

また、Microsoft 365 Copilotでエージェント ビルダーを無料で使用して、Web ナレッジのみに基づいてエージェントを構築することもできます。 詳細については、「[Microsoft 365 Copilot Chatでのエージェントの使用](/ja-jp/copilot/agents)」を参照してください。

## エージェント ビルダーのガバナンス原則

Microsoft 365 Copilotのエージェント ビルダー機能を使用すると、ユーザーは再利用可能なテンプレートとして機能するエージェントを作成できます。 これらのエージェントは、反復可能なプロンプトとコンテンツ接続をパッケージ化することで、Microsoft Graph から分析情報を取得するのに役立ちます。 既存のエンタープライズ境界内で動作し、Microsoft 365 コントロールを尊重します。

エージェント ビルダーは、次の主要なガバナンス原則を適用します。

- **新しい特権なし** - エージェントは既存の Microsoft 365 アクセス許可を尊重します。 ユーザーが SharePoint サイト、Teams チャネル、または Outlook メールボックスにアクセスできない場合、エージェントはそれらのソースのコンテンツを表示しません。
- **組み込みの可視性と監査機能** - エージェントは Microsoft 365 内で表示されます。 Standard監査ログ、アクティビティ レポート、DLP/アイテム保持ポリシーが適用されます。

IT 管理者は、**Copilot**&gt;**Agents** ページを使用して、Microsoft 365 管理センターでエージェントの可視性、共有、ライフサイクル ポリシーを管理します。 管理者は次のことができます。

- エージェント インベントリとエージェント メタデータを表示します。
- 組織のポリシーに合わせてエージェントを有効、無効、割り当て、ブロック、または削除します。
- 従量課金制の課金を構成し、エージェントの使用状況と使用量を確認します。
- Microsoft Purview (秘密度ラベル、監査ログ) を使用してコンプライアンスを適用します。

管理者は、**Microsoft 365 管理 センター**&gt;**Copilot**&gt;**Settings**&gt;**Data access**&gt;**Agents** ページを使用してエージェント共有コントロールを管理することもできます。 詳細については、「 [エージェントを共有する](agent-builder-share-manage-agents#share-an-agent)」を参照してください。

## Copilot Studio ガバナンス原則

Copilot Studioは、多くの場合、メーカーや開発者が、より高度なエージェントの作成をサポートします。 これらのエージェントは、外部データ ソースの統合、API の呼び出し、複雑なワークフローの調整、Microsoft 365 を超えるシステムへの接続を行うことができます。部門または企業全体のソリューションに最適です。

Copilot Studioでは、次の主要なガバナンス原則が適用されます。

- **構造化開発** - アプリケーション ライフサイクル管理 (ALM) を使用すると、開発、テスト、および運用環境全体での開発が可能になります。
- **コネクタ ガバナンス** - 管理者は、エージェントが接続できるシステムを制御し、不正アクセスのリスクを軽減します。
- **環境レベルのポリシー** - データ損失防止 (DLP)、ロールベースのアクセス、監査が環境レベルで適用されます。
- **柔軟な展開** - 詳細なアクセス制御を使用して、Teams、Web サイト、カスタム エンドポイント間でエージェントを発行できます。
- **セキュリティで保護されたコラボレーション** - エージェントは、監督機能を備えた部門間のチームワークに対する表示/編集権限をサポートします。
- **開発と発行の監視** - アプリケーション ライフサイクル管理 (ALM) では開発/テスト/prod 環境がサポートされており、organizationのアプリ カタログへの発行には管理者の承認が必要です。 これにより、広く利用できるようになるものを可視性と制御が保証されます。

IT 管理者は、Power Platform 管理センターを使用して次の管理を行います。

- エージェント環境とコネクタ。
- ライフサイクル ポリシーと発行ワークフロー。
- Microsoft Purview によるコンプライアンス (秘密度ラベル、監査ログ、保持)。
- エージェントの動作を監視し、ポリシーの整合性を確保するためのテレメトリと使用状況分析。