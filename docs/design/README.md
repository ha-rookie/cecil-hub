# Cecil Visual Design

## Status

Issue #45 design proposal / human review pending.

Production実装前に `docs/design/` のDesign Previewで上半分を確認する。

## Brand

Display name: `CECIL`

CECILは、書き手・開発者・街を歩く人を別々の人格として分断せず、ひとつの個人活動ブランドとして扱う。

活動の流れ:

```text
探索 → 探求 → 創造 → 発信 → 新しい探索
```

3つの見せ方:

- 言葉で探る — WRITING
- 作って探る — WEB APP
- 歩いて探る — LOCAL

## Key Visual

### Concept

「記憶のように淡く重なる地図・記録・観測図の中に、半透明の核が静かに存在し、一本の古い軌道だけが途中から精密な未来の線へ変わり、まだ描かれていない先へ消えていく。」

### Visual roles

- 面: 未知 / 記憶 / 時間 / 余白
- 核: 水晶。考えや経験が一度形を持った地点
- 流れ: 軌道 / 薄い線 / つながり
- 接点: 地図 / 街 / 技術 / 本 / 食 / 人など外界との接触
- Accent: muted teal。未来を描かず、未来の兆候だけを置く

### Keep

- warm ivory〜pale blue-gray
- translucent crystal
- celestial map
- terrain / architecture
- archival records
- small muted teal point
- generous blank space
- asymmetry

### Avoid

- neon cyber / HUD
- strong glow
- dark fantasy
- luxury-jewelry crystal
- dense decoration
- image-embedded brand copy
- approved assetの独断再生成

## Page hierarchy — v1 target

1. Header
2. CECIL Key Visual
3. Hero
4. Featured Works
5. Ways of Exploring
6. About CECIL
7. Links
8. Footer

Issue #45では **1〜4のみ** をレビュー対象とする。

## Header

- Mobile height: about 56–64px
- backgroundはKey Visualとほぼ連続
- shadow / heavy glass / thick borderなし
- `CECIL` を左
- Theme controlは将来実装。Issue #45のLight previewでは非対象
- Desktop navは最小限

## Key Visual layout

### Mobile

- height: roughly `clamp(560px, 74svh, 760px)`
- approved portrait asset
- crystal slightly right / above center
- bottom 15–20%をCSSでbackgroundへ溶かす
- CECILは画像へ焼き込まずHTML overlay

### Desktop

- height: roughly `clamp(650px, 74vh, 900px)`
- approved landscape asset
- leftにCECIL overlay用余白
- crystal slightly right of center
- bottomをCSS fade

## Hero

Eyebrow:

`SYSTEM ENGINEER / DEVELOPER / WRITER`

Main:

`40代SEが、AI時代の違和感を、作り、書き、考える。`

Copy:

`現場の引っかかりや、生活の小さな不便を、Webアプリと文章にして試しています。`

Light版ではKey Visualの余韻を残し、画像から文章へ急に切り替えない。

## Featured Works

最新順ではなく、CECILの活動幅を一目で伝える3件。

### WEB APP

Title: `朝マズメ潮ナビ`

Description:
`潮や天気など、釣りの前に見たい情報をひとつに整理したWebアプリです`

Role: 作って探る

Image: existing approved OGP

### WRITING

Display title: `違和感が残る文章を読みたい`

Official title:
`noteを書いていて思う。うまい文章より、違和感が残る文章を読みたい`

Description:
`気になったことを通り過ぎず、仕事や生活の引っかかりを言葉にして残しています`

Role: 言葉で探る

### LOCAL

Title: `名古屋ランチ`

Description:
`名古屋を歩いて、食べて、気になった店を記録しています`

Role: 歩いて探る

Image composition:
- 味処 叶の店頭 35%
- 味噌カツ 65%
- 店 = context
- 料理 = main subject

## Featured layout

Desktop:
- 3 equal-width works
- image + label + title + short description + arrow
- no floating white cards
- no strong shadow
- image tone remains individual; unified by spacing / typography / subtle overlay

Mobile:
- 1 column
- image first
- text below
- image aspect around 1.91:1 where possible

## Typography v1

### Brand

`CECIL`
- Newsreader 400
- uppercase
- letter-spacing: about .10em

### Japanese / UI

Primary:
`"Noto Sans JP", "Hiragino Sans", "Yu Gothic", system-ui, sans-serif`

- Hero / headings: 400–500
- body: 400
- hierarchy is created by size / whitespace, not heavy bold

Noto Serif JPは標準から外す。
Key Visual自体に古い地図・記録・星図の質感があるため、日本語まで明朝体にすると文芸誌・歴史系へ寄りすぎる。

Design PreviewではNewsreaderを外部配信で視覚確認してよいが、Productionではself-hostを第一候補として別Issueで決定する。

## Color — Light v1

- background: `#F2EFE8`
- surface: `#ECE7DD`
- surface-light: `#F8F6F1`
- text: `#2B2E2C`
- muted-text: `#666A66`
- line: `#D8D2C7`
- action/deep-green: `#3F514A`
- memory/bronze: `#8A745D`
- future/teal: `#6C7F7C`

Tealは1〜3%程度。一般リンク色として乱用しない。

## Motion — later implementation

- 2〜4個の小さな星だけ
- opacity breathing 4〜7秒
- unsynchronized
- no glow / scale / color shift
- `prefers-reduced-motion` では停止

Issue #45の静的Design Previewでは必須ではない。

## Responsive baseline

- Mobile: <=767
- Tablet: 768–1199
- Desktop: >=1200

Side padding:
- Mobile 24px
- Tablet 40–56px
- Desktop 64–96px

Max content:
- about 1200px
- prose about 680px

## Review checklist — Issue #45

- 1440px class desktop
- 360〜430px smartphone
- CECIL lettering
- approved Key Visualの見え方
- HeroのSans typography
- Key Visual → Hero transition
- 3 Featured Worksの画像明暗
- 「作る / 書く / 歩く」が説明なしでも見えるか
- brandが文芸誌 / corporate / cyberへ寄りすぎないか
- approved assetsを再生成していないか

## Design Preview\n\nDesign Previewは表示面であり、設計の正本はRepository内の `docs/design/` と関連設計書・Issue・PRにある。\n\n## Design Source of Truth

- Approved latest design: GitHub `main`
- Proposed design: Issue #45 branch / PR
- Visual review surface: `docs/design/`
- Build / manual evidence: Google Drive
- Chat is working conversation, not final source of truth
