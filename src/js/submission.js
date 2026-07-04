/**
 * Supabase persistence: autosave drafts and final submission with duplicate prevention.
 */

import { getSupabase, isSupabaseConfigured, TABLE_NAME } from './supabase-client.js';
import {
  collectMetadata,
  isAlreadySubmitted,
  markSubmitted,
} from './storage.js';
import { computeScores, computeVerdictKey, verdicts } from './questions.js';

/** @type {ReturnType<typeof setTimeout>|null} */
let autosaveTimer = null;

const AUTOSAVE_DELAY_MS = 800;

/**
 * Build a row payload for Supabase.
 * @param {Object} params
 * @returns {Object}
 */
function buildPayload({
  sessionId,
  answers,
  current,
  completed,
  checklistChoice,
}) {
  const scores = computeScores(answers);
  const verdictKey = completed ? computeVerdictKey(scores) : null;
  const verdict = verdictKey ? verdicts[verdictKey] : null;

  return {
    session_id: sessionId,
    answers,
    scores,
    verdict_key: verdictKey,
    verdict_title: verdict?.title ?? null,
    verdict_body: verdict?.body ?? null,
    checklist_choice: checklistChoice ?? null,
    current_question: current,
    completed,
    metadata: collectMetadata(),
    submitted_at: completed ? new Date().toISOString() : null,
  };
}

/**
 * Upsert draft progress (in-progress quiz).
 * @param {Object} state
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function autosaveToSupabase(state) {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' };
  }

  if (isAlreadySubmitted(state.sessionId)) {
    return { ok: true };
  }

  const supabase = getSupabase();
  const payload = buildPayload({ ...state, completed: false });

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'session_id' });

  if (error) {
    console.error('[submission] Autosave failed:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/**
 * Debounced autosave wrapper.
 * @param {Object} state
 * @param {(result: { ok: boolean, error?: string }) => void} [onDone]
 */
export function scheduleAutosave(state, onDone) {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(async () => {
    const result = await autosaveToSupabase(state);
    onDone?.(result);
  }, AUTOSAVE_DELAY_MS);
}

/**
 * Submit final completed quiz. Prevents duplicate submissions per session.
 * @param {Object} state
 * @returns {Promise<{ ok: boolean, duplicate?: boolean, error?: string }>}
 */
export async function submitFinal(state) {
  if (isAlreadySubmitted(state.sessionId)) {
    return { ok: true, duplicate: true };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase not configured' };
  }

  const supabase = getSupabase();

  // Server-side duplicate check
  const { data: existing, error: fetchError } = await supabase
    .from(TABLE_NAME)
    .select('id, completed')
    .eq('session_id', state.sessionId)
    .maybeSingle();

  if (fetchError) {
    console.error('[submission] Fetch existing failed:', fetchError);
    return { ok: false, error: fetchError.message };
  }

  if (existing?.completed) {
    markSubmitted(state.sessionId);
    return { ok: true, duplicate: true };
  }

  const payload = buildPayload({ ...state, completed: true });

  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload, { onConflict: 'session_id' });

  if (error) {
    console.error('[submission] Final submit failed:', error);
    return { ok: false, error: error.message };
  }

  markSubmitted(state.sessionId);
  return { ok: true, duplicate: false };
}

/**
 * Restore session from Supabase (resume after refresh on a new device/tab).
 * @param {string} sessionId
 * @returns {Promise<Object|null>}
 */
export async function fetchRemoteSession(sessionId) {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
