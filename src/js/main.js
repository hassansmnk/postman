/**
 * Application entry point.
 */

import { initQuiz } from './quiz.js';

document.addEventListener('DOMContentLoaded', () => {
  initQuiz().catch((err) => {
    console.error('[app] Failed to initialize:', err);
  });
});
