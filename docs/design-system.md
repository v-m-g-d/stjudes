# Design System — St Jude's Community Hub

## Typography

| Token | Size | Weight | Usage |
|---|---|---|---|
| `h1` | 2rem | 700 | Page/section title |
| `h2` | 1.5rem | 700 | Card headings |
| `h3` | 1rem | 600 | Form/group headings |
| `body` | 1rem | 400 | Paragraphs, list items |
| `small` / `.meta` | 0.85rem | 400 | Timestamps, audit info |
| `eyebrow` | 0.875rem | 400 | Section labels, uppercase |

**Font stack**: Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif  
**Line height**: 1.5 (body), 1.2 (headings)

## Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `xs` | 0.25rem | Tight inner padding |
| `sm` | 0.5rem | Nav gaps, badge padding |
| `md` | 0.75rem | Card padding, list gaps |
| `lg` | 1rem | Section gaps, form gaps |
| `xl` | 1.5rem | Shell padding |
| `2xl` | 2.5rem | Bottom padding |

## Color Palette

### Light Mode
| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#111827` | Body text |
| `text-secondary` | `#4b5563` | Eyebrow, meta |
| `bg-page` | `#f9fafb` | Page background |
| `bg-card` | `#ffffff` | Card background |
| `border-default` | `#e5e7eb` | Card/list borders |
| `border-control` | `#d1d5db` | Input/button borders |
| `badge-approved` | `#166534` text / `#86efac` border | Approved status |
| `badge-pending` | `#92400e` text / `#fcd34d` border | Pending status |
| `focus-ring` | `#2563eb` | Focus outline |
| `active-link` | `#1d4ed8` | Selected thread |

### Dark Mode
| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#f3f4f6` | Body text |
| `text-secondary` | `#9ca3af` | Eyebrow, meta |
| `bg-page` | `#030712` | Page background |
| `bg-card` | `#111827` | Card background |
| `border-default` | `#1f2937` | Card borders |
| `border-control` | `#374151` | Input/button borders |

## Component Inventory

| Component | CSS Class | Description |
|---|---|---|
| Card | `.card` | Bordered rounded container for each section |
| Badge | `.badge .approved` / `.pending` | Moderation status pill |
| StatusPill | `.status-pill` | Plan status indicator |
| InlineButton | `.inline-button` | Compact action button |
| Form | `.form` | Stacked input layout with submit |
| Pager | `.pager` | Previous / Page N / Next controls |
| ModerationItem | `.moderation-item` | Content + approve button row |
| ThreadLink | `.thread-link` | Clickable thread selector |
| AuthLinks | `.auth-links` | Sign in / Sign out pills |
| HomeVisual | `.home-visual` | Decorative terrace streetscape |
| SkipLink | `.skip-link` | Accessibility skip-to-content |

## Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|---|---|---|
| Mobile | `≤640px` | Smaller headings, full-width inputs, stacked moderation items, 4-col terrace |
| Tablet | `641–1024px` | 900px max-width, 5-col terrace |
| Desktop | `>1024px` | 1000px max-width, 6-col terrace |
