# Vibe Coding

An interactive introduction to building with AI for a casual study group with no coding background. Designed for a 45–60 minute workshop and as a guide to revisit afterward.

The page uses large typography, generous spacing, restrained blue accents, and interactive examples. It runs entirely in the browser with no accounts, API keys, backend, external assets, or runtime dependencies.

## Preview

From this repository:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000>. You can also open `index.html` directly; clipboard permissions vary, so the page offers manual copying when needed.

With Node.js installed, `npm start` launches the same preview. No npm installation is needed to run the site.

## What's included

- A five-step workflow: describe, plan, build, try, refine.
- Plain-language explanations of HTML, CSS, and JavaScript.
- A prompt builder with editable output, copying, and manual-copy fallback.
- Prepared before-and-after examples of vague and clear instructions.
- Curiosity Club: a three-question quiz with scoring, feedback, restart, and optional explanations and progress.
- A deliberately broken scoring exercise and a switch to apply its prepared fix.
- A testing checklist, good habits, and three project starters.
- A session agenda with 45-, 55-, and 60-minute variants.
- Presentation controls, keyboard navigation, reduced-motion support, and mobile layouts.

Prepared examples and feature switches do not call AI. Use your chosen AI coding tool for the live build; use this page to teach the process and as a working backup. The guide contains no publishing lesson.

## Presenting

Select **Present** in the navigation. Use the dock buttons or left/right arrow keys to move between chapters. Escape exits presentation mode. Arrow keys keep their normal behavior inside form controls. Select **Agenda** to choose the session length and jump to a topic.

The default 55-minute session:

| Time | Activity |
| --- | --- |
| 0–5 | Try the finished quiz |
| 5–10 | The idea and just enough web basics |
| 10–17 | Build a better prompt |
| 17–32 | Build a small quiz live and invite one improvement |
| 32–45 | Reproduce a bug, describe it, and test the fix |
| 45–50 | Good habits |
| 50–55 | Questions and first projects |

For 45 minutes, shorten the live build and debugging. For 60 minutes, add five minutes of paired prompt writing before the closing discussion. The agenda adjusts automatically.

### Rehearsal notes

1. Try the quiz yourself, then reset it and turn off the two improvement switches.
2. Have your AI coding tool ready in a separate window and copy the starter prompt from the Demo section. Build that sample in a separate scratch folder so it cannot overwrite the presentation.
3. Start with the finished quiz and invite everyone to predict how it works.
4. Ask the group to improve the prompt before generating the live app.
5. Pick just one improvement: explanations or a progress bar. Show the prepared switch if live generation takes too long.
6. In the bug exercise, submit twice, describe the mismatch, apply the prepared fix, and repeat the same test.
7. Keep a local copy open and screenshots available as a backup. The guide makes no external requests.

## Editing

- `index.html`: the guide, exercises, and initial quiz content.
- `styles.css`: design, responsive layouts, accessibility, and print styles.
- `app.js`: quiz data and state, prompt generation, examples, and presenter controls.
- `plan.md`: the presentation and implementation plan.

Quiz questions are in the `questions` array in `app.js`. Keep one correct option per question. This implementation uses three questions to match the workshop and copy. If changing the question count, update the visible copy and the tests too.

All input is handled as text. The site does not store form entries or scores, collect analytics, or send user content to a server. Reloading resets the exercises. A generated reading-tracker prompt mentions browser storage as a feature for that proposed project; the guide itself does not use it.

## Checks

Syntax check (Node.js):

```sh
npm run check
```

Browser checks require the development-only Playwright package and an installed Google Chrome:

```sh
npm install
npm test
```

No browser download is required when Chrome is installed. To use another supported browser channel, set `BROWSER_CHANNEL`, for example `BROWSER_CHANNEL=msedge npm test` with Edge installed.

The smoke suite serves the site under `/vibe-coding-demo/` to verify GitHub Pages paths. It checks all-correct, all-wrong, and mixed scoring; restart; repeated submissions; progress and explanations; prompt updates and copying; clipboard fallback; prepared examples; the bug and its fix; agenda variants; presenter navigation; skip-link focus; reduced motion; and overflow at desktop, tablet, and phone widths. Screenshots go to ignored `test-results/`.

Manual rehearsal should still include tabbing through each exercise, checking readability on the actual projector, and using a real phone.

## GitHub Pages (presenter only)

The source is ready to host from the repository root with no build step. When a GitHub remote has been created and the files pushed, choose **Settings → Pages → Deploy from a branch → main → /(root)**. Assets use relative paths so a project URL works. The included `.nojekyll` keeps this as a plain static site.

Repository: https://github.com/EricLaw-LYL/vibe-coding-demo

Live site: https://ericlaw-lyl.github.io/vibe-coding-demo/

The site is published from `main` at the repository root. Future commits to that branch trigger a Pages update. No AI service is configured.
