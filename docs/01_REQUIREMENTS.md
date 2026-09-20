# Requirements

## Functional Requirements

### REQ-001 Home
Cecil の立ち位置と主要導線を10秒程度で理解できるHeroを表示する。

### REQ-002 Featured Works
代表作をカードで表示し、Demo / GitHub / ProtoPedia等の外部導線を必要に応じて提供する。

v1候補:
- くるくるソムリエ
- あと一杯ナビ
- よう拝

### REQ-003 Featured Writing
note の代表記事を厳選して表示する。単なる記事一覧にはしない。

### REQ-004 Activity
直近の制作・改善・調査活動を簡潔に表示する。

### REQ-005 About
匿名のSEとしての活動方針を説明する。

### REQ-006 Elsewhere
note / GitHub / ProtoPedia / X / Instagram / 楽天ROOM / LINE / マシュマロ等への外部リンクを提供する。

### REQ-007 Theme
OS設定へ自動追従し、Auto / Dark / Light を手動で切り替えられる。

### REQ-008 Responsive
スマートフォンを主要確認環境の一つとして扱い、412px前後でも可読性と操作性を維持する。

## Non Functional Requirements

### NFR-001 Privacy
勤務先・顧客・案件・内部情報を推測できる情報を公開しない。

### NFR-002 Repository Confidentiality
開発用RepositoryはPrivateとする。設計書・AGENTS・ADR・Issue/PR等を公開サイトのStatic Assetsへ含めない。

### NFR-003 Performance
v1は静的HTML/CSS/JavaScriptを基本とし、不要なFrameworkやRuntimeを追加しない。

### NFR-004 Accessibility
意味のあるHTML、十分なコントラスト、キーボード操作、aria属性を必要箇所で使用する。

### NFR-005 Security
Static AssetsにSecurity Headerを付与し、不要なcamera / microphone / geolocation権限を許可しない。

### NFR-006 SEO
title / description / OGPの初期情報を持つ。canonical / og:url / sitemap は本番URL確定後に追加する。

### NFR-007 Maintainability
v1はコンテンツ量が小さいため静的ファイルを正本とする。CMSは必要性が発生した時点で再評価する。

## Acceptance

- Light / Dark / mobileで表示崩れがない
- 外部リンクが意図したURLへ遷移する
- Theme切替がlocalStorageに保持される
- 404が独自ページになる
- Private開発情報がStatic Assetsへ混入しない
