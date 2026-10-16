const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const { mkdirSync } = require('node:fs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const output = path.join(root, 'test-results');
  mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'chrome' });
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (!pathname.startsWith('/vibe-coding-demo/')) { res.writeHead(404); res.end(); return; }
      const name = pathname.slice('/vibe-coding-demo/'.length) || 'index.html';
      if (!['index.html', 'styles.css', 'app.js', 'favicon.svg'].includes(name)) { res.writeHead(404); res.end(); return; }
      res.setHeader('Content-Type', ({'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml'})[path.extname(name)]);
      res.end(await readFile(path.join(root, name)));
    } catch { res.writeHead(500); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/vibe-coding-demo/`;
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`); });
  let checks = 0;
  function ok(value, msg) { assert(value, msg); checks++; console.log(`PASS ${msg}`); }
  try {
    await page.goto(url);
    ok(await page.title() === 'Vibe Coding — From idea to “I made this.”', 'Site loads under a GitHub Pages project subpath');
    ok(await page.locator('#quiz-options input').count() === 3, 'Quiz initializes with three answers');
    ok(await page.locator('#quiz-submit').isDisabled(), 'Cannot submit without an answer');
    await page.screenshot({ path: path.join(output, 'desktop.png'), fullPage: true });

    async function runQuiz(answers, expected) {
      await page.locator('#quiz-restart').click();
      for (let i = 0; i < answers.length; i++) {
        await page.locator('#quiz-options input').nth(answers[i]).check();
        await page.locator('#quiz-submit').click();
        ok(await page.locator('#quiz-options input:disabled').count() === 3, `Answers lock after submission (${expected}, question ${i+1})`);
        await page.locator('#quiz-submit').click();
      }
      ok(await page.locator('#quiz-score').textContent() === `${expected} out of 3.`, `Quiz score is ${expected}/3`);
    }
    await runQuiz([1,2,0],3);
    await runQuiz([0,0,1],0);
    await runQuiz([1,0,0],2);
    await page.locator('#quiz-again').click();
    ok(await page.locator('#quiz-submit').isDisabled(), 'Restart clears selection and score state');
    await page.locator('#feature-progress').check();
    await page.locator('#feature-explanations').check();
    await page.locator('#quiz-options input').nth(1).check();
    await page.locator('#quiz-submit').click();
    ok(await page.locator('#quiz-feedback').textContent() === 'That’s right!HTML describes the content and structure: headings, questions, answers, and buttons.', 'Prepared explanations appear after answering');
    ok(await page.locator('#progress-bar').getAttribute('value') === '1', 'Progress reflects submitted answers');
    await page.locator('#feature-explanations').uncheck();
    ok(!((await page.locator('#quiz-feedback').textContent()).includes('describes')), 'Explanation switch updates an already answered question');
    await page.locator('#quiz-restart').click();
    ok(await page.locator('#progress-bar').getAttribute('value') === '0', 'Restart clears progress');
    await page.locator('#quiz-options input').nth(1).check();
    await page.locator('#quiz-submit').dblclick();
    ok(await page.locator('#quiz-question').textContent() === 'What controls the colors and spacing?', 'Rapid double submit advances without duplicate scoring');
    ok(await page.locator('#quiz-submit').isDisabled(), 'Next question still requires its own answer');

    await page.locator('#audience').fill('Friends <script>not executable</script>');
    ok((await page.locator('#prompt-output').inputValue()).includes('Friends <script>not executable</script>'), 'Prompt fields update as plain text');
    await page.locator('#prompt-output').fill('My edited prompt');
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText:async()=>{throw new Error('denied')}}}));
    await page.locator('#copy-prompt').click();
    ok((await page.locator('#prompt-status').textContent()).includes('Clipboard unavailable'), 'Clipboard failure provides manual-copy instructions');
    ok(await page.locator('#prompt-output').evaluate(el => el.selectionEnd-el.selectionStart) === 'My edited prompt'.length, 'Manual-copy fallback selects edited prompt');
    await page.evaluate(() => {window.copiedText='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text)=>{window.copiedText=text}}});});
    await page.locator('#copy-prompt').click();
    ok(await page.evaluate(()=>window.copiedText) === 'My edited prompt', 'Copy uses the editable output');
    await page.locator('[data-project="timer"]').click();
    ok((await page.locator('#prompt-output').inputValue()).includes('25-minute study timer'), 'Project starters populate prompt builder');
    await page.locator('#example-reset').click();
    ok((await page.locator('#prompt-output').inputValue()).includes('Three multiple-choice questions'), 'Quiz example can be restored');
    for (const step of [1,2,3,4,0]) await page.locator(`[data-step="${step}"]`).click();
    ok((await page.locator('#step-quote').textContent()).includes('three-question'), 'Workflow examples switch');
    await page.locator('[data-compare="clear"]').click();
    ok(await page.locator('#compare-preview').evaluate(el=>el.classList.contains('clear-preview')), 'Before/after changes prompt and prepared preview');

    await page.locator('#bug-submit').click();
    await page.locator('#bug-submit').click();
    ok(await page.locator('#bug-score').textContent() === '2', 'Bug exercise reproduces repeated-submission issue');
    await page.locator('#bug-fixed').check();
    await page.locator('#bug-submit').click();
    await page.locator('#bug-submit').click();
    ok(await page.locator('#bug-score').textContent() === '1', 'Prepared fix prevents duplicate points');
    await page.locator('#bug-reset').click();
    ok(await page.locator('#bug-score').textContent() === '0', 'Bug reset works');

    await page.locator('#agenda-open').click();
    await page.locator('[data-duration="45"]').click();
    ok((await page.locator('#agenda-list').textContent()).includes('40–45'), '45-minute agenda ends on time');
    await page.locator('[data-duration="60"]').click();
    ok((await page.locator('#agenda-list').textContent()).includes('55–60'), '60-minute agenda includes paired exercise');
    ok(!(await page.locator('#agenda-list').textContent()).match(/publish|online/i), 'No publishing topic in agenda');
    await page.keyboard.press('Escape');
    ok(!await page.locator('#agenda-dialog').isVisible(), 'Escape closes agenda');
    await page.locator('#present-toggle').click();
    ok(await page.locator('#presenter-dock').isVisible(), 'Presentation mode opens');
    await page.locator('#chapter-next').click();
    ok(await page.locator('#chapter-title').textContent() === 'The idea', 'Presenter chapter navigation works');
    await page.locator('#audience').focus();
    const chapterBefore = await page.locator('#chapter-title').textContent();
    await page.keyboard.press('ArrowRight');
    ok(await page.locator('#chapter-title').textContent() === chapterBefore, 'Presenter shortcuts do not steal input keys');
    await page.locator('#present-exit').click();
    await page.goto(url);
    await page.keyboard.press('Tab');
    ok(await page.evaluate(()=>document.activeElement.className) === 'skip-link', 'Keyboard has a skip-to-content link');
    await page.keyboard.press('Enter');
    ok(await page.evaluate(()=>document.activeElement.id) === 'main', 'Skip link moves focus to content');
    ok(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior) === 'auto', 'Reduced-motion setting removes smooth scrolling');
    for (const width of [1440,1024,768,390,320]) {
      await page.setViewportSize({width,height:900});
      await page.goto(url);
      ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth), `No horizontal overflow at ${width}px`);
    }
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:path.join(output, 'mobile.png'),fullPage:true});
    await page.locator('#workshop').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output, 'quiz-mobile.png')});
    ok(errors.length === 0, `No browser errors or failed asset requests: ${errors.join(', ')}`);
    console.log(`\n${checks} browser checks passed.`);
  } finally {
    await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
