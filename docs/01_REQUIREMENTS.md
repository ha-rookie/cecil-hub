# Requirements

## Functional Requirements

### REQ-001 Home
Cecil の立ち位置と主要導線を10秒程度で理解できるHeroを表示する。

### REQ-002 Featured
CECILの活動を象徴する代表コンテンツを厳選して表示する。全作品一覧の役割は持たせず、Web App / Writing / Localなど異なる活動の入口として扱う。

### REQ-003 Featured Writing
note の代表記事を厳選して表示する。単なる記事一覧にはしない。

### REQ-004 Now
開発作業履歴ではなく、現在進行形で考えているテーマを短く表示する。

v1:
- AIと人間は、どこで判断を分けるのか。
- AIとの会話から広がる仮説を、どう文章やアプリにしていくか。
- 作ることと書くことを、どうひとつにつなげるか。

日付 / APP / BUILD / RESEARCH等の内部活動ログは公開しない。

### REQ-005 About
匿名のSEとしての活動方針を説明する。

### REQ-006 Elsewhere
note / ProtoPedia / X / Instagram / 楽天ROOM / LINE / マシュマロ等、公開しているサービスへの外部リンクを提供する。GitHubはv1の公開導線に含めない。

### REQ-007 Theme
OS設定へ自動追従し、Auto / Dark / Light を手動で切り替えられる。

### REQ-008 Responsive
スマートフォンを主要確認環境の一つとして扱い、412px前後でも可読性と操作性を維持する。

### REQ-009 Apps Index
CECILを自作Webアプリの横断入口とし、公開中・開発中を含むアプリ一覧を表示する。

現在の掲載対象:
- 朝マズメ潮ナビ（公開中）
- あと一杯ナビ（公開中）
- よう拝（公開中）
- くるくるソムリエ（公開中）
- 想いの方角（開発中）

公開中のアプリは利用者向け正式URLへ直接遷移できること。
開発中で正式な公開URLが未確定のアプリは、無理に外部リンクを付けず状態を明示する。
ProtoPedia / GitHubはアプリ一覧の正本にせず、公開済みの場合だけ補助導線として扱う。
Private Repositoryへのリンクは掲載しない。

## Non Functional Requirements

### NFR-001 Privacy
勤務先・顧客・案件・内部情報を推測できる情報を公開しない。

### NFR-002 Repository Confidentiality
開発用RepositoryはPrivateとする。設計書・AGENTS・ADR・Issue/PR等を公開サイトのStatic Assetsへ含めない。

### NFR-003 Public Link Boundary
公開サイトからPrivate GitHub Repositoryまたは非公開開発情報へリンクしない。GitHub Public Mirrorを将来作成した場合のみ再検討する。

### NFR-004 Performance
v1は静的HTML/CSS/JavaScriptを基本とし、不要なFrameworkやRuntimeを追加しない。

### NFR-005 Accessibility
意味のあるHTML、十分なコントラスト、キーボード操作、aria属性を必要箇所で使用する。

### NFR-006 Security
Static AssetsにSecurity Headerを付与し、不要なcamera / microphone / geolocation権限を許可しない。

### NFR-007 SEO
title / description / OGPの初期情報を持つ。canonical / og:url / sitemap は本番URL確定後に追加する。

### NFR-008 Maintainability
v1はコンテンツ量が小さいため静的ファイルを正本とする。CMSは必要性が発生した時点で再評価する。

## Acceptance

- Light / Dark / mobileで表示崩れがない
- 公開中4アプリすべてをApps一覧から確認し、正式な公開アプリへ遷移できる
- 開発中の想いの方角がApps一覧で状態付きで確認できる
- FeaturedとApps一覧の役割が分離されている
- NOWが現在の思考を短く伝える
- 外部リンクが意図したURLへ遷移する
- Theme切替がlocalStorageに保持される
- 404が独自ページになる
- Private開発情報がStatic Assetsへ混入しない
