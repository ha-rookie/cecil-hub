# Human / AI Collaboration Guardrails

## Purpose

この文書は、Human ownerとChatGPT/AIがGitHub、バイナリAsset、画像生成を共同で扱う際の共通ガードレールを定義する。

このルールはCECIL固有ではなく、HumanとAIのGitHub共同作業全体に適用する。Repository固有ルールは制約を追加できるが、このガードレールを暗黙に弱めてはならない。

## STOP Gate

GitHub URL提示、バイナリAsset操作、画像生成の直前に該当ルールを確認する。STOP条件に該当する場合は、その操作へ進まない。

## GR-001 GitHub URL presentation

HumanへGitHub URLを提示するとき:

- Markdownリンクにしない
- クリック可能なRich URLにしない
- GitHubアプリの意図しない起動を避けるため、コードブロック内へ生URLを記載する
- RepositoryやProjectを問わず適用する

**STOP:** GitHub URLをクリック可能な形で出そうとしている場合、コードブロックの生URLへ変換するまで出力しない。

## GR-002 Binary files use Human Upload by default

画像等のバイナリファイルは、AIがGitHubへ確実にUploadできる前提を置かない。

標準フロー:

1. AIがIssue専用Branchを作成または特定する
2. 必要ならAIがUpload先Folderを先に作る
3. AIがBranch、Folder、期待ファイル名、コピー用GitHub生URLをHumanへ提示する
4. HumanがバイナリをUploadする
5. Humanが完了を伝える
6. AIがGitHub上の実ファイルを確認する
7. Asset Workflowで必要なhash/SHA/寸法/形式を確認する

Connector/APIに輸送手段が見えても、AI側Binary Uploadを標準経路として繰り返し試さない。

**STOP:** AIが直接Binary Uploadを標準経路として選ぼうとした場合、Human Uploadへ戻す。

## GR-003 Image generation requires explicit approval

画像が役立ちそうという理由だけで新規生成しない。

生成前に、Humanが画像生成を明示的に依頼・承認していること、および必要な範囲で以下が合意済みであることを確認する。

- 用途
- 構図 / 主役
- 必須要素 / 禁止要素
- 色 / 明るさ / 質感
- 文字の有無
- サイズ / 比率
- 既存Designとの整合
- 今回のIteration範囲

Humanが合意済み画像について明示的に「作って」「生成して」と指示した場合は生成へ進める。

**STOP:** 明示的な生成許可がない、または重要なDesign方向が未合意ならImage Generationを実行しない。

## GR-004 “続けて” is scoped

「続けて」は現在合意している工程を継続する許可であり、以下を自動承認しない。

- 新しいVisual Concept
- 新規画像生成
- 破壊的GitHub操作
- Production公開
- Human approvalが必要なMerge
- 別Project/Scopeへの拡張

**STOP:** 工程境界を越える場合は必要なHuman判断を得る。

## GR-005 Upload completion handling

HumanがUpload完了を伝えた場合:

- まずGitHubを確認する
- 実際に確認失敗するまで再Uploadを依頼しない
- not found / branch-path違い / connector制約を区別する

## GR-006 Collaboration rules are separate from repository design

Repository文書はProduct Architecture、配置、Build/Deploy、Project固有制約を定義する。

この文書はHuman/AIの共同作業方法を定義する。

共同作業上の制約をApplication Architectureの判断として扱わない。両方が適用される場合は両方を満たす。


## GR-007 External capability / quota limitation

When a required external capability is unavailable because of quota, billing, permission, service outage, plan limitation, or another execution constraint, do not treat the dependent verification as successful or completed.

Examples include GitHub Actions, Cloudflare deployment/Preview, connectors, and other external execution services.

During a limitation:

1. identify the unavailable capability and affected repositories/workflows
2. continue only work that does not depend on that capability, such as design, code changes, documentation, and static review where appropriate
3. record each dependent check as **unverified / not executed**
4. distinguish a limitation from an implementation failure
5. keep a clear re-verification queue for after the limitation is removed
6. do not claim CI, Preview, deployment, smoke test, or other dependent checks passed when they did not run
7. do not use an unexecuted check as evidence for a Human approval gate, Merge gate, or Production decision that requires that check

A limitation in one repository or service must not be generalized to another repository without checking whether the same limitation actually applies there.

**STOP:** If a required gate depends on a currently unavailable capability, stop at that gate. Do not label the work verified or complete. Resume the blocked verification after the limitation is removed.

## Recurrence handling

Humanから再発を指摘された場合:

1. 違反したGR-IDを特定する
2. STOP Gateが機能しなかった理由を特定する
3. ガードレールまたは必須参照経路を強化する
4. 同じ意味の注意書きを重複追加するだけで済ませない
5. Templateや関連文書に矛盾する指示がないか確認する

再発は「注意不足」ではなくGuardrail failureとして扱う。
