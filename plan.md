# Vibe Coding Demo — Presentation and Website Plan

## Goal and audience

Create an interactive presentation and take-home guide for a casual study group of friends with little or no technical background and no prior experience with vibe coding.

Theme: **From an idea to a working website—with AI.**

By the end, participants should be able to explain the basic workflow, write a useful starter prompt, try and refine a small app, and check whether it behaves as intended. No coding knowledge or account setup is required to follow the presentation.

The session lasts 45–60 minutes, with a 55-minute default agenda. Present in English unless the host chooses another language.

## Presentation agenda

| Minutes | Topic | Activity |
| --- | --- | --- |
| 0–5 | Start with something working | Everyone tries the finished quiz app and guesses how it was built. |
| 5–10 | Just enough coding vocabulary | Point to structure, appearance, and behavior in the app; introduce HTML, CSS, and JavaScript. |
| 10–17 | Turn an idea into a useful prompt | Compare a vague request with a clear brief; invite the group to improve the prompt. |
| 17–32 | Build together live | Generate a small quiz, preview it, and implement one audience-selected improvement. |
| 32–45 | When it does not work | Show an imperfect result or prepared bug; explain expected versus actual behavior, ask AI to investigate, and let the group test the fix. |
| 45–50 | Habits that make this work | Make small changes, give precise feedback, test behavior, save working versions, and protect private information. |
| 50–55 | Questions and first projects | Invite project ideas and turn a few into starter prompts. |

For 45 minutes, reduce the live build to 10 minutes and the debugging and testing segment to eight minutes. For 60 minutes, add a five-minute paired prompt-writing exercise before the closing discussion.

Key message: **You do not need to understand every line to start, but you do need to check whether it does what you intended.**

## Live demo: study-group quiz

Build a small browser-only quiz using three prepared, fact-checked questions. Keep the content independent of live AI generation so the demonstration focuses on building software.

Initial version:

- Display one question at a time with multiple-choice answers.
- Let the user select an answer and submit it.
- Show whether the answer is correct, then allow moving to the next question.
- Show a final score and a restart button.

Choose one improvement with the audience: explanations after answers or a progress indicator. Keep a working baseline and finished version available as backups. Prepare an example of a bug, such as scoring an answer twice after repeated clicks, to demonstrate useful feedback and verification.

Starter prompt:

> Build a small study-group quiz website for friends who are new to coding. Use HTML, CSS, and JavaScript with no external services. Include three multiple-choice questions, one question at a time, answer feedback, a final score, and a restart button. Use a clean layout with large text, generous spacing, and one accent color. Make it usable on phones and with a keyboard. Explain how I can preview it locally.

Feedback pattern:

> When I [action], I expected [result], but [actual result] happened. Please investigate the cause, fix it, and explain how to verify the fix.

The presenter uses their chosen AI coding tool live. Selecting that tool and confirming access is a rehearsal task; the guide must remain tool-neutral.

## Interactive guide website

Create a single-page guide that works both as the presentation surface and as a useful reference afterward. Use a navigation bar with section links and a clearly visible “Try the demo” action.

Sections, in order:

1. **Hero and working demo:** introduce the theme and let visitors open or jump to the quiz immediately.
2. **What is vibe coding?** Explain the describe → plan → build → try → refine loop in plain language. Make each step selectable to reveal a short example.
3. **Just enough web basics:** three simple cards for HTML, CSS, and JavaScript, each tied to visible quiz behavior.
4. **Prompt builder:** fields for audience, goal, features, and style. Assemble a readable prompt locally, with an editable output and copy button. Include a filled study-quiz example.
5. **Before and after:** switch between vague and clear prompts and corresponding prepared interface examples. Label these as prepared examples.
6. **Demo workshop:** embed the working quiz, show the starter prompt, and offer the two prepared feature improvements for discussion. These controls demonstrate prepared behavior; they do not call an AI service.
7. **Fix and verify:** show the feedback pattern, a prepared bug example, and a short checklist of meaningful checks.
8. **Keep going:** provide beginner project ideas and copyable starter prompts.

The website should not require a login, API key, backend, database, or paid service. Prompt generation is local text assembly, not an AI integration. The quiz uses local prepared data. Initial scope excludes analytics, shared scores, user accounts, and live AI calls.

## Visual design and accessibility

Use an Apple-inspired visual direction: generous whitespace, large headings, restrained color, subtle borders, rounded cards, and carefully spaced typography. Use an original design without Apple branding or copied assets.

Use a system font stack, a light neutral background, dark text, and a single blue accent. Keep explanatory text short, define technical terms when first introduced, and present one main idea per section. Make the layout responsive for a projector, laptop, and phone.

Use semantic HTML, visible keyboard focus, descriptive labels, readable contrast, and reduced-motion support. Avoid scroll effects or animations that delay access to content. The prompt-copy interaction should show success or failure and allow manual copying if clipboard access fails.

## Implementation and hosting

Use plain HTML, CSS, and JavaScript with no build step or runtime dependencies. Suggested structure: index.html, styles.css, app.js, and assets/ only if needed. Keep the quiz, prompt builder, and guide interactions logically separate within the script.

Use relative asset links so the site works under a GitHub Pages project path such as /vibe-coding-demo/. Do not put credentials or private information in source files or prompts. GitHub Pages serves the browser app; it does not supply a server-side AI service.

Publishing is a presenter setup task, not a topic in the presentation or guide. After implementation, add a short README explaining local preview and hosting setup. Publish from the main branch root through GitHub Pages after a GitHub remote exists. Remote repository creation and actual publication are later tasks; the current requested deliverable is this local repository and plan.

## Verification and rehearsal

- Complete a quiz with all-correct, all-wrong, and mixed answers; confirm the score.
- Confirm repeated submission cannot award duplicate points and restart resets the quiz.
- Confirm prompt fields update the output and copy feedback works; verify manual-copy fallback.
- Confirm navigation, answer selection, and buttons work using only a keyboard.
- Check phone and desktop layouts for overflow, readable text, and usable controls.
- Verify reduced-motion preferences and visible focus indicators.
- Serve the site under a project subpath and check assets and section links.
- After publication, open the public URL on a phone and check the demo and prompt builder.
- Rehearse the 55-minute session, including the live tool, prepared bug, and backup examples.

Success means a first-time visitor can use the quiz without explanation, produce a useful prompt, understand the iteration loop, and access the guide after the session. Keep a working local copy and screenshots ready if internet access or live generation is slow.

## Reference

GitHub Pages documentation: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
