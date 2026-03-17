# Jet2 Holidays — EDS Project Reference

**Source site**: https://www.jet2holidays.com/
**Content path prefix**: `/destinations/`
**Content directory**: `/content/`
**Page inventory**: `/PAGES.txt`

---

## Brand Identity

| Property | Value |
|----------|-------|
| Primary color | `#126bea` (Jet2 blue) |
| Accent color | `#fdb900` (Jet2 yellow) |
| Promo color | `#d6291e` (Jet2 red) |
| Brand holidays | `#2378cd` |
| Body font | Open Sans (Google Fonts, weights 400/600/700) |
| Display font | Oswald (declared but not loaded — fallback only) |
| Base body size | 14px (`--body-font-size-s`) |
| Breakpoint — tablet | 768px (cards 2-col) |
| Breakpoint — desktop | 992px (nav, multi-column, heading sizes) |
| Content max-width | 1200px |
| Container max-width | 1400px |

---

## Design Tokens

All defined in `/styles/styles.css` as CSS custom properties on `:root`.

### Core Colors

| Token | Value |
|-------|-------|
| `--color-blue-light` | `#f0f7ff` |
| `--color-blue-light-hover` | `#d9ecff` |
| `--color-blue-light-active` | `#bbdfff` |
| `--color-blue-base` | `#126bea` |
| `--color-blue-hover` | `#185bd2` |
| `--color-blue-active` | `#1948a8` |
| `--color-blue-dark` | `#1a4084` |
| `--color-blue-darker` | `#0e1f47` |
| `--color-red-light` | `#fef2f1` |
| `--color-red-base` | `#d6291e` |
| `--color-red-hover` | `#b42219` |
| `--color-red-active` | `#911f19` |
| `--color-green-light` | `#f1fef6` |
| `--color-green-base` | `#008542` |
| `--color-orange-light` | `#fffbf0` |
| `--color-orange-base` | `#c45000` |
| `--color-yellow-base` | `#fdb900` |
| `--color-slate-dark` | `#252a31` |
| `--color-slate-base` | `#4f5e71` |
| `--color-slate-light` | `#697d95` |
| `--color-stone-light` | `#f8f9fc` |
| `--color-stone-base` | `#e9ebf1` |
| `--color-stone-dark` | `#cfd4de` |
| `--color-stone-hover` | `#f3f4f8` |
| `--color-stone-active` | `#e8eaf1` |
| `--color-white` | `#fff` |
| `--color-brand-holidays` | `#2378cd` |

### Semantic Aliases

| Token | Maps to |
|-------|---------|
| `--background-color` | `--color-white` |
| `--light-color` | `--color-stone-light` |
| `--dark-color` | `--color-slate-dark` |
| `--text-color` | `--color-slate-dark` |
| `--text-secondary-color` | `--color-slate-base` |
| `--text-inverse-color` | `--color-white` |
| `--link-color` | `--color-blue-base` |
| `--link-hover-color` | `--color-blue-hover` |
| `--link-active-color` | `--color-blue-active` |
| `--border-color` | `--color-stone-base` |
| `--border-color-strong` | `--color-slate-light` |
| `--overlay-color` | `rgb(37 42 49 / 70%)` |
| `--promo-color` | `--color-red-base` |
| `--accent-color` | `--color-yellow-base` |

### Spacing

| Token | Value |
|-------|-------|
| `--spacing-xxs` | `0.125rem` (2px) |
| `--spacing-xs` | `0.25rem` (4px) |
| `--spacing-sm` | `0.5rem` (8px) |
| `--spacing-md` | `0.75rem` (12px) |
| `--spacing-lg` | `1rem` (16px) |
| `--spacing-xl` | `1.5rem` (24px) |
| `--spacing-2xl` | `2rem` (32px) |
| `--spacing-3xl` | `2.5rem` (40px) |
| `--spacing-4xl` | `3rem` (48px) |

> **Note**: This project uses `sm/md/lg` suffix convention (not `s/m/l`).

### Typography

| Token | Mobile | Desktop (≥992px) |
|-------|--------|-------------------|
| `--heading-font-size-xxl` | 30px | 36px |
| `--heading-font-size-xl` | 24px | 30px |
| `--heading-font-size-l` | 18px | 24px |
| `--heading-font-size-m` | 16px | 18px |
| `--heading-font-size-s` | 14px | 16px |
| `--heading-font-size-xs` | 12px | 14px |
| `--body-font-size-l` | 18px | — |
| `--body-font-size-m` | 16px | — |
| `--body-font-size-s` | 14px | — |
| `--body-font-size-xs` | 12px | — |

### Radius, Shadows, Transitions

| Token | Value |
|-------|-------|
| `--radius-sm` | `0.25rem` |
| `--radius-md` | `0.375rem` |
| `--radius-lg` | `0.75rem` |
| `--radius-full` | `999rem` |
| `--shadow-sm` | level1 (4px blur) |
| `--shadow-md` | level2 (16px blur) |
| `--shadow-lg` | level3 (24px blur) |
| `--transition-fast` | 100ms ease |
| `--transition-base` | 200ms ease |
| `--transition-slow` | 300ms ease |

### Component Tokens

| Token | Value |
|-------|-------|
| `--button-border-radius` | `--radius-md` |
| `--button-font-weight` | 600 |
| `--button-padding-sm` | `0.5rem 0.75rem` |
| `--button-padding-md` | `0.75rem 1rem` |
| `--button-padding-lg` | `0.875rem 1.125rem` |
| `--card-border` | `1px solid --color-stone-dark` |
| `--card-border-radius` | `--radius-lg` |
| `--card-background` | `--color-white` |
| `--card-padding` | `1rem` |
| `--input-border` | `1px solid --border-color-strong` |
| `--input-border-radius` | `--radius-md` |
| `--content-max-width` | `1200px` |
| `--container-max-width` | `1400px` |
| `--content-padding` | 24px mobile / 32px desktop |
| `--nav-height` | `64px` |

---

## Button Variants

Defined in `/styles/styles.css`. Authoring pattern in `/scripts/scripts.js`:

| Variant | Authoring | Appearance |
|---------|-----------|------------|
| **Primary** | `**[link text](url)**` (`<strong>` wraps link) | Blue bg, white text |
| **Secondary** | `*[link text](url)*` (`<em>` wraps link) | White bg, grey border |
| **Accent** | `***[link text](url)***` (`<strong>` + `<em>`) | Yellow bg, dark text |

All buttons: 14px font, 600 weight, `--radius-md` corners, `--transition-base` hover.

---

## Section Styles

Applied via `section-metadata` block with `Style: <name>`. Defined in `/styles/styles.css`.

| Style | Class | Background | Text color | Padding |
|-------|-------|------------|------------|---------|
| `light` | `.section.light` | `--color-stone-light` | default | 40px 0 |
| `highlight` | `.section.highlight` | `--color-stone-light` | default | 40px 0 |
| `grey` | `.section.grey` | `--color-stone-light` | default | 40px 0 |
| `dark` | `.section.dark` | `--color-slate-dark` | inverse white | 40px 0 |
| `brand` | `.section.brand` | `--color-brand-holidays` | inverse white | 40px 0 |
| `promo` | `.section.promo` | `--promo-color` (red) | inverse white | 16px 0 |
| `yellow` | `.section.yellow` | `--accent-color` | default | 40px 0 |

---

## Block Reference

### hero

**Location**: `/blocks/hero/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.hero` | Full-width background image with h1 overlay |

**Authoring**: Auto-built by `scripts.js` when a `<picture>` precedes an `<h1>` in the first section. No explicit block table needed.

**Features**: CSS-only (no JS decoration). Background image via absolute positioning. h1 centered with `--content-max-width`.

**Responsive**: Padding 40px 24px (mobile) → 40px 32px (desktop ≥992px). Min-height 300px.

---

### accordion-faq

**Location**: `/blocks/accordion-faq/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.accordion-faq` | FAQ accordion with native `<details>`/`<summary>` |

**Authoring**:
| Accordion Faq |
|---|
| Question \| Answer |
| Question \| Answer |

**Features**: Native `<details>`/`<summary>` elements. Chevron arrow via CSS `::after` pseudo-element. Bottom border separators. Focus-visible outline. Hover color change.

**Responsive**: Single-column at all widths. Min-height 48px per item.

**Parser**: `parsers/accordion-faq.js` — Targets `.accordion` selector on source.

---

### cards

**Location**: `/blocks/cards/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.cards` | Generic auto-fill card grid (boilerplate) |

**Authoring**:
| Cards |
|---|
| Image \| Body content |

**Features**: `auto-fill` grid with `minmax(257px, 1fr)`. Image optimization via `createOptimizedPicture`. Separates image column (`.cards-card-image`) from body (`.cards-card-body`).

**Responsive**: Auto-fills based on available width.

---

### cards-destination

**Location**: `/blocks/cards-destination/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.cards-destination` | Destination cards with pin icon, location line, features |

**Authoring**:
| Cards Destination |
|---|
| Image \| h3 title, location, description, feature list |

**Features**: SVG pin icon injected before location paragraph. Image optimization. Location line styled with icon + secondary color. Feature list with `·` bullet via `::before`. 16:9 aspect ratio images.

**Responsive**: 1 col (mobile) → 2 col (≥768px) → 3 col (≥992px). Gap 24px → 32px.

**Parser**: `parsers/cards-destination.js` — Targets `.accommodation-teaser`, `.resorts-teaser`, `.blog-teaser`, `.poi-teaser` selectors.

---

### columns

**Location**: `/blocks/columns/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.columns` | Generic multi-column layout (boilerplate) |

**Authoring**:
| Columns |
|---|
| Col 1 \| Col 2 \| ... |

**Features**: Image column detection (`.columns-img-col`). Column count class (`.columns-N-cols`). Image-first on mobile via `order`.

**Responsive**: Stacked (mobile) → side-by-side with 24px gap (≥992px).

---

### columns-destination

**Location**: `/blocks/columns-destination/`

| Variant | Class | Purpose |
|---------|-------|---------|
| 2-column | `.columns-destination.columns-destination-2-cols` | About text + image with Read More toggle |
| 1-column (info grid) | `.columns-destination.columns-destination-1-cols` | Icon grid with title + description per item |

**Authoring (2-col)**:
| Columns Destination |
|---|
| Image \| h2 title, paragraphs |

**Authoring (1-col)**:
| Columns Destination |
|---|
| Icon \| h3 title, description |
| Icon \| h3 title, description |

**Features**:
- *2-col*: Read More/Read Less toggle with `-webkit-line-clamp: 8`. Uses `waitForBlockCSS()` to avoid race condition. Image column with 8px border-radius.
- *1-col*: CSS Grid with icon circles (60px, `--radius-full`, `rgb(248 249 252)` bg). Icons 24x24. `display: contents` for grid layout.

**Responsive**:
- *2-col*: Stacked with 16px text padding-top (mobile) → side-by-side with 32px gap, 40px text padding-top (≥992px).
- *1-col*: 2-col grid with 24px gap (mobile) → 3-col with 40px gap (≥992px).

**Parser**: `parsers/columns-destination.js` — Targets `.destination-description`, `.icon-grid-v2`, `.email-sign-up-v2` selectors.

---

### destination-map

**Location**: `/blocks/destination-map/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.destination-map` | Resort links in rounded bordered card |

**Authoring**:
| Destination Map |
|---|
| h2 heading, list of resort links |

**Features**: Pulls preceding section heading into the block via JS. Rounded card with 12px radius, 1px border. Flex-wrap link list with 16px gap. Links styled as underlined secondary text.

**Responsive**: Single layout at all widths, links wrap naturally.

**Parser**: `parsers/destination-map.js` — Targets `.title-links` selector.

---

### table-weather

**Location**: `/blocks/table-weather/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.table-weather` | Horizontal scroll bar chart for monthly weather |

**Authoring**:
| Table Weather |
|---|
| Jan \| Feb \| Mar \| ... |
| 15°C \| 16°C \| 18°C \| ... |

**Features**: Bar height proportional to temperature (97–200px range). Inline SVG sun icon. Horizontal scroll with snap. Custom scrollbar styling. Two rows: months header, temperatures.

**Responsive**: Fixed 100px-wide cards, horizontal scroll at all widths. Scroll snap alignment.

**Parser**: `parsers/table-weather.js` — Targets `.climate-bar-chart` selector.

---

### header

**Location**: `/blocks/header/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.header` | Site navigation with hamburger menu |

**Features**: Fragment-loaded from `/nav`. Three nav zones: brand, sections, tools. Hamburger toggle on mobile. Dropdown support via `aria-expanded`. Escape key and focus-out closing. Keyboard accessibility for dropdowns.

**Responsive**: Hamburger (mobile) → horizontal nav (≥992px).

---

### footer

**Location**: `/blocks/footer/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.footer` | Site footer |

**Features**: Fragment-loaded from `/footer`. Minimal JS — loads fragment and appends children.

---

### fragment

**Location**: `/blocks/fragment/`

| Variant | Class | Purpose |
|---------|-------|---------|
| Default | `.fragment` | Generic fragment loader utility |

**Features**: Fetches `.plain.html`, decorates content (sections, blocks, buttons, icons), loads sections. Resets media paths to fragment base. Used by header and footer blocks, and auto-detected for `*/fragments/*` links.

---

## Icons

Located in `/icons/`. Used via `:icon-name:` syntax in authored content.

| File | Icon | Usage |
|------|------|-------|
| `airplane-tilt.svg` | Airplane | Travel/flights |
| `beer.svg` | Beer | Nightlife/entertainment |
| `clock.svg` | Clock | Time/duration |
| `currency-gbp.svg` | GBP symbol | Pricing |
| `language.svg` | Language | Language info |
| `meal.svg` | Meal | Dining/food |
| `search.svg` | Search | Search functionality |

---

## Import Infrastructure

Located in `/tools/importer/`.

### Template: destination-region

Defined in `page-templates.json`. Source: Jet2 Holidays destination area pages (e.g., Algarve).

**11 Sections**:

| # | Section | Block(s) | Default Content | Style |
|---|---------|----------|-----------------|-------|
| 1 | Destination Description | columns-destination | — | — |
| 2 | Popular Resorts Links | destination-map | — | — |
| 3 | Hotels | cards-destination | — | — |
| 4 | Destination Information | columns-destination | h2 | — |
| 5 | Content Highlights | — | h2, p | `grey` |
| 6 | Resorts | cards-destination | — | — |
| 7 | Blog Teaser | cards-destination | h2, p, a | — |
| 8 | Things to Do | cards-destination | — | — |
| 9 | Local Weather | table-weather | — | — |
| 10 | FAQs | accordion-faq | h2 | — |
| 11 | Email Sign Up | columns-destination | — | — |

### Parsers (5)

| Parser | File | Source Selectors |
|--------|------|------------------|
| accordion-faq | `parsers/accordion-faq.js` | `.accordion` |
| cards-destination | `parsers/cards-destination.js` | `.accommodation-teaser`, `.resorts-teaser`, `.blog-teaser`, `.poi-teaser` |
| columns-destination | `parsers/columns-destination.js` | `.destination-description`, `.icon-grid-v2`, `.email-sign-up-v2` |
| destination-map | `parsers/destination-map.js` | `.title-links` |
| table-weather | `parsers/table-weather.js` | `.climate-bar-chart` |

### Transformers (2)

| Transformer | File | Purpose |
|-------------|------|---------|
| jet2-cleanup | `transformers/jet2-cleanup.js` | Site-wide DOM cleanup |
| jet2-sections | `transformers/jet2-sections.js` | Section boundary detection |

### Bundling

```bash
npx esbuild tools/importer/import-universal.js --bundle --format=iife --global-name=CustomImportScript --outfile=tools/importer/import-universal.bundle.js
```

---

## Migration Status

### Imported Pages

All imported pages are listed in `/PAGES.txt` (942 content files). Each line is a path relative to the project root, e.g. `content/destinations/portugal/algarve.plain.html`.

---

## Fonts

| Font | Source | Usage |
|------|--------|-------|
| **Open Sans** (400/600/700) | Google Fonts (`/styles/fonts.css`) | Body + headings (`--body-font-family`, `--heading-font-family`) |
| **open-sans-fallback** | Local Arial with size-adjust | Fallback for Open Sans |
| **Oswald** | Declared in `--display-font-family` but **NOT loaded** | Not actively used. Fallback defined. |
| **Oswald Fallback** | Local Arial Narrow / Arial | Fallback for Oswald |
| Roboto | Boilerplate leftover in `head.html` | Should be removed — not used |
