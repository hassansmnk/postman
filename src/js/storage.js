/**
 * Local persistence: session ID, autosave, resume, and duplicate-submit flags.
 */

const STORAGE_KEY = 'post-date-debrief-state';
const SESSION_KEY = 'post-date-debrief-session-id';
const SUBMITTED_PREFIX = 'post-date-debrief-submitted-';

/**
 * Generate or retrieve a stable session ID for this browser tab/session.
 * @returns {string}
 */
export function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Start a fresh session (retake flow).
 * @returns {string}
 */
export function resetSessionId() {
  const id = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, id);
  return id;
}

/**
 * @typedef {Object} QuizState
 * @property {string} sessionId
 * @property {number} current
 * @property {Array<number|null>} answers
 * @property {boolean} completed
 * @property {string|null} checklistChoice
 * @property {string} updatedAt
 */

/**
 * Load saved quiz state from localStorage.
 * @returns {QuizState|null}
 */
export function loadLocalState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Persist quiz state locally (autosave).
 * @param {QuizState} state
 */
export function saveLocalState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      updatedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[storage] Failed to save local state:', err);
  }
}

/**
 * Clear local quiz progress.
 */
export function clearLocalState() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Mark session as submitted to prevent duplicate final submissions.
 * @param {string} sessionId
 */
export function markSubmitted(sessionId) {
  localStorage.setItem(`${SUBMITTED_PREFIX}${sessionId}`, new Date().toISOString());
}

/**
 * Check if this session was already submitted.
 * @param {string} sessionId
 * @returns {boolean}
 */
export function isAlreadySubmitted(sessionId) {
  return Boolean(localStorage.getItem(`${SUBMITTED_PREFIX}${sessionId}`));
}

/**
 * Collect client metadata sent with each Supabase row.
 * @returns {Record<string, unknown>}
 */
export function collectMetadata() {
  return {
    app_version: '1.0.0',
    user_agent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: window.screen.width,
      height: window.screen.height,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    referrer: document.referrer || null,
    platform: navigator.platform,
    online: navigator.onLine,
  };
}
