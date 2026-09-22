# Requirements Traceability

| Requirement | Design / Implementation | Verification |
|---|---|---|
| REQ-001 Home | `public/index.html` Hero | Mobile / Desktop visual review |
| REQ-002 Featured | `#featured` | Representative-content / link review |
| REQ-003 Featured Writing | `#writing` | Article link review |
| REQ-004 Activity | `#activity` | Content review |
| REQ-005 About | `#about` | Privacy review |
| REQ-006 Elsewhere | `#elsewhere` | External link check |
| REQ-007 Theme | `public/script.js`, CSS variables | Auto / Dark / Light |
| REQ-008 Responsive | `public/styles.css` | Smartphone visual review |
| REQ-009 Apps Index | `#apps` | All-app visibility / public-link / status review |
| NFR-001 Privacy | Public content review | Pre-release review |
| NFR-002 Repository Confidentiality | `public/` boundary | Deploy artifact review |
| NFR-003 Performance | Static architecture | Browser / Lighthouse later |
| NFR-004 Accessibility | Semantic HTML / contrast | Manual + automated later |
| NFR-005 Security | `public/_headers` | Header test after Preview |
| NFR-006 SEO | head metadata | Search/OG check after URL fixed |
| NFR-007 Maintainability | Static file structure | Repository review |

## Current Status

Issue #1 でv1設計・初期実装を行う。

本番URL依存項目（canonical / og:url / sitemap / Analytics）はURL確定後の別チェックとして残す。
