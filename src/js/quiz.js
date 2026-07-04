/**
 * Quiz UI controller — preserves original behavior with autosave & Supabase hooks.
 */

import {
  questions,
  roundLabels,
  roundTags,
  letters,
  selClasses,
  verdicts,
  checklistOptions,
  computeScores,
  computeVerdictKey,
} from './questions.js';
import {
  getSessionId,
  resetSessionId,
  loadLocalState,
  saveLocalState,
  clearLocalState,
  isAlreadySubmitted,
} from './storage.js';
import {
  scheduleAutosave,
  submitFinal,
  fetchRemoteSession,
} from './submission.js';
import { isSupabaseConfigured } from './supabase-client.js';

/** @type {import('./storage.js').QuizState} */
let state = {
  sessionId: getSessionId(),
  current: 0,
  answers: new Array(questions.length).fill(null),
  completed: false,
  checklistChoice: null,
  updatedAt: new Date().toISOString(),
};

let isSubmitting = false;

// DOM refs (set in init)
/** @type {HTMLElement|null} */ let syncStatusEl = null;
/** @type {ReturnType<typeof setTimeout>|null} */ let statusHideTimer = null;

const els = {};

/**
 * Show transient sync status toast.
 * @param {'loading'|'saved'|'error'|'idle'} kind
 * @param {string} message
 * @param {number} [autoHideMs]
 */
function showSyncStatus(kind, message, autoHideMs = 2500) {
  if (!syncStatusEl) return;
  syncStatusEl.className = `sync-status visible ${kind === 'idle' ? '' : kind}`.trim();
  syncStatusEl.textContent = message;

  if (statusHideTimer) clearTimeout(statusHideTimer);
  if (autoHideMs > 0 && kind !== 'loading') {
    statusHideTimer = setTimeout(() => {
      syncStatusEl.classList.remove('visible', 'loading', 'saved', 'error');
    }, autoHideMs);
  }
}

/**
 * Persist state locally and schedule remote autosave.
 */
function persistProgress() {
  saveLocalState(state);
  scheduleAutosave(state, (result) => {
    if (!isSupabaseConfigured()) return;
    if (result.ok) {
      showSyncStatus('saved', 'progress saved');
    } else {
      showSyncStatus('error', 'could not sync — saved locally');
    }
  });
}

/**
 * Build serializable state snapshot for persistence layers.
 */
function getStateSnapshot() {
  return {
    sessionId: state.sessionId,
    current: state.current,
    answers: [...state.answers],
    completed: state.completed,
    checklistChoice: state.checklistChoice,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Render current question card.
 */
function renderQuestion() {
  const item = questions[state.current];

  els.qtext.textContent = item.q;
  els.qnumLabel.textContent = `QUESTION ${state.current + 1} OF ${questions.length}`;
  els.qcount.textContent = String(state.current + 1);
  els.tag.innerHTML = roundTags[item.round];
  els.roundLabel.innerHTML = roundLabels[item.round];
  els.bar.style.width = `${(state.current / questions.length) * 100}%`;

  els.options.innerHTML = '';
  item.opts.forEach((opt, i) => {
    const div = document.createElement('div');
    div.className = 'opt';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    if (state.answers[state.current] === i) {
      div.classList.add('selected', selClasses[i]);
    }
    div.innerHTML = `<span class="letter">${letters[i]}</span><span>${opt}</span>`;
    div.addEventListener('click', () => selectAnswer(i));
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectAnswer(i);
      }
    });
    els.options.appendChild(div);
  });

  els.backBtn.style.visibility = state.current === 0 ? 'hidden' : 'visible';
  els.nextBtn.textContent = state.current === questions.length - 1 ? 'see verdict →' : 'next →';
  els.nextBtn.style.opacity = state.answers[state.current] === null ? '0.45' : '1';

  const filled = Math.round((state.current / questions.length) * 4);
  els.petals.forEach((p, idx) => {
    p.setAttribute('fill', idx < filled ? 'var(--mint-dark)' : '#EFEBD8');
  });
}

/**
 * Handle answer selection.
 * @param {number} index
 */
function selectAnswer(index) {
  state.answers[state.current] = index;
  renderQuestion();
  persistProgress();
}

/**
 * Navigate forward or show results.
 */
async function handleNext() {
  if (state.answers[state.current] === null || isSubmitting) return;

  if (state.current < questions.length - 1) {
    state.current += 1;
    renderQuestion();
    persistProgress();
    return;
  }

  await showResults();
}

/**
 * Navigate backward.
 */
function handleBack() {
  if (state.current > 0) {
    state.current -= 1;
    renderQuestion();
    persistProgress();
  }
}

/**
 * Render and submit final results.
 */
async function showResults() {
  state.completed = true;
  saveLocalState(state);

  els.heroBlock.style.display = 'none';
  els.quizBlock.style.display = 'none';
  els.resultsBlock.style.display = 'block';

  const counts = computeScores(state.answers);
  els.countA.textContent = String(counts.A);
  els.countB.textContent = String(counts.B);
  els.countC.textContent = String(counts.C);

  const verdictKey = computeVerdictKey(counts);
  const verdict = verdicts[verdictKey];

  els.vTitle.textContent = verdict.title;
  els.vBody.textContent = verdict.body;

  renderChecklist();

  // Final Supabase submission
  isSubmitting = true;
  els.restartBtn.style.pointerEvents = 'none';
  els.restartBtn.style.opacity = '0.5';

  if (isAlreadySubmitted(state.sessionId)) {
    showSyncStatus('saved', 'verdict already saved');
    isSubmitting = false;
    els.restartBtn.style.pointerEvents = '';
    els.restartBtn.style.opacity = '';
    return;
  }

  showSyncStatus('loading', 'saving your verdict…', 0);

  const result = await submitFinal(getStateSnapshot());

  isSubmitting = false;
  els.restartBtn.style.pointerEvents = '';
  els.restartBtn.style.opacity = '';

  if (result.ok) {
    showSyncStatus(
      'saved',
      result.duplicate ? 'verdict already on file' : 'verdict saved ✓',
    );
  } else if (!isSupabaseConfigured()) {
    showSyncStatus('error', 'offline mode — verdict not synced');
  } else {
    showSyncStatus('error', 'save failed — tap restart to retry');
  }
}

/**
 * Build interactive checklist on results screen.
 */
function renderChecklist() {
  els.checklist.innerHTML = '';
  checklistOptions.forEach((label) => {
    const row = document.createElement('div');
    row.className = 'check-opt';
    row.innerHTML = `<span class="box"></span><span>${label}</span>`;

    const box = row.querySelector('.box');

    if (state.checklistChoice === label) {
      box.style.background = 'var(--ink)';
    }

    row.addEventListener('click', async () => {
      state.checklistChoice = label;
      renderChecklist();
      persistProgress();

      if (state.completed && !isAlreadySubmitted(state.sessionId)) {
        showSyncStatus('loading', 'updating signature…', 0);
        const result = await submitFinal(getStateSnapshot());
        if (result.ok) {
          showSyncStatus('saved', 'signature noted');
        } else {
          showSyncStatus('error', 'could not save signature');
        }
      }
    });

    els.checklist.appendChild(row);
  });
}

/**
 * Reset quiz for retake — new session, cleared storage.
 */
function restartQuiz() {
  if (isSubmitting) return;

  clearLocalState();
  state = {
    sessionId: resetSessionId(),
    current: 0,
    answers: new Array(questions.length).fill(null),
    completed: false,
    checklistChoice: null,
    updatedAt: new Date().toISOString(),
  };

  els.heroBlock.style.display = 'block';
  els.quizBlock.style.display = 'block';
  els.resultsBlock.style.display = 'none';

  renderQuestion();
  showSyncStatus('idle', '');
}

/**
 * Restore progress from localStorage or Supabase after page load.
 */
async function restoreProgress() {
  const local = loadLocalState();

  if (local && local.sessionId) {
    state = {
      sessionId: local.sessionId,
      current: local.current ?? 0,
      answers: Array.isArray(local.answers)
        ? local.answers.slice(0, questions.length)
        : new Array(questions.length).fill(null),
      completed: Boolean(local.completed),
      checklistChoice: local.checklistChoice ?? null,
      updatedAt: local.updatedAt ?? new Date().toISOString(),
    };

    // Pad answers array if schema changed
    while (state.answers.length < questions.length) {
      state.answers.push(null);
    }
  } else if (isSupabaseConfigured()) {
    const remote = await fetchRemoteSession(state.sessionId);
    if (remote && !remote.completed) {
      state = {
        sessionId: remote.session_id,
        current: remote.current_question ?? 0,
        answers: remote.answers ?? new Array(questions.length).fill(null),
        completed: false,
        checklistChoice: remote.checklist_choice ?? null,
        updatedAt: remote.updated_at,
      };
      saveLocalState(state);
    }
  }

  if (state.completed) {
    els.heroBlock.style.display = 'none';
    els.quizBlock.style.display = 'none';
    els.resultsBlock.style.display = 'block';

    const counts = computeScores(state.answers);
    els.countA.textContent = String(counts.A);
    els.countB.textContent = String(counts.B);
    els.countC.textContent = String(counts.C);

    const verdictKey = computeVerdictKey(counts);
    els.vTitle.textContent = verdicts[verdictKey].title;
    els.vBody.textContent = verdicts[verdictKey].body;
    renderChecklist();

    if (!isAlreadySubmitted(state.sessionId)) {
      showSyncStatus('loading', 'syncing verdict…', 0);
      await submitFinal(getStateSnapshot());
    }
    showSyncStatus('saved', 'welcome back — progress restored');
  } else if (state.current > 0 || state.answers.some((a) => a !== null)) {
    showSyncStatus('saved', 'picked up where you left off');
    renderQuestion();
  } else {
    renderQuestion();
  }
}

/**
 * Initialize quiz app.
 */
export async function initQuiz() {
  syncStatusEl = document.getElementById('sync-status');

  els.heroBlock = document.getElementById('hero-block');
  els.quizBlock = document.getElementById('quiz-block');
  els.resultsBlock = document.getElementById('results-block');
  els.qtext = document.getElementById('qtext');
  els.options = document.getElementById('options');
  els.qnumLabel = document.getElementById('qnum-label');
  els.qcount = document.getElementById('qcount');
  els.bar = document.getElementById('bar');
  els.tag = document.getElementById('tag');
  els.roundLabel = document.getElementById('round-label');
  els.nextBtn = document.getElementById('nextBtn');
  els.backBtn = document.getElementById('backBtn');
  els.petals = document.querySelectorAll('#petals ellipse');
  els.countA = document.getElementById('count-a');
  els.countB = document.getElementById('count-b');
  els.countC = document.getElementById('count-c');
  els.vTitle = document.getElementById('v-title');
  els.vBody = document.getElementById('v-body');
  els.checklist = document.getElementById('checklist');
  els.restartBtn = document.getElementById('restartBtn');

  els.nextBtn.addEventListener('click', handleNext);
  els.backBtn.addEventListener('click', handleBack);
  els.restartBtn.addEventListener('click', restartQuiz);
  els.restartBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      restartQuiz();
    }
  });

  await restoreProgress();
}
