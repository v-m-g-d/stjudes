# UX Guidelines (MVP)

## Principles
- Keep language plain and welcoming — avoid jargon or technical terms.
- Prioritize readability and simple navigation for all age groups.
- Ensure all key actions are clear on mobile (44px+ touch targets).
- Use progressive disclosure — show summaries first, details on demand.
- Provide clear feedback for every user action (status messages, badges).

## Page-by-Page UX Notes

### Home
- **Purpose**: Orient new visitors quickly; establish community identity.
- **Layout**: Hero section with community name, tagline, and decorative streetscape illustration.
- **Content**: Brief welcome message explaining what the hub offers.
- **Navigation**: Anchor links to all sections visible in header nav pills.
- **Mobile**: Streetscape scales to 4-column terrace; nav pills wrap naturally.

### Forum
- **Purpose**: Enable threaded discussion with clear moderation visibility.
- **Layout**: Thread list (left/top) with comment panel (below selected thread).
- **Key UX elements**:
  - Search input filters threads in real time.
  - Toggle between approved and pending views.
  - Selected thread highlighted with active color.
  - Each thread shows title, body preview, and approval badge.
  - Comments load for selected thread with moderation filter dropdown.
- **Posting**: Inline form below thread list; requires sign-in in production.
- **Status messages**: "Thread submitted for moderation" on success; "Sign in required" when not authenticated.
- **Mobile**: Thread list and comments stack vertically; search input goes full-width.

### News
- **Purpose**: Admin-published community updates, newest first.
- **Layout**: Card list with title, summary, and optional full body content.
- **Key UX elements**:
  - Search input filters by title and summary.
  - Pagination (4 items per page).
  - Publishing restricted to admin — non-admin sees 403 message.
- **Mobile**: Cards stack; pagination controls wrap.

### Plans
- **Purpose**: Track development proposals with status transparency.
- **Layout**: Card list showing title, description, status pill, and last updater.
- **Key UX elements**:
  - Status pills (draft/review/published) with capitalized text.
  - Search input filters by title.
  - Pagination (4 items per page).
  - "Last updated by" metadata visible on each plan.
- **Mobile**: Cards stack; status pills remain inline.

### Admin
- **Purpose**: Centralised moderation and content publishing for organisers.
- **Layout**: Moderation panel (pending counts + approve actions) → News form → Plan form → Plan status manager.
- **Key UX elements**:
  - Pending thread/comment counts shown at top.
  - Each pending item has an inline "Approve" button.
  - 403 errors show clear "requires admin email" message.
  - Plan status buttons (Draft/Review/Publish) with current state disabled.
- **Security note**: Admin actions require email in `ADMIN_EMAILS` server-side.
- **Mobile**: Moderation items stack vertically; action buttons wrap below content.

## Accessibility Baseline
- Use semantic headings in order (`h1` → `h2` → `h3`).
- Skip-to-content link for keyboard users.
- `focus-visible` outline on all interactive elements.
- ARIA live region for status announcements.
- Ensure keyboard navigation for all links and buttons.
- Provide `aria-hidden="true"` for decorative elements.
- Maintain WCAG AA contrast ratios (4.5:1 body, 3:1 large text).

## Mobile-First Behaviour
- Base layout: single column, full-width inputs.
- Breakpoints: 640px (mobile → tablet), 1024px (tablet → desktop).
- Touch targets: minimum 44×44px equivalent via padding.
- No horizontal scroll at 320px minimum viewport.
