---
layout: Conceptual
title: Copilot Studio の新機能 - Microsoft Copilot Studio | Microsoft Learn
canonicalUrl: https://learn.microsoft.com/ja-jp/microsoft-copilot-studio/whats-new
schema: Conceptual
author: rapraj
breadcrumb_path: /microsoft-copilot-studio/breadcrumb/toc.json
depot_name: Learn.copilot-studio
description: 今後数か月でリリースされる新しいMicrosoft Copilot Studio機能に関する情報を確認します。
document_id: 2e045506-dde0-f379-4874-f26758bc471b
document_version_independent_id: 2e045506-dde0-f379-4874-f26758bc471b
feedback_product_url: https://powerusers.microsoft.com/t5/Power-Virtual-Agents-Community/ct-p/PVACommunity
feedback_system: Standard
git_commit_id: 8087b38ebadb2e407b9ec5928535193962d9e153
gitcommit: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/8087b38ebadb2e407b9ec5928535193962d9e153/copilot-studio/whats-new.md
locale: ja-jp
manager: rickcatalano
ms.author: rapraj
ms.collection: bap-ai-copilot
ms.custom: ignite-2024
ms.date: 2026-03-06T00:00:00.0000000Z
ms.reviewer: kjette
ms.service: copilot-studio
ms.topic: whats-new
ms.update-cycle: 180-days
original_content_git_url: https://github.com/MicrosoftDocs/businessapps-copilot-docs-pr/blob/live/copilot-studio/whats-new.md
recommendations: true
search.app:
- capaedac-pva
- powervirtualagents-docs
site_name: Docs
uhfHeaderId: MSDocsHeader-MicrosoftCopilotStudio
updated_at: 2026-03-11T14:28:00.0000000Z
ms.translationtype: MT
ms.contentlocale: ja-jp
loc_version: 2026-03-09T14:43:00.7147597Z
loc_source_id: Github-695322009#live
loc_file_id: Github-695322009.live.Learn.copilot-studio.whats-new.md
page_type: conceptual
toc_rel: toc.json
feedback_help_link_type: ''
feedback_help_link_url: ''
word_count: 5485
asset_id: whats-new
item_type: Content
cmProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/46e3c7c4-fe77-4a6e-b40a-44c569819fa5
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/c389ea6b-b6a0-46df-93a1-1e21f25e19e7
spProducts:
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/d0c6fab8-2d7d-4bb0-bf40-589e08d7c132
- https://microsoft-devrel.poolparty.biz/DevRelOfferingOntology/19ada1b6-705b-4ed7-aad0-bffd1bd03dfa
platformId: 7423340e-b329-cc37-70c6-4df57c4b3962
---

# Copilot Studio の新機能 - Microsoft Copilot Studio | Microsoft Learn

この記事では、Copilot Studio の新機能について説明します。

## リリース計画

今後の数か月でリリースされる新機能については、[リリース プランナー](https://aka.ms/BAP/ReleasePlanning/Portal) を参照して計画に使用していただけます。

## リリースされたバージョン

過去数週間にリリースされた新機能、修正プログラム、および機能強化については、「[released versions of Microsoft Copilot Studio](/ja-jp/power-platform/released-versions/copilotstudio)」を参照してください。

注意

リリースは、数日間にわたってロールアウトします。 新規または更新された機能はすぐに表示されないことがあります。

## 注目すべき変更

次のセクションでは、過去数か月間にリリースされた機能の一覧と関連情報へのリンクを示します。

### 2026 年 3 月

- (プレビュー)[Work IQ](use-work-iq) ツールを使用して、Microsoft 365 Copilotとエージェントを Work IQ サービスに接続し、Microsoft 365ファイル、電子メール、会議、チャットなどのリアルタイムの仕事の分析情報とコンテキストにアクセスできるようにします。

### 2026 年 2 月

- チケットベースのMicrosoft 365 Graph [connectors](advanced-connectors)のエージェント応答が改善されました。 エージェントは、[ServiceNow](/ja-jp/connectors/service-now/) チケットと[Azure DevOps](/ja-jp/connectors/visualstudioteamservices/)作業項目をより正確に取得し、明確で実用的なサマリーを生成し、ワークフローの信頼性と価値を高めます。
- [コンピューター使用](computer-use)エージェントの場合は、Claude Sonnet 4.5 (ベータ) を選択します。 このモデルにより、複雑なタスクの微妙な意思決定が向上し、信頼性が向上し、高度な使用の成功率が向上します。
- [プロンプト ビルダー](prompts-overview)の機能強化は次のとおりです。

    - プロンプトごとのコンテンツ モデレーションの感度を設定し、ヘイト/公正、性的、暴力、自傷行為のコンテンツのフィルター処理を制御します。管理対象モデルにおいて、感度が低いまたは高い設定によって規制およびドキュメント処理のシナリオをサポートします。
    - Claude Opus 4.6 または Claude Sonnet 4.5 を選択して新しいクロード モデルで [プロンプト](prompt-model-settings) を最適化し、推論の深さ、品質、待機時間、およびプロンプトあたりのコストをきめ細かく制御できるようにします。
    - エージェント ツールの詳細で[プロンプトの指示と設定をインラインで編集](nlu-generative-answers-prompt-modification)し、モデルの選択、入力、知識、テストを 1 つの合理化された作成エクスペリエンスに組み込みます。

### 2026 年 1 月

- (プレビュー)エージェント評価の新たな強化:

    - 評価結果に対してリアルタイムの [親指立て・低減フィードバック](analytics-agent-evaluation-results#see-and-rate-a-detailed-analysis-for-a-test-case) を提供し、評価の性能を検証し、評価信頼性の継続的な改善を促進します。
    - エージェントの入力、意思決定、出力の順序を [アクティビティマップ](analytics-agent-evaluation-results#see-and-rate-a-detailed-analysis-for-a-test-case) で確認することで、問題を素早く診断し、実行時にエージェントがどのように振る舞うかをより明確に把握できます。
    - 検証済み [のCSVテンプレート](analytics-agent-evaluation-create#create-a-test-set-file-to-import) を使ってテストセットを作成し、フォーマットの誤りを減らし、チームが評価データの標準化をより迅速に行えるようにしましょう。
- (プレビュー)新しいモデルサポート、組み込みの認証情報、セッションリプレイによる[監査ログ](computer-use)強化、[クラウドPCプーリング](monitor-computer-use#configure-advanced-computer-use-logging)などで[コンピュータ利用](use-cloud-pc-pool)能力を拡大し、エージェント主導のワークフローにおいてより高度なセキュリティ、スケーラビリティ、ガバナンスを実現します。
- (一般提供)Microsoft Visual Studio Code の Microsoft Copilot Studio 拡張機能を使用して、Microsoft Visual Studio Code 内でエージェントをビルド、編集、管理し、高度で柔軟性の高い開発者ワークフローをサポートします。

### 2025 年 12 月

- 複数のエージェントバージョンを並べて比較し、改善点を検証し、 [テストセットでエージェントを評価する](analytics-agent-evaluation-results)際に回帰を素早く見つけましょう。

### 2025 年 11 月

- Copilot Studio で使用されるモデルの更新:

    - 2025年11月24日、GPT-5 チャットは、ヨーロッパ地域とアメリカ地域での[一般提供](authoring-select-agent-model#model-availability-by-region)として Copilot Studio に展開されます。 一般提供されているモデルは、運用エージェントのオーケストレーションに使用できます。 オーケストレーション モデルの選択の詳細については、[エージェントのプライマリ AI モデルを選択する](authoring-select-agent-model) を参照してください。
- (プレビュー)エージェントの [Microsoft Entra エージェント ID](admin-use-entra-agent-identities) を自動的に作成します。 オンにすると、Microsoft Entra エージェント ID を割り当てることで、個々のエージェントに ID 管理を自動的に適用し、管理者がより効果的にエージェントをセキュリティで保護および管理できるようにします。
- [テナント グラフの基盤](knowledge-copilot-studio#tenant-graph-grounding-with-semantic-search)を使用して、SharePointを基盤とするエージェントの知識の取得を改善しました。 更新されたシステム アーキテクチャと新しい検索メソッドは、より正確でコンテキストに富んだ応答を提供し、回答の品質を向上させます。

注意

一部のクエリでは、待機時間が若干長くなる場合があります。

- [SharePoint メタデータ フィルター](knowledge-add-sharepoint)を使用して応答の精度を向上させます。 ファイル名、所有者、変更日などのメタデータを使用して、ナレッジ検索を調整し、最も関連性の高い最新のドキュメントからの応答を確実に取得します。
- [複数のエージェントを調整](authoring-add-other-agents) して特殊なエージェント間で複雑なタスクを分割し、精度を向上させ、エンドツーエンドの自動化を高速化します。 エージェントを他のエージェント (環境内または Microsoft Fabricデータ エージェントなど) にリンクして、タスク固有のモジュール化された機能を実現することで、エージェントを強化します。
- (プレビュー)ツールグループをエージェントに追加して、セットアップを迅速化しましょう。 エージェントに、OutlookコネクタとSharePointコネクタの厳選されたツールセットをすばやく 1 つのステップで装備できます。 これにより、セットアップが効率化され、エラーが減り、一貫性のある信頼性の高いオーケストレーションが保証されます。
- エージェントを [Microsoft 365 Copilot から Copilot Studio](/ja-jp/microsoft-365-copilot/extensibility/copilot-studio-experience?context=%2Fmicrosoft-copilot-studio%2Fcontext) にコピーします。 Microsoft 365 Copilotで作成したエージェントを Copilot Studio に簡単に移動して、マルチステップ ワークフロー、カスタム統合、より広範なデプロイ オプションなどの高度な機能のロックを解除できます。
- (プレビュー) [情報の要求](flows-request-for-information) アクションを使用して、エージェント ワークフローに人間の入力を追加します。 エージェント フローを一時停止して、Outlook経由で指定されたレビュー担当者から詳細を収集し、応答を動的パラメーターとして使用して実行を再開します。 このアクションにより、ワークフローはハードコーディングされた値に依存することなく、不足しているデータまたはコンテキストを処理できます。
- [新しい 'copilotstudio' 名前空間](admin-api-quarantine) を使用するように Power Platform API 呼び出しを更新します。 以前の名前空間は引き続き一時的に動作しますが、切り替えると、今後の更新プログラムとの互換性が確保されるようになりました。
- [コンポーネント コレクション](authoring-export-import-copilot-components) を使用して新しい機能強化を行います。 サイドバーから直接コレクションにアクセスし、コレクションをすばやくエクスポートまたはインポートし、プライマリ エージェントと、子エージェントやモデル コンテキスト プロトコル (MCP) を含む新しいコネクタの種類のサポートを利用します。

### 2025 年 10 月

- Copilot Studio で使用されるモデルの更新:

    - 2025 年 10 月 27 日から 31 日の間、GPT-4o は、GPT-4o を引き続き使用できる GCC のお客様を除き、生成オーケストレーションを使用するエージェントの場合、Copilot Studio で廃止されます。 新しい既定のモデルは [GPT-4.1](authoring-select-agent-model) であり、エクスペリエンス全体でパフォーマンス、信頼性、一貫性が向上します。 GPT-4o は、2025 年 11 月 26 日まで使用できます。[[廃止されたモデルの使用を続行](authoring-retired-model)する] オプションをオンにした場合。
    - 複数の [AI モデル](authoring-select-agent-model) から選択して、ニーズに合わせてエージェントのパフォーマンスを調整します。
    - (プレビュー) [GPT-5](authoring-select-agent-model) モデルをテストしてデプロイし、高度な機能を探索し、エージェントのパフォーマンスを向上させます。
- [Copilot Studio Kit](guidance/kit-overview) について説明します。これは、カスタム エージェントのテスト、AI 生成コンテンツの検証、会話の主要業績評価指標の分析などを支援する Power Customer Advisory Team (Power CAT) によって開発された一連のツールです。
- (プレビュー)関連するユーザーの質問を [テーマ](analytics-themes) にグループ化し、分析にドリルダウンしてパターンを明らかにし、より深い洞察を得ることができます。
- 自律型エージェントと会話型エージェント [の両方の時間とコスト削減](analytics-cost-savings) を追跡して、ROI を測定し、パフォーマンスを最適化します。
- [統合されたアクティビティとトランスクリプト ビューにアクセスし](authoring-review-activity)、セッションをピン留めし、より迅速で効果的なトラブルシューティングのためにフィードバックを送信します。
- (プレビュー) [フローの実行を高速化](agent-flow-express-mode) してタイムアウトを最小限に抑え、より高速でスムーズなユーザー エクスペリエンスを実現します。
- [モデル コンテキスト プロトコル (MCP) サーバー](mcp-add-components-to-agent)を使用して、動的でリアルタイムのコンテンツ (ファイル、データベース レコード、API 応答など) にアクセスし、より充実したコンテキストと改善されたエージェント応答を実現します。
- (プレビュー)カスタマイズ可能な [テスト セット](analytics-agent-evaluation-create) (アップロード、手動で作成、または AI 生成) を使用してエージェントを評価します。 テスト セットには、定義された参照回答に対して測定されたさまざまなテスト方法 (採点者) を使用してテスト ケースを含めることができ、チームが改善のための強みと領域を特定するのに役立ちます。 この機能は、さまざまなシナリオで、より信頼性の高い高品質のエージェント エクスペリエンスをサポートします。

### 2025 年 9 月

- (プレビュー)API が使用できない場合でも、インターフェイスと対話するためのビジョンと推論を組み合わせた [Computer-Using Agents (CUA)](computer-use) を使用して、Windows上のデスクトップ アプリケーションのタスクを自動化します。
- [Client SDK](publication-communicate-with-agent-from-native-app) を使用して android、iOS、Windows アプリにCopilot エージェントを埋め込み、ネイティブ エクスペリエンス内で豊富なマルチモーダルな会話を提供します。
- (プレビュー)エージェント用の Excel、CSV、PDF ファイルをアップロードし、チャットの code インタープリターを利用したPython コードを使用して分析します。

### 2025 年 8 月

- (一般提供)[code インタープリター](code-interpreter-for-prompts)を使用して、プロンプト ビルダーとエージェントワークフローの両方で自然言語からPythonコードベースのアクションを生成します。
- (一般提供)[file グループ](knowledge-file-groups)を使用して、Copilot Studio エージェントのエージェント応答の精度を向上させ、1 つのナレッジ ソースとしてアップロードするローカル ファイルを整理し、変数ベースの命令を適用します。
- Copilot Studio エージェントが分析して応答を生成するために使用できるファイルとイメージの[アップロード](image-input-analysis)をユーザーに許可し、エージェント フロー、Power Automate、コネクタ、ツール、トピックを使用してそれらのファイルをダウンストリーム システムに渡してシームレスに統合できるようにします。
- (一般提供) エージェントのパフォーマンスを向上させるため、分析ページの[生成された回答率と品質](analytics-improve-agent-effectiveness)セクションを使用して、未回答のクエリと回答生成 AI の品質を追跡および分析します。
- ガイド付きエクスペリエンスを使用して、Copilot Studio 内で既存の [MCP サーバー](mcp-add-existing-server-to-agent#option-1-use-the-mcp-onboarding-wizard-recommended)に直接接続します。

### 2025 年 7 月

- [高度な NLU カスタマイズ](nlu-plus-configure)を使用して、独自のデータを使用してトピックとエンティティを定義し、精度を高め、封じ込め機能を向上させます (特にDynamics 365シナリオの場合)。
- キーボード ショートカットまたはトップレベル検索でアクセスできる新しいアプリ内検索エクスペリエンスを使用して、[エージェント全体的な検索](authoring-search-within-agent)をすることで、知識、トピック、ツール、スキル、エンティティを即座に把握できます。
- 自律的な機能を持つエージェントの [ROI 分析](analytics-cost-savings)により、成功した実行やアクションに基づいて、時間とコストの節約を見積もり、組織の測定基準に合わせてカスタマイズできます。
- 分析で で[サムアップ/サムダウン](analytics-improve-agent-effectiveness)の反応と共に投稿されたユーザーコメントを表示し、エージェントの対応に対する顧客フィードバックの分析情報を提供します。
- (プレビュー)[Microsoft Information Protection (MIP)](sensitivity-label-copilot-studio) ラベルをコネクタ、テスト チャット、Teams、Microsoft 365 Copilot全体に表示して、セキュリティで保護された準拠した AI エクスペリエンスの過剰共有を防ぎ、サポートします。 Copilot Studio、Dataverse、および Microsoft Purview の間の新しい統合により、機密データを自動的に分類し、エージェントが Purview の秘密度ラベルを尊重するようにすることができます。
- [WhatsApp](publication-add-bot-to-whatsapp) の電話番号にエージェントを直接発行して、顧客に簡単にアクセスできるようになります。
- (プレビュー)SSO 同意カードを使用してMicrosoft Entra IDに基づくアクションとコネクタの認証を効率化します。これにより、ユーザーはリダイレクトなしで中断することなく、チャット内で直接同意を付与できます。

### 2025 年 6 月

- ツールのエクスペリエンスの向上:

    - ツールの検索と検出を容易にするグループ化とフィルター処理。
    - ツールを構成するときの、IntelliSense の自動入力と入力ウィジェット (カレンダー コントロール、ファイル ピッカー、タイムゾーン ピッカーなど) のサポート。
    - 複雑な入力に対するアフォーダンスの向上とより明確なエラー メッセージングにより顧客向けのツール呼び出しエクスペリエンスが改善。
    - コネクタの SSO の自動検出。
- (プレビュー) [ドメイン固有のタスク用に独自のエンタープライズ データでモデルをトレーニングし、これらのモデルを Teams、Word、チャットのCopilotなどのMicrosoft 365エクスペリエンスに統合するための、Microsoft 365 Copilotチューニングのサポート](microsoft-copilot-fine-tune-model)。 また、微調整されたモデルをカスタム エージェントに接続することもできます。
- 生成 AI が未回答のままにした質問に対する、テーマ別にグループ化された実用的な洞察が、[**分析**] ページの **回答率と品質** セクションにあります。
- 自律エージェントのナレッジ ソース分析。
- 埋め込み [プロンプト ビルダー プロンプト エディター](nlu-prompt-node#configure-and-test-a-prompt-with-the-prompt-editor) に直接 Power Fx 数式を挿入する機能。
- IsMatch、Match、または MatchAll 関数を使用する [Power Fx 数式](advanced-power-fx) の正規表現サポートにより、テキストの検証と抽出が簡略化されました。
- (プレビュー)ナレッジ ソースとしての [ファイル グループ](knowledge-file-groups) のサポート。
- (プレビュー) [サポートされているすべての言語](advanced-generative-actions#multilingual-support-with-generative-orchestration)で使用可能な生成オーケストレーション。
- 再設計された **[チャネル]** ページ。
- (米国のみのプレビュー)生成応答用の GPT-4.1 ミニ [実験応答モデル](nlu-preview-model) を選択する機能。