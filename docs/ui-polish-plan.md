# UI Cleanup & Polish Plan

Based on a review of all pages in the BioSky frontend.

## Pages Reviewed

- **Feed (Home/Explore)** - Observation feed with tabs
- **Observation Detail** - Single observation view with image, metadata, map, IDs, comments
- **Profile** - User profile with stats and activity feed
- **Taxon Detail** - Species information with classification, media, descriptions
- **Map** - Currently broken (console errors)

---

## Critical Issues (Bugs)

### 1. Map page is broken
JavaScript errors prevent loading:
- `Error: layers.cluster-count.layout.text-fi...`
- `Failed to load occurrences: TypeError: Can...`

### 2. Home vs Explore tabs appear identical
Both show the same content; unclear differentiation between the two tabs.

---

## High Priority Polish

| Area | Issue | Suggestion |
|------|-------|------------|
| **Feed cards** | No visual separation between cards | Add subtle dividers or card borders |
| **Feed cards** | Long notes truncate awkwardly | Add "..." or "Read more" for long text |
| **Observation detail** | "Unknown" status badge (red) shown confusingly with taxon name | Clarify what "Unknown" means or improve placement |
| **Profile header** | Stats row lacks visual hierarchy | Add icons or improve spacing |
| **Taxon page** | "SH1031361.09FU" shown as child taxon (GBIF artifact) | Filter or hide non-meaningful taxa names |
| **Bottom nav** | Map icon has no label visible on dark background | Ensure "Map" label is visible |

---

## Medium Priority Polish

| Area | Issue | Suggestion |
|------|-------|------------|
| **Header** | "BioSky" logo is plain text | Consider adding an icon/logo |
| **Observation detail** | No visual indicator for image loading | Add skeleton/placeholder |
| **Profile page** | "View on AT Protocol" button placement feels disconnected | Move closer to header or add context |
| **Taxon media** | Images have no lightbox/zoom | Add image viewer on click |
| **Taxon description** | HTML entities showing (`<p>`, `<em>`) | Parse and render HTML properly |
| **Classification breadcrumbs** | ">" separators could be styled better | Use chevron icons instead |
| **Identification history** | Avatar images are tiny | Increase size slightly |
| **Comments section** | "No comments yet" empty state is plain | Add illustration or call-to-action |

---

## Low Priority / Nice-to-Have

| Area | Suggestion |
|------|------------|
| **Feed** | Add pull-to-refresh indicator on mobile |
| **Observation detail** | Add share button |
| **Profile** | Add bio/description field |
| **Taxon page** | Show common name alongside scientific name |
| **Global** | Add loading skeletons instead of spinners |
| **Global** | Improve focus states for accessibility |
| **Global** | Add hover states on clickable items |

---

## Consistency Issues

1. **Taxon names** - Sometimes italic, sometimes not (should always be italic for scientific names)
2. **Date formatting** - Mix of "11h", "1d", "Jan 17" (inconsistent relative vs absolute)
3. **Card layouts** - Feed cards vs profile activity cards have different structures
4. **External links** - Some have icons, some don't (GBIF link has icon, AT Protocol link has icon - good)
