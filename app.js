'use strict';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let toastTimer;
const activeMotions = new WeakMap();

// Animate from visible defaults, so content stays usable if animation APIs fail.
function playMotion(element, keyframes, options = {}) {
  if (!element || reducedMotion.matches || !element.animate) return;
  activeMotions.get(element)?.cancel();
  const animation = element.animate(keyframes, {
    duration: 420, easing: 'cubic-bezier(.2,.75,.25,1)', ...options
  });
  activeMotions.set(element, animation);
}
function enter(element, delay = 0) {
  playMotion(element, [
    { transform: 'translateY(28px)' },
    { transform: 'translateY(0)' }
  ], { duration: 850, delay });
}
function notify(message) {
  const status = $('#global-status');
  status.textContent = message;
  status.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => status.classList.remove('show'), 5000);
}
function scrollToSection(element, focus = false) {
  element.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  if (focus) {
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
    element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true });
  }
}

// These local examples illustrate an AI workflow; they do not call an AI service.
const steps = [
  ['“Build a three-question quiz for my study group. Show a score at the end.”', 'Start small. Who is it for, and what should they be able to do?'],
  ['“Before writing code, outline the quiz flow, the essential features, and a few checks. Ask me about anything unclear.”', 'Agree on a small first version and how you’ll know it works. Then start building.'],
  ['“Create the first version with HTML, CSS, and JavaScript. Explain how to preview it.”', 'AI writes a draft. Open the result and see what it actually does.'],
  ['“I’ll try a wrong answer, click twice, and restart. Does the score still make sense?”', 'Test behavior, not just appearance. A polished page can still have bugs.'],
  ['“Add a short explanation after each answer. Keep the rest of the quiz working.”', 'Ask for one improvement, then try it again. Repeat as your idea takes shape.']
];
$$('[data-step]').forEach((button) => button.addEventListener('click', () => {
  $$('[data-step]').forEach((item) => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  const [quote, tip] = steps[Number(button.dataset.step)];
  $('#step-quote').textContent = quote;
  $('#step-tip').textContent = tip;
  playMotion($('#step-detail'), [
    { opacity: .35, transform: 'translateY(7px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ]);
}));

const quizBrief = {
  audience: 'My study group, with no coding experience',
  goal: 'Test their knowledge with a short quiz',
  features: 'Three multiple-choice questions, answer feedback, a final score, and a restart button',
  style: 'Clean, friendly, spacious, with a blue accent'
};
const projectBriefs = {
  timer: { audience: 'Students who want to focus on one task at a time', goal: 'Alternate focused study sessions with short breaks', features: 'A 25-minute study timer, a 5-minute break timer, start, pause, and reset buttons, and clear session progress', style: 'Calm, minimal, with large readable numbers and a blue accent' },
  dinner: { audience: 'Friends deciding where to eat together', goal: 'Choose a restaurant from a list we enter', features: 'Add and remove restaurant names, pick one at random, and show a friendly message when the list is empty', style: 'Friendly, spacious, and easy to use on a phone' },
  reading: { audience: 'Readers keeping track of their books', goal: 'Organize a personal reading list', features: 'Add a book title, mark it as finished, remove it, and save the list in this browser with localStorage', style: 'Quiet, readable, and spacious, with a blue accent' }
};
function updatePrompt() {
  const value = (name, fallback) => $(`#${name}`).value.trim() || fallback;
  $('#prompt-output').value = `Build a small browser-based website.\n\nAudience: ${value('audience', '[who this is for]')}.\nGoal: ${value('goal', '[what it should help them do]')}.\nEssentials: ${value('features', '[the few things it needs to do]')}.\nLook and feel: ${value('style', '[how it should look and feel]')}.\n\nUse HTML, CSS, and JavaScript with no external services. Make it work on phones and with a keyboard. Start with a simple first version. Explain how to preview it locally and suggest a few ways to test that it works.`;
  $('#prompt-status').textContent = '';
}
function loadBrief(brief) {
  Object.entries(brief).forEach(([key, value]) => { $(`#${key}`).value = value; });
  updatePrompt();
}
$('#prompt-form').addEventListener('input', updatePrompt);
$('#prompt-form').addEventListener('submit', (event) => event.preventDefault());
$('#example-reset').addEventListener('click', () => { loadBrief(quizBrief); notify('Quiz example restored.'); });
loadBrief(quizBrief);
$$('[data-project]').forEach((button) => button.addEventListener('click', () => {
  loadBrief(projectBriefs[button.dataset.project]);
  scrollToSection($('#prompt-builder'));
  $('#audience').focus({ preventScroll: true });
  notify('Your project is ready in the prompt builder. Make it your own.');
}));

async function copyText(text, output) {
  if (!text.trim()) { notify('Add some text before copying.'); return; }
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    if (output) $('#prompt-status').textContent = 'Copied. Paste it into your AI coding tool.';
    notify('Copied. Your next conversation starts here.');
    playMotion($('#copy-prompt'), [{ transform: 'scale(.96)' }, { transform: 'scale(1)' }], { duration: 260 });
  } catch {
    if (output) {
      output.focus();
      output.select();
      $('#prompt-status').textContent = 'Clipboard unavailable. The prompt is selected—use your device’s Copy command.';
      notify('Prompt selected. Use your device’s Copy command.');
    } else {
      // Keep manual copying available without relying on clipboard permissions.
      const panel = document.createElement('dialog');
      panel.setAttribute('aria-label', 'Copy this prompt manually');
      const heading = document.createElement('h3');
      heading.textContent = 'Copy your prompt.';
      const field = document.createElement('textarea');
      field.value = text;
      field.rows = 10;
      field.style.cssText = 'width:100%;padding:14px;font:inherit;line-height:1.7;border:1px solid #dcdce2;border-radius:12px;';
      field.setAttribute('aria-label', 'Prompt to copy manually');
      const close = document.createElement('button');
      close.className = 'button primary';
      close.textContent = 'Done';
      close.style.marginTop = '16px';
      close.addEventListener('click', () => panel.close());
      panel.append(heading, field, close);
      document.body.append(panel);
      panel.addEventListener('close', () => panel.remove(), { once: true });
      panel.showModal();
      field.focus();
      field.select();
    }
  }
}
$('#copy-prompt').addEventListener('click', () => copyText($('#prompt-output').value, $('#prompt-output')));
$$('[data-copy-source]').forEach((button) => button.addEventListener('click', () => copyText($(`#${button.dataset.copySource}`).textContent)));

$$('[data-compare]').forEach((button) => button.addEventListener('click', () => {
  const clear = button.dataset.compare === 'clear';
  $$('[data-compare]').forEach((item) => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  $('#compare-prompt').textContent = clear ? '“Make a three-question web basics quiz for beginners. Use large answer buttons, show feedback, and add a restart button.”' : '“Make me a quiz.”';
  playMotion($('#compare-preview'), [
    { opacity: .3, transform: 'translateY(8px) scale(.99)' },
    { opacity: 1, transform: 'translateY(0) scale(1)' }
  ]);
  $('#compare-preview').classList.toggle('clear-preview', clear);
  $('#compare-preview').classList.toggle('vague-preview', !clear);
  $('.compare-preview-label').textContent = clear ? 'Curiosity club · Question 1 of 3' : 'Quiz';
  $('#compare-question').textContent = clear ? 'What gives a website its structure?' : 'Question 1';
  $('#compare-option-a').textContent = clear ? 'A · CSS' : 'Option A';
  $('#compare-option-b').textContent = clear ? 'B · HTML ✓' : 'Option B';
  $('#compare-caption').textContent = clear ? 'Correct! HTML gives the page structure. Restart ↺' : 'The goal, audience, and feedback are left to guesswork.';
}));

// Quiz state is kept separate from the deliberately broken exercise below.
const questions = [
  { question: 'What gives a website its structure?', options: ['CSS', 'HTML', 'JavaScript'], correct: 1, explanation: 'HTML describes the content and structure: headings, questions, answers, and buttons.' },
  { question: 'What controls the colors and spacing?', options: ['JavaScript', 'HTML', 'CSS'], correct: 2, explanation: 'CSS styles the page, including its colors, fonts, spacing, and layout.' },
  { question: 'What makes “Check answer” do something?', options: ['JavaScript', 'CSS', 'HTML'], correct: 0, explanation: 'JavaScript runs the behavior: checking answers, updating the score, and restarting the quiz.' }
];
let questionIndex = 0;
let quizScore = 0;
let selectedAnswer = null;
let answered = false;
let complete = false;
const quizAnswers = [];
function updateProgress() {
  const wasHidden = $('#quiz-progress').hidden;
  $('#quiz-progress').hidden = !$('#feature-progress').checked;
  if (wasHidden && !$('#quiz-progress').hidden) enter($('#quiz-progress'));
  $('#progress-label').textContent = complete ? 'Quiz complete' : `Question ${questionIndex + 1} of ${questions.length}`;
  $('#progress-percent').textContent = `${Math.round(quizAnswers.length / questions.length * 100)}% complete`;
  $('#progress-bar').value = quizAnswers.length;
}
function showFeedback() {
  const feedback = $('#quiz-feedback');
  feedback.replaceChildren();
  if (!answered || complete) return;
  const question = questions[questionIndex];
  const heading = document.createElement('strong');
  heading.textContent = selectedAnswer === question.correct ? 'That’s right!' : `Good try. The answer is ${question.options[question.correct]}.`;
  feedback.append(heading);
  if ($('#feature-explanations').checked) {
    const explanation = document.createElement('p');
    explanation.textContent = question.explanation;
    feedback.append(explanation);
  }
  playMotion(feedback, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300 });
}
function renderQuestion(moveFocus = false) {
  const question = questions[questionIndex];
  $('#quiz-form').hidden = false;
  $('#quiz-results').hidden = true;
  $('#quiz-question').textContent = question.question;
  $('#quiz-options').replaceChildren();
  question.options.forEach((text, index) => {
    const label = document.createElement('label');
    label.className = 'quiz-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'quiz-answer';
    radio.value = String(index);
    radio.addEventListener('change', () => {
      if (answered) return;
      selectedAnswer = index;
      $('#quiz-submit').disabled = false;
    });
    const title = document.createElement('span');
    title.textContent = text;
    label.append(radio, title);
    $('#quiz-options').append(label);
  });
  $('#quiz-submit').innerHTML = 'Check answer <span aria-hidden="true">→</span>';
  $('#quiz-submit').disabled = true;
  showFeedback();
  updateProgress();
  if (moveFocus) {
    playMotion($('#quiz-form'), [{ opacity: .2, transform: 'translateX(12px)' }, { opacity: 1, transform: 'translateX(0)' }]);
    $('#quiz-question').setAttribute('tabindex', '-1');
    $('#quiz-question').focus({ preventScroll: true });
  }
}
function finishQuiz() {
  complete = true;
  $('#quiz-form').hidden = true;
  $('#quiz-results').hidden = false;
  enter($('#quiz-results'));
  playMotion($('.result-icon'), [{ transform: 'scale(.7) rotate(-18deg)' }, { transform: 'scale(1.08) rotate(5deg)', offset: .7 }, { transform: 'scale(1) rotate(0)' }], { duration: 600 });
  $('#quiz-score').textContent = `${quizScore} out of ${questions.length}.`;
  $('#quiz-result-copy').textContent = quizScore === 3 ? 'You’ve met the three ingredients of a website. Ready to build your own?' : 'Every try teaches you something. Take another look at the three ingredients and try again.';
  updateProgress();
  $('#quiz-score').setAttribute('tabindex', '-1');
  $('#quiz-score').focus({ preventScroll: true });
}
function restartQuiz(moveFocus = true) {
  questionIndex = 0;
  quizScore = 0;
  selectedAnswer = null;
  answered = false;
  complete = false;
  quizAnswers.length = 0;
  renderQuestion(moveFocus);
}
$('#quiz-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (complete) return;
  if (answered) {
    if (questionIndex === questions.length - 1) { finishQuiz(); return; }
    questionIndex += 1;
    selectedAnswer = null;
    answered = false;
    renderQuestion(true);
    return;
  }
  if (selectedAnswer === null) return;
  answered = true;
  const question = questions[questionIndex];
  if (selectedAnswer === question.correct) quizScore += 1;
  quizAnswers.push(selectedAnswer);
  $$('#quiz-options input').forEach((radio, index) => {
    radio.disabled = true;
    const label = radio.closest('label');
    if (index === question.correct) label.classList.add('correct');
    if (index === selectedAnswer && index !== question.correct) label.classList.add('incorrect');
  });
  showFeedback();
  updateProgress();
  $('#quiz-submit').innerHTML = questionIndex === questions.length - 1 ? 'See my score <span aria-hidden="true">→</span>' : 'Next question <span aria-hidden="true">→</span>';
});
$('#quiz-restart').addEventListener('click', () => restartQuiz());
$('#quiz-again').addEventListener('click', () => restartQuiz());
$('#feature-explanations').addEventListener('change', showFeedback);
$('#feature-progress').addEventListener('change', updateProgress);
restartQuiz(false);

let bugScore = 0;
let bugSubmitted = false;
function resetBug() {
  bugScore = 0;
  bugSubmitted = false;
  $('#bug-score').textContent = '0';
  $('#bug-observation').textContent = $('#bug-fixed').checked ? 'Fix applied. Submit twice and compare the result.' : 'Make a prediction, then try it.';
}
$('#bug-submit').addEventListener('click', () => {
  const fixed = $('#bug-fixed').checked;
  if (fixed && bugSubmitted) {
    $('#bug-observation').textContent = 'Still 1 point. The second submission is ignored—the fix holds.';
    return;
  }
  bugScore += 1;
  bugSubmitted = true;
  $('#bug-score').textContent = String(bugScore);
  playMotion($('#bug-score'), [{ transform: 'translateY(5px) scale(.92)', opacity: .4 }, { transform: 'translateY(0) scale(1)', opacity: 1 }], { duration: 280 });
  $('#bug-observation').textContent = bugScore === 1 ? 'One answer, one point. Now submit the same answer again.' : `${bugScore} points for one answer. You’ve found the bug: repeated submissions count again.`;
});
$('#bug-reset').addEventListener('click', resetBug);
$('#bug-fixed').addEventListener('change', () => {
  const fixed = $('#bug-fixed').checked;
  $('#bug-badge').textContent = fixed ? 'Fix applied' : 'Bug present';
  $('#bug-badge').classList.toggle('fixed', fixed);
  resetBug();
});

// Presentation controls follow section position and respect focused form controls.
const chapters = $$('[data-chapter]');
let chapterIndex = 0;
let presenting = false;
let duration = 55;
const chapterTimes = {
  45: ['0–5 min', '5–10 min', '5–10 min', '10–17 min', '17–27 min', '27–35 min', '35–40 min', '40–45 min'],
  55: ['0–5 min', '5–10 min', '5–10 min', '10–17 min', '17–32 min', '32–45 min', '45–50 min', '50–55 min'],
  60: ['0–5 min', '5–10 min', '5–10 min', '10–17 min', '17–32 min', '32–45 min', '45–50 min', '50–60 min']
};
function updateDock() {
  $('#chapter-count').textContent = `${String(chapterIndex + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
  $('#chapter-title').textContent = chapters[chapterIndex].dataset.chapter;
  $('#chapter-time').textContent = chapterTimes[duration][chapterIndex];
  $('#chapter-prev').disabled = chapterIndex === 0;
  $('#chapter-next').disabled = chapterIndex === chapters.length - 1;
}
function moveChapter(delta) {
  chapterIndex = Math.max(0, Math.min(chapters.length - 1, chapterIndex + delta));
  updateDock();
  scrollToSection(chapters[chapterIndex]);
}
function togglePresentation(force) {
  presenting = typeof force === 'boolean' ? force : !presenting;
  document.body.classList.toggle('presenting', presenting);
  $('#presenter-dock').hidden = !presenting;
  $('#present-toggle').setAttribute('aria-pressed', String(presenting));
  $('#present-toggle').innerHTML = presenting ? 'Presenting <span aria-hidden="true">↗</span>' : 'Present <span aria-hidden="true">↗</span>';
  updateDock();
  if (presenting) notify('Use ← and → to move through the guide. Escape exits.');
}
$('#present-toggle').addEventListener('click', () => togglePresentation());
$('#present-exit').addEventListener('click', () => { togglePresentation(false); $('#present-toggle').focus(); });
$('#chapter-prev').addEventListener('click', () => moveChapter(-1));
$('#chapter-next').addEventListener('click', () => moveChapter(1));
let scrollTick = false;
window.addEventListener('scroll', () => {
  if (scrollTick) return;
  scrollTick = true;
  requestAnimationFrame(() => {
    const anchor = window.innerHeight * 0.3;
    let current = 0;
    chapters.forEach((chapter, index) => { if (chapter.getBoundingClientRect().top <= anchor) current = index; });
    chapterIndex = current;
    updateDock();
    scrollTick = false;
  });
}, { passive: true });
window.addEventListener('keydown', (event) => {
  if (!presenting || $('dialog[open]') || event.target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]')) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); moveChapter(1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); moveChapter(-1); }
  if (event.key === 'Escape') { togglePresentation(false); $('#present-toggle').focus(); }
});

const agenda = $('#agenda-dialog');
function renderAgenda() {
  const buildEnd = duration === 45 ? 27 : 32;
  const debugEnd = duration === 45 ? 35 : 45;
  const habitsEnd = duration === 45 ? 40 : 50;
  const entries = [
    ['0–5', 'Start with something working', 'home'],
    ['5–10', 'The idea & just enough web basics', 'how-it-works'],
    ['10–17', 'Turn an idea into a useful prompt', 'prompt-builder'],
    [`17–${buildEnd}`, 'Build together live', 'workshop'],
    [`${buildEnd}–${debugEnd}`, 'Debug, test, and refine', 'debug'],
    [`${debugEnd}–${habitsEnd}`, 'Habits that make this work', 'habits'],
    ...(duration === 60 ? [['50–55', 'Write a prompt with a friend', 'next'], ['55–60', 'Questions & first projects', 'next']] : [[`${habitsEnd}–${duration}`, 'Questions & first projects', 'next']])
  ];
  $('#agenda-list').replaceChildren();
  entries.forEach(([time, title, target]) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${target}`;
    const timeLabel = document.createElement('span');
    timeLabel.textContent = `${time} min`;
    const text = document.createElement('b');
    text.textContent = title;
    link.append(timeLabel, text);
    link.addEventListener('click', (event) => { event.preventDefault(); agenda.close(); scrollToSection($(`#${target}`), true); });
    item.append(link);
    $('#agenda-list').append(item);
  });
}
function openAgenda() {
  renderAgenda();
  agenda.showModal();
  playMotion(agenda, [{ opacity: 0, transform: 'translateY(12px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 320 });
}
$('#agenda-open').addEventListener('click', openAgenda);
$('#agenda-dock').addEventListener('click', openAgenda);
$('#agenda-close').addEventListener('click', () => agenda.close());
agenda.addEventListener('click', (event) => {
  if (event.target !== agenda) return;
  const rect = agenda.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) agenda.close();
});
$$('[data-duration]').forEach((button) => button.addEventListener('click', () => {
  duration = Number(button.dataset.duration);
  $$('[data-duration]').forEach((item) => {
    item.classList.toggle('active', item === button);
    item.setAttribute('aria-pressed', String(item === button));
  });
  renderAgenda();
  updateDock();
}));
updateDock();


function updateMotionPreference() {
  document.body.classList.toggle('motion-paused', reducedMotion.matches);
  if (reducedMotion.matches) document.getAnimations?.().forEach((animation) => animation.cancel());
}
reducedMotion.addEventListener('change', updateMotionPreference);
updateMotionPreference();
