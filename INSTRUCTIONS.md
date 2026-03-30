# Edge Delivery Services Migration — Agent Instructions

This file **complements** `AGENTS.md` with project-specific migration and authoring rules for the Jet2 Holidays EDS migration. It is written entirely for agents (Experience Modernization Agent, Cursor, Composer) executing user prompts on this project.

**Relationship to other docs:**
- **AGENTS.md** — Product-provided (AEM boilerplate). General EDS conventions, setup, block patterns. Do not modify.
- **PROJECT.md** — Single source of truth for blocks, tokens, templates, parsers, transformers, and import infrastructure. Keep it up-to-date when creating or modifying blocks, variants, section styles, tokens, or import infrastructure.
- **INSTRUCTIONS.md** — This file. Project-specific rules, constraints, and workflows.

---

## Project Type: Crosswalk (xwalk)

This is a **Crosswalk project** — content is authored in AEM Sites via the **Universal Editor (UE)** and delivered via the `franklin.delivery` servlet. Content lives in the AEM JCR (`/content/j2-xwalk/`), NOT in Document Authoring (DA).

**Key xwalk files:**
- `fstab.yaml` — Mountpoint to AEM author instance
- `paths.json` — Maps JCR paths (`/content/j2-xwalk/...`) to clean URLs
- `component-models.json` — UE field definitions for all blocks
- `component-definition.json` — UE component registry (default content + blocks)
- `component-filters.json` — Which components are allowed in sections

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
8. **Keep import scripts aligned with content structure** — When changing content markup patterns, update all related parsers.
9. **Content lives in AEM JCR** — Content is authored via the Universal Editor and stored in AEM Sites (`/content/j2-xwalk/`). Code lives in Git.
10. **NEVER commit or push to Git yourself** — The user handles all Git operations.
11. **Code must be compatible with xwalk markup** — Content from `franklin.delivery` uses standard EDS markup (div-based blocks). Block JS and CSS must handle this with flexible selectors.
12. **Update UE models when changing blocks** — When adding/modifying blocks, update `component-models.json`, `component-definition.json`, and `component-filters.json` accordingly.
13. **Check `PAGES.txt` before modifying ANY parser** — Review `/PAGES.txt` to understand which pages may be affected. Flag concerns to the user before proceeding.
14. **Test in preview** — Verify changes at `http://localhost:3000`.
15. **Fragment files (nav, footer)** — Must NOT have `<header>` or `<footer>` tags.
16. **Merge similar blocks** — Prefer single multi-row blocks over separate blocks per row.

---

## Image URL Rules

### AEM Assets

In a xwalk project, images are stored in AEM Assets DAM (`/content/dam/j2-xwalk/`). The `franklin.delivery` servlet handles image optimization and delivery automatically. Images referenced from DAM paths are resolved by the AEM backend — no wsrv.nl proxy is needed.

### External Images in Import

During migration, external images from the source site may still need proxying through wsrv.nl for import infrastructure. Once content is in AEM, images should reference DAM assets.

### Local Preview Path

**Use the standard path for local preview** — The dev server resolves paths via `fstab.yaml` to the AEM author instance. Content is served from the AEM backend, not local files.

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

## Universal Editor (UE) Component Model Rules

### When to Update Component JSON Files

| Event | Files to Update |
|-------|----------------|
| New block created | `component-models.json`, `component-definition.json`, `component-filters.json` |
| New variant added | `component-models.json` (if variant has different fields) |
| Block deleted | Remove from all three component JSON files |
| New section style | `component-models.json` (add option to section model) |
| Field added/removed | `component-models.json` |

### Model Field Types

| Type | Use For |
|------|---------|
| `text` | Short text, titles, labels |
| `richtext` | Multi-line content with formatting |
| `reference` | DAM asset references (images) |
| `select` | Dropdown options (variants, types) |
| `boolean` | Toggle flags |
| `number` | Numeric values |
| `aem-content` | Content fragment references |

---

## Migration Rules

### Wide Viewport for Content Extraction

**Always set the browser viewport to wide desktop (≥1400px width) before extracting content from source pages.** Responsive images, background images, and some content (mega menus, "Show More") are only correct at desktop widths.

### Variant-First Approach

1. Identify the closest existing block
2. Create a variant by adding a class modifier
3. Add variant CSS in the same block's CSS file
4. Update JS if needed for variant-specific decoration

---

## Content Architecture

### Strict Separation: Content in AEM, Code in Git

- **Code** (JS, CSS, config, component JSONs): Lives in Git, deployed via AEM Code Sync
- **Content** (pages, fragments, assets): Lives in AEM Sites JCR (`/content/j2-xwalk/`), authored via Universal Editor
- **Assets**: Stored in AEM Assets DAM (`/content/dam/j2-xwalk/`)

**Rules:** Never push content HTML via Git. Fragment content (nav, footer) is authored in AEM. Component model changes go through Git.

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
- **UE models**: `/component-models.json`
- **UE definitions**: `/component-definition.json`
- **UE filters**: `/component-filters.json`
- **Content source**: AEM Sites at `/content/j2-xwalk/`
- **Assets**: AEM DAM at `/content/dam/j2-xwalk/`
- **Import infrastructure**: `/tools/importer/`
- **Page inventory**: `/PAGES.txt` — List of all imported content pages
