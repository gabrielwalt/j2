# Edge Delivery Services Migration — Agent Instructions

This file **complements** `AGENTS.md` with project-specific migration and authoring rules for the Jet2 Holidays EDS migration. It is written entirely for agents (Experience Modernization Agent, Cursor, Composer) executing user prompts on this project.

**Relationship to other docs:**
- **AGENTS.md** — Product-provided (AEM boilerplate). General EDS conventions, setup, block patterns. Do not modify.
- **PROJECT.md** — Single source of truth for blocks, tokens, templates, parsers, transformers, and import infrastructure. Keep it up-to-date when creating or modifying blocks, variants, section styles, tokens, or import infrastructure.
- **INSTRUCTIONS.md** — This file. Project-specific rules, constraints, and workflows.

---

## Session Start / Warm-Up

**When the user asks to "warm up by reading the project documentation," or at the start of every session:** Read `INSTRUCTIONS.md` and `PROJECT.md` before proceeding with any tasks. This loads project context, block library, and migration rules.

---

## Skill Workflow / Migration Order

Respect Experience Modernization Agent skill dependencies:

1. **Bulk import requires import infrastructure** — Migrate at least one representative page per template before running bulk import. Single-page migration creates page templates, parsers, and transformers that bulk import reuses.
2. **Block styling (phase 2) requires site-wide design (phase 1)** — Block CSS references global design tokens in `styles.css`. This project already has design tokens in `PROJECT.md` and `styles.css`. When migrating design, complete site-wide tokens before styling individual blocks.
3. **When migrating** — Map content to block variants, create import infrastructure (templates, parsers, transformers), and document it in `PROJECT.md`.

---

## CRITICAL RULES

1. **Always read files before editing** — Never modify code without reading it first.
2. **Use `box-sizing: border-box`** — When setting explicit width/height on elements with padding.
3. **REUSE existing blocks** — Always check the Block Reference in `PROJECT.md` before creating new blocks or variants.
4. **Keep `PROJECT.md` up-to-date** — Update it when creating/modifying/deleting blocks, variants, section styles, tokens, or import infrastructure.
5. **Create variants, not new blocks** — When a content pattern is similar to an existing block but needs different styling, create a VARIANT of that block (not a new block).
6. **Never import all-caps content as-is** — Convert to Title Case or Sentence case in HTML; apply `text-transform: uppercase` via CSS.
7. **Don't rely on bold/strong for block-wide styling** — Apply `font-weight: 700` via CSS. Reserve `<strong>` only for inline emphasis.
8. **Keep import scripts aligned with content `.plain.html`** — When changing content markup patterns, update all related parsers. Content `.plain.html` is the source of truth.
9. **NEVER push HTML content via Git** — Content lives in the CMS (DA), code lives in Git. Never add `.html` files to Git.
10. **NEVER commit or push to Git yourself** — The user handles all Git operations.
11. **Code must be compatible with DA markup** — DA wraps inline content in `<p>` tags. Block JS and CSS must handle this with flexible selectors.
12. **`.plain.html` is the single source of truth** — All content edits go to `.plain.html` files in `/content/`. No `.html` or `.md` files in the content folder.
13. **NEVER allow `.html` (non-`.plain.html`) or `.md` files in the content area** — The `/content/` directory must ONLY contain `.plain.html` files.
14. **Parser-first content workflow** — Content changes MUST go through the import pipeline: update parsers → re-bundle → re-import. Direct `.plain.html` edits are a LAST RESORT.
15. **Check `PAGES.txt` before modifying ANY parser** — Review `/PAGES.txt` to understand which pages may be affected. Flag concerns to the user before proceeding.
16. **Test in preview** — Verify changes at `http://localhost:3000`.
17. **Fragment files (nav, footer)** — Must NOT have `<header>` or `<footer>` tags.
18. **Merge similar blocks** — Prefer single multi-row blocks over separate blocks per row.

---

## Image URL Rules

### DA Image Download Constraint

19. **DA downloads images server-side** — When content is previewed/published in DA, DA's backend fetches each `<img src="...">` URL server-side. If the download fails, DA replaces the src with `about:error`. The `media_xxx` hash conversion happens entirely on DA's side — the helix-importer's `adjustImageUrls` only converts relative-to-absolute URLs, it does NOT create hashes.
20. **DA cannot download from `media.jet2.com` (Scene7/Akamai)** — Scene7 uses Akamai CDN which blocks DA's server-side requests (bot detection / IP blocking). Every direct `media.jet2.com` URL becomes `about:error` in DA. This was confirmed: 100% of direct Scene7 URLs failed, 100% of wsrv.nl-proxied URLs succeeded.

### All External Images Must Be Proxied via wsrv.nl

21. **Proxy ALL external images through wsrv.nl** — The `jet2-cleanup` transformer routes both Sitecore AND Scene7 images through `wsrv.nl/?url=...&w=2000&fit=inside&output=jpg&q=85`. This ensures DA can always download them (wsrv.nl is Cloudflare-backed, never blocked), enforces max 2000px width, and provides explicit format indicators.
22. **NEVER remove the wsrv.nl proxy step** — Without it, Sitecore images may exceed DA's 20MB limit, and Scene7 images will fail entirely with `about:error`.
23. **NEVER use direct `media.jet2.com` URLs in `.plain.html`** — Always proxy through wsrv.nl. Adding `?fmt=jpg` alone is NOT sufficient — DA still cannot download from Scene7 even with the format indicator.

### Scene7 / Dynamic Media URLs (`media.jet2.com`)

24. **NEVER add file extensions to Scene7 URL paths** — Scene7 (Adobe Dynamic Media) treats extensions as part of the asset name. Adding `.jpg` to the PATH of `media.jet2.com/is/image/jet2/MyImage` makes it resolve to a completely different (default placeholder) asset.
25. **Strip Dynamic Media presets only** — Scene7 URLs may have a `:PresetName` suffix (e.g., `/image:DestCard`). Strip the colon and preset name before proxying through wsrv.nl.

### Sitecore Media Library URLs (`www.jet2holidays.com/-/media/`)

26. **Sitecore CDN ignores resize query params** — The `/-/media/` CDN ignores `?height=`, `?format=`, `?optimize=`, `?mw=`, `?w=`, and all other resize parameters. Large stock photos (e.g., Getty Images) can be 20MB+ at their original size. The query params in the source page HTML are purely decorative; the server always returns the full original.

### Local Preview Path

26. **Use `/content/` prefix for local preview** — The dev server runs with `--html-folder content`. Local `.plain.html` files are served at `http://localhost:3000/content/<page-path>` (e.g., `/content/destinations`). The path without `/content/` prefix proxies to the AEM backend, which may have different (or broken) content.

---

## Block Reuse Guidelines

**IMPORTANT**: When importing new pages or content, ALWAYS prioritize reusing existing blocks and their variants.

### Before Creating a New Block

1. **Check the Block Reference in `PROJECT.md`** — Review all existing blocks and their variants
2. **Analyze if existing blocks can work** — Consider variants, section styles, or new variants
3. **Only create new blocks when** — No existing block can accommodate the content, structure is fundamentally different, or a variant would require >50% new code

### Decision Tree for Content Mapping

```
New content section identified
    ↓
Does it match an existing block's purpose?
    ├─ YES → Use that block (or variant, or section style)
    └─ NO → Is it similar to any existing block?
              ├─ YES → Create new VARIANT of that block
              └─ NO → Create new BLOCK (document it immediately in PROJECT.md!)
```

### Variant Naming Convention

- **Block-specific variants**: Prefix with block name (e.g., `carousel-hero`, `cards-featured`)
- **Generic variants**: Standalone name, reusable across blocks (e.g., `highlight`)

---

## Migration Rules

### Wide Viewport for Content Extraction

**Always set the browser viewport to wide desktop (≥1400px width) before extracting content from source pages.** Responsive images, background images, and some content (mega menus, "Show More") are only correct at desktop widths.

### Variant-First Approach

1. Identify the closest existing block
2. Create a variant by adding a class modifier
3. Add variant CSS in the same block's CSS file
4. Update JS if needed for variant-specific decoration

### Import Script Alignment

- Content `.plain.html` is the source of truth
- CSS handles presentation (bold, uppercase, colors)
- Create clean DOM elements in parsers (use `document.createElement()`, not source DOM nodes)
- Use DOM-walking for flexible page imports — collect block divs and default content in natural document order after parsers run

### `.plain.html` Content Format

**All content files use `.plain.html` (div format).**

- **Blocks**: `<div class="block-name">` (or `block-name variant-name` for variants)
- **Sections**: Top-level `<div>` wrappers (no `<hr>` separators)
- **Section metadata**: `<div class="section-metadata">` inside section
- **Page metadata**: `<div class="metadata">` at the end
- **No page shell** — no `<!DOCTYPE>`, `<html>`, `<head>`, `<body>`

---

## Content Architecture

### Strict Separation: Content in CMS, Code in Git

- **Code** (JS, CSS, config): Lives in Git, deployed via AEM Code Sync
- **Content** (HTML pages, fragments): Lives in DA (Document Authoring), previewed/published via AEM admin API

**Rules:** Never push HTML via Git. Never modify `.gitignore` to track HTML. Fragment content (nav, footer) comes from DA.

### DA Constraints

- **20MB per-image limit** — DA rejects images over 20MB during preview/publish with "Image exceeds allowed limit of 20MB". Use 19MB as the safety threshold. The `jet2-cleanup` transformer enforces this by proxying `/-/media/` images through wsrv.nl.
- **DA requires format indicators on image URLs** — Image URLs without a file extension or format query param (like `?fmt=jpg`) cause upload failures in DA. All images must have either a path extension (`.jpg`, `.png`) or a format query param (`fmt=jpg`, `output=jpg`). The `jet2-cleanup` transformer handles both cases automatically.
- **DA downloads images from URLs in `.plain.html`** — When content is previewed in DA, it fetches each `<img src="...">` URL and stores the result. If the URL returns a 22MB original, DA stores 22MB. Query params in the URL must actually produce a smaller response from the server — decorative params that the server ignores will NOT help.
- **Three image URL types in this project**:
  - `media_xxx` hashes (AEM backend) — Already optimized, have extensions, no issues
  - `media.jet2.com` (Scene7) — Small by default but **no file extensions**. `jet2-cleanup.js` adds `?fmt=jpg` automatically.
  - `www.jet2holidays.com/-/media/` (Sitecore) — Dangerous: ignores resize params, can be 22MB+. Auto-proxied by `jet2-cleanup.js`.

### DA Markup Compatibility

DA wraps inline content in `<p>` tags. Block CSS/JS must use flexible selectors (e.g., `:scope > a, :scope > p > a`). Never add JS to unwrap `<p>` tags — fix compatibility in CSS with button resets and in JS with dual selectors.

---

## CSS Guidelines

1. **Never use `!important`** — Increase selector specificity instead
2. **Use CSS custom properties** — Reference design tokens from `PROJECT.md`
3. **Edge-to-edge blocks** — Use `:has()` on wrapper: `main > div:has(.block-name)`
4. **Visually hidden text** — Use `clip-path: inset(50%)` instead of deprecated `clip`
5. **Backdrop filter** — Include both `-webkit-backdrop-filter` and `backdrop-filter`
6. **Avoid fragile selectors** — Don't depend on sibling element sequences. Prefer block/section variants with explicit class names.
7. **Scope all styles to the block class** — `.my-block .child-element`

---

## EDS Authoring Patterns

- **Link → Button**: Link alone in its own paragraph becomes a button
- **Section metadata**: Use `section-metadata` block for styles like `highlight`, `accent-bar`
- **Page templates**: Add `Template: template-name` to page metadata
- **One row per item**: In block tables (carousel, accordion), each row = one item
- **Data tables vs block tables**: Use the `data-table` block for actual data tables; block tables are converted by `convertBlockTables()`

---

## Documentation Maintenance

### When to Update PROJECT.md

| Event | Required Updates |
|-------|------------------|
| New block created | Add to Block Reference with all details |
| New variant added | Update block's variant table |
| Block deleted | Remove from Block Reference |
| New section style | Add to Section Styles table |
| New design token | Add to Design Tokens tables |
| New parser/transformer | Add to Import Infrastructure |
| Migration milestone | Update Migration Status |
| Font change | Update Fonts table |
| New icon added | Add to Icons table |

---

## Key Files

- **Project reference**: `/PROJECT.md` — All project-specific data
- **Global styles**: `/styles/styles.css`
- **Lazy styles**: `/styles/lazy-styles.css` (post-LCP)
- **Blocks**: `/blocks/`
- **Navigation**: Fragment at `/content/nav.plain.html`
- **Footer**: Fragment at `/content/footer.plain.html`
- **Import infrastructure**: `/tools/importer/`
- **Page inventory**: `/PAGES.txt` — List of all imported content pages
