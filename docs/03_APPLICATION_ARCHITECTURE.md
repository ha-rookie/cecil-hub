# Application Architecture

## Application Type

Frameworkを使用しない静的Webアプリケーション。

```text
public/
  index.html
  styles.css
  script.js
  404.html
  robots.txt
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
- Theme mode switching only
- Auto / Dark / Light
- localStorage persistence

v1では業務ロジックをJavaScriptへ持たせない。

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
