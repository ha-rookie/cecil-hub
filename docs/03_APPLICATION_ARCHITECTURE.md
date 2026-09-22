# Application Architecture

## Application Type

Frameworkを使用しない静的Webアプリケーション。

```text
public/
  index.html
  privacy.html
  404.html
  en/
    index.html
    privacy.html
    404.html
  styles.css
  script.js
  analytics.js
  robots.txt
  sitemap.xml
  _headers
  patterns/
```

## Responsibilities

### index.html
- Semantic structure
- Content
- External links
- SEO metadata

### styles.css
- Layout
- Responsive
- Light / Dark color variables
- Geometry placement
- Accessibility-oriented visual states

### script.js
- Theme mode switching
- Auto / Dark / Light
- localStorage persistence
- ページの `lang` に合わせたTheme切替のaccessibility label

v1では翻訳本文をJavaScriptで差し替えない。言語ごとに静的HTMLを持ち、URLを言語の正本とする。

### patterns/
装飾用SVG。

モチーフ:
- hexagon
- grid
- node
- drafting line
- neon dot

使用しない:
- compass
- direction / 方位を直接表すモチーフ

## Localization

v1はURL分離型の静的多言語構成とする。

```text
/                 Japanese Home
/en/              English Home
/privacy          Japanese Privacy
/en/privacy       English Privacy
```

CSS / JavaScript / Imagesは共通Assetを使用する。英語配下からの共通Asset参照はroot absolute pathを基本とする。
ブラウザ言語による強制リダイレクト、runtime翻訳、言語Cookieは採用しない。
本格i18nへの移行条件はIssue #66を正本とする。

## State

Client stateはtheme modeのみ。

```text
theme-mode = auto | dark | light
```

localStorageを利用する。

## Data

v1のFeatured・Apps一覧・記事・About等の公開コンテンツは静的HTMLとして管理する。

コンテンツ更新頻度が増え、更新コストが明確になった場合のみJSON化やCMS化を検討する。

## External Interfaces

公開リンクのみ。

秘密情報・API key・OAuthは使用しない。

## Failure Handling

- 不明URL: `404.html`
- 外部リンク障害: Cecil側では代替処理を持たない
- JavaScript無効時: Theme手動切替以外の主要コンテンツは閲覧可能
