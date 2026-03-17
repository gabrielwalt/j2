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
13. **Keep `/sitemap.json` up-to-date at all times** — Update the sitemap whenever pages are discovered, imported, re-imported, refactored, validated, or approved. See "Sitemap Maintenance" section.
14. **Keep sitemap blocks[] current after every content change** — After import scripts, re-imports, or content changes, immediately update the affected page's `blocks[]` and `sectionStyles[]` in `/sitemap.json`.
15. **NEVER allow `.html` (non-`.plain.html`) or `.md` files in the content area** — The `/content/` directory must ONLY contain `.plain.html` files.
16. **Parser-first content workflow** — Content changes MUST go through the import pipeline: update parsers → re-bundle → re-import. Direct `.plain.html` edits are a LAST RESORT.
17. **Check sitemap before modifying ANY parser** — Before changing a parser, query `/sitemap.json` to identify ALL pages that use the affected block. Flag validated/approved pages to the user before proceeding.
18. **Always update sitemap blocks[] and sectionStyles[] after EVERY import** — This is mandatory, not optional.

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

### DA Markup Compatibility

DA wraps inline content in `<p>` tags. Block CSS/JS must use flexible selectors (e.g., `:scope > a, :scope > p > a`). Never add JS to unwrap `<p>` tags — fix compatibility in CSS with button resets and in JS with dual selectors.

---

## Sitemap Maintenance (`/sitemap.json`)

**`/sitemap.json` is the master tracker for the entire migration.** The agent MUST create and maintain it systematically.

### When to Update sitemap.json

| Event | Required Update |
|-------|-----------------|
| **New page discovered on original site** | Add entry to `pages[]` with `sourceUrl`, `imported: false` |
| **Page imported (content created)** | Set `imported: true`, populate `blocks[]` and `sectionStyles[]` — **MANDATORY** |
| **Import re-run on existing page** | Update `blocks[]` and `sectionStyles[]` to match new content |
| **Import validated** | Set `importValidated: true` |
| **Page critiqued/approved** | Set `critiqued: true` / `approved: true` |
| **Content refactored** | Update `blocks[]` and `sectionStyles[]` |
| **Page removed** | Remove the entry from `pages[]` |
| **New fragment created** | Add entry to `fragments[]` |
| **Parser modified** | Check ALL pages using that block; reset `importValidated` on affected pages if content may have changed |

### Sitemap Structure

```json
{
  "$schema": "sitemap",
  "$version": "1.0.0",
  "$description": "...",
  "fragments": [
    { "path": "/nav", "imported": false, "importValidated": false, "critiqued": false, "approved": false }
  ],
  "pages": []
}
```

### Page Entry Template

```json
{
  "path": "/path/to/page",
  "sourceUrl": "https://example.com/path/to/page.html",
  "imported": false,
  "importValidated": false,
  "critiqued": false,
  "approved": false,
  "blocks": [],
  "sectionStyles": []
}
```

### Sitemap Rules

1. **Create `/sitemap.json` at project start** — Before or during the first page migration.
2. **Discover pages systematically** — When scraping or analyzing the source site, add every discovered page to `pages[]` with `imported: false`.
3. **Paths use no extension** — e.g., `/us/en/home`, not `/us/en/home.html`
4. **Source URLs** — Always include the full original site URL
5. **blocks[] and sectionStyles[]** — Simple string arrays. Every imported page MUST have these populated.
6. **Use blocks[] for impact analysis** — Before modifying a parser or block, query the sitemap to find ALL pages using that block. Warn the user if validated/approved pages are affected.

### Systematic Sitemap Construction

1. **Initial creation** — Create `/sitemap.json` with the structure above. Initialize `fragments[]` with `/nav` and `/footer`. Initialize `pages[]` as empty.

2. **Page discovery** — When the user provides a source URL or when scraping/analyzing the site:
   - Extract all navigable page URLs from the source
   - For each URL, derive the target path (e.g., `https://example.com/about/us` → `/about/us`)
   - Add each as a page entry with `imported: false`, `blocks: []`, `sectionStyles: []`

3. **After each migration** — When a page is migrated:
   - Set `imported: true`
   - Parse the generated `.plain.html` to extract block class names and section-metadata styles
   - Populate `blocks[]` and `sectionStyles[]`

4. **Path derivation** — Map source URL to content path consistently:
   - Strip domain and protocol
   - Remove `.html` extension
   - Preserve locale segments if present
   - Use lowercase, hyphenated paths

5. **Bulk import** — Update the sitemap for every page in the batch. Do not defer updates.

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
- **Sitemap**: `/sitemap.json` — **Must be kept up-to-date at all times**

---

## Reminders

1. Always read files before editing
2. Test in preview at localhost:3000
3. Update `PROJECT.md` when creating/modifying blocks, tokens, styles, or infrastructure
4. Use `box-sizing: border-box` when setting width/height on padded elements
5. Fragment files (nav, footer) must NOT have `<header>` or `<footer>` tags
6. Merge similar blocks into single multi-row blocks — don't create separate blocks per row
7. Parser-first workflow — update parsers, re-bundle, re-import. Direct `.plain.html` edits are last resort.
8. Check sitemap before modifying parsers
9. Update sitemap after EVERY import without exception
10. Start new sessions by reading this file and `PROJECT.md`
