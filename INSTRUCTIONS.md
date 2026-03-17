# Edge Delivery Services Migration — Agent Instructions

**Read this file and `PROJECT.md` at the start of every session.** This file defines rules, conventions, and workflows. `PROJECT.md` contains all project-specific data (blocks, tokens, infrastructure).

---

## Recommended Workflow

1. **Import your first page** — Content first. Use: `Migrate this page: [SOURCE_URL]`
2. **Import site-wide styles** — Global design tokens. Use: `Import the site-wide styles from [SOURCE_URL]`
3. **Style and critique blocks** — One block at a time. Use: `Style the [block-name] block` then `Critique the [block-name] block against the original`
4. **Set up navigation and footer** — Use: `Set up navigation from [SOURCE_URL]`
5. **Migrate additional pages** — Reuse blocks. Use: `Migrate this page: [URL]. Reuse existing blocks where possible.`
6. **Scale with bulk import** — Use: `Run bulk import on these pages: [URL1], [URL2], [URL3]`
7. **Ongoing evolution** — New blocks, refinements.

### Prompting Best Practices

- **One task per prompt** — At most 2–3 closely related items. Bundling many unrelated tasks causes dropped items.
- **Use skills explicitly** — "Critique the hero block" triggers block critique; "Fix the hero" gets ad-hoc editing.
- **Provide reference material** — When matching a visual detail, paste the exact CSS from the original site.
- **Plan before implementing** — For multi-file changes, propose an approach first; implement after approval.
- **Start fresh when context degrades** — Begin new sessions by reading this file and `PROJECT.md`.

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

---

## Image URL Rules

### Scene7 / Dynamic Media URLs (`media.jet2.com`)

16. **NEVER add file extensions to Scene7 URL paths** — Scene7 (Adobe Dynamic Media) treats extensions as part of the asset name. Adding `.jpg` to the PATH of `media.jet2.com/is/image/jet2/MyImage` makes it resolve to a completely different (default placeholder) asset.
17. **Always add `?fmt=jpg` to Scene7 URLs** — DA requires a recognizable format indicator on image URLs. Use the `fmt` query parameter (NOT a path extension). The `jet2-cleanup` transformer adds `?fmt=jpg` (or `&fmt=jpg`) automatically. The image is byte-identical with or without `fmt=jpg`.
18. **NEVER rewrite image CDN origins** — This project has two image CDN sources: `www.jet2holidays.com/-/media/` (Sitecore) and `media.jet2.com/is/image/jet2/` (Scene7). Keep images at their original CDN origin. Scene7 images do NOT exist on `www.jet2holidays.com` and vice versa.
19. **Strip Dynamic Media presets only** — Scene7 URLs may have a `:PresetName` suffix (e.g., `/image:DestCard`). Strip the colon and preset name, but do not modify anything else in the URL path.

### Sitecore Media Library URLs (`www.jet2holidays.com/-/media/`)

20. **Sitecore CDN ignores resize query params** — The `/-/media/` CDN ignores `?height=`, `?format=`, `?optimize=`, `?mw=`, `?w=`, and all other resize parameters. Large stock photos (e.g., Getty Images) can be 20MB+ at their original size. The query params in the source page HTML are purely decorative; the server always returns the full original.
21. **Proxy oversized Sitecore images via wsrv.nl** — DA has a 20MB per-image limit. The `jet2-cleanup` transformer automatically routes all `/-/media/` images through `wsrv.nl/?url=...&w=2000&fit=inside&output=jpg&q=85` to enforce max 2000px width. This keeps images under 1MB while maintaining quality. AEM's own CDN handles further optimization at delivery time.
22. **NEVER remove the wsrv.nl proxy step** — Without it, any page containing large Sitecore stock photos will fail DA preview with "Image exceeds allowed limit of 20MB".

### Local Preview Path

23. **Use `/content/` prefix for local preview** — The dev server runs with `--html-folder content`. Local `.plain.html` files are served at `http://localhost:3000/content/<page-path>` (e.g., `/content/destinations`). The path without `/content/` prefix proxies to the AEM backend, which may have different (or broken) content.

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

## Maintaining Documentation

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

---

## Reminders

1. Always read files before editing
2. Test in preview at localhost:3000
3. Update `PROJECT.md` when creating/modifying blocks, tokens, styles, or infrastructure
4. Use `box-sizing: border-box` when setting width/height on padded elements
5. Fragment files (nav, footer) must NOT have `<header>` or `<footer>` tags
6. Merge similar blocks into single multi-row blocks — don't create separate blocks per row
7. Parser-first workflow — update parsers, re-bundle, re-import. Direct `.plain.html` edits are last resort.
8. Check `PAGES.txt` before modifying parsers to understand impact
9. Start new sessions by reading this file and `PROJECT.md`
