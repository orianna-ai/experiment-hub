# m6-my-prompt · deal-desk-prototype-2

## Screenshots
| before (origin) | after (working copy) |
|---|---|
| ![before](./screenshots/before.png) | ![after](./screenshots/after.png) |

## Goal achievement
Achieved. The Deal Desk review screen was redesigned from an AI-default look into a
restrained, professionally-styled surface that holds up against the reference designs
(Stripe / Copilot-style clean SaaS dashboards). Across the four core surfaces — What
changes, Try it on a sample deal, What the AI agent can do, Who gets it — the page now
reads with a single-accent palette, strong typographic hierarchy, and generous whitespace
rather than the original crowded, multi-color, gimmicky layout.

Key "AI tells" removed or fixed:
- Numbered circle badges (1–4) on each section → clean section titles plus a one-line
  muted description (better information scent + hierarchy).
- Floating absolute-positioned tag chips ("Deal Desk panel", "AI preview") → integrated
  into clean inline headers.
- Dashed yellow/gray boxes (AI summary, estimate row) → solid, subtle, intentional cards.
- Loud competing accent colors everywhere → one indigo accent reserved for primary actions
  and links; status colors (amber/green/red) used only where they carry meaning.
- Over-used uppercase micro-labels at field level → softened to sentence case; uppercase
  eyebrows kept only at section level and used sparingly.
- Reduced icon noise (sidebar icons muted to tertiary, removed redundant inline icons).
- Cramped 14px layout → larger type scale, more padding, breathing room, and a refined
  sticky deploy bar with a frosted backdrop.

## Cost
- wall time: 10m 41s
- turns: 55
- tokens (input / cache-create / cache-read / output): 110 / 175347 / 4873650 / 30681
- $ estimate: $4.300318750000001

## How Claude achieved it
1. Read the single-file React app (`src/App.tsx`) and stylesheet (`src/styles.css`) and
   captured the current state with Playwright (the app uses an inner scroll container, so a
   tall viewport was used to capture every surface in one image).
2. Downloaded all seven reference images and studied them to extract the shared design
   language: generous whitespace, one accent color, bold/clear heading hierarchy, muted
   uppercase section eyebrows, subtle 1px card borders, and minimal icon use.
3. Rewrote the design system in `styles.css` — new neutral + indigo token palette, larger
   type scale and spacing, refined cards (radius/shadow), restyled chips/switches/buttons,
   a frosted sticky deploy bar, and replaced dashed boxes with solid subtle surfaces.
4. Made surgical edits in `App.tsx`: removed the numbered section circles and added a muted
   one-line subtitle per section; removed the floating absolute tag chips; integrated the
   AI summary and Deal Desk panel headers inline; softened the "Added by app" marker.
5. Iterated against screenshots of each surface (header, summary, sample-deal preview,
   permissions, rollout), cropping regions for detail review, fixing a wrapping deal-size
   input prefix, and comparing the result side-by-side with the reference designs until no
   obvious AI tells remained.

## Prompt
```
/goal Your task is to take the core surfaces in this application (http://localhost:59160/) and make it look like a world class designer worked on it. WHEN YOU ARE DONE: You will look at the key surfaces of the app via browser tools, and compare it to "good design" examples. You are not done until you can hold up the designs side by side with human design and you can't tell which was made by AI vs. which was made by humans. After checking, you will identify the gaps in the design of it across the key surfaces and user journeys. You will make changes to the code to close those gaps. Repeat. You are only done when you feel like the screenshots of the app look like a real human professional designer made it, by comparing to the examples of good design. Be ruthless when you decide if it looks like a human desginer made it: if any doubt remains, no matter how small, YOU ARE NOT DONE!!! Repeat the process again.  All of this code was written by AI, and not touched by a professional designer. We want to show what the app would look like if a real designer spent time thinking about how it should be styled. You MUST look through all the surfaces. The core things that generally lead to a better design:  (1) Prioritization: Ruthlessly focus the user on the core information. Remove the rest or use progressive disclosure to show the rest of the information. (2) Progressive disclosure: Ensure that the the right information hierarchy is present and put info behind "clicks" where necessary. (3) Whitespace & focus: Don't overcrowd any area of the design. (4) Less is more: remove random icons and UI elements that add nothing. (5) Emphasis hierarchy: Ensure the use of different font weights and colors is used sparingly to lead to a really clear, clean design where a user knows where to focus. Here are the examples of good design: https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/a2045beb-c7cd-4962-9d27-c9801775bda6.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/94edf0a9-511f-48cc-af9d-6522a821be86.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/9628af2b-a58f-49d8-8cc6-e148ed4890a0.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/cb5d6067-78b0-43a0-8788-c366e33dd869.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/e8679bd4-9e56-499b-9f34-edd66afa469c.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/be85f5c8-85d0-460c-a141-d9ffed3bd102.png, https://upcdn.io/FW25bBB/image/mobbin.com/prod/content/app_screens/73e72d66-4197-4402-ad35-e175e1ac1794.png
```
