/**
 * Quiz content: questions, round labels, verdict copy, and checklist options.
 */

export const questions = [
  // ROUND 1 — CHEMISTRY & VIBES
  { round: 1, q: 'The second they walked in, your brain said:', opts: [
    'Oh we\'re doing THIS tonight.',
    'Cute. Concerning. Let\'s see where this goes.',
    'Okay universe, I see you, I\'m listening.',
  ]},
  { round: 1, q: 'Overall chemistry, honestly:', opts: [
    'Combustible. Somebody call the fire department, we cooking.',
    'Slow burn — pot\'s not boiling yet but it\'s warming up.',
    'Two people who ordered chemistry and got tap water.',
  ]},
  { round: 1, q: 'The eye contact situation:', opts: [
    'Aggressive. Borderline illegal. I felt SEEN.',
    'Shy little glances, both pretending to read the menu.',
    'Full staring contest, nobody blinked, someone\'s getting proposed to.',
  ]},
  { round: 1, q: 'By the end of the night, the tension was:', opts: [
    'So thick you could serve it as a side dish.',
    'A gentle simmer, comfortable, no rush.',
    'Nonexistent — we vibe like siblings at Thanksgiving.',
  ]},
  { round: 1, q: 'Physical closeness throughout the night:', opts: [
    'Started at \'polite strangers,\' ended sharing one chair.',
    'Casual touches that were absolutely NOT accidental.',
    'Kept a respectful two-foot buffer like a job interview.',
  ]},
  { round: 1, q: 'When the conversation lulled, the silence felt like:', opts: [
    'The good kind of quiet — comfortable, a little charged.',
    'Two people mentally drafting exit strategies.',
    'A silent agreement that talking was overrated anyway.',
  ]},
  { round: 1, q: 'Confidence levels displayed:', opts: [
    'Unbothered. In their bag. Main character energy.',
    'Nervous but trying — respect the hustle.',
    'So smooth it was almost suspicious. Where\'d they train.',
  ]},

  // ROUND 2 — THE MAIN EVENT
  { round: 2, q: 'MVP performance of the night goes to:', opts: [
    'The confidence. Zero hesitation, fully committed to the bit.',
    'The patience. A masterclass in \'we got time.\'',
    'The chaos. Wildly unpredictable, somehow it worked.',
  ]},
  { round: 2, q: 'Best move of the evening:', opts: [
    'Big spoon energy, fully committed, no notes.',
    'The kind of eye contact that should require a permit.',
    'Whatever THAT was — not naming it, but it worked.',
  ]},
  { round: 2, q: 'Stamina rating (conversation, laughter, vibes):', opts: [
    'Went all night, lost track of time completely.',
    'Strong showing, tapped out at a respectable hour.',
    'Can\'t remember, too good a time to count.',
  ]},
  { round: 2, q: 'Awkward moment of the night:', opts: [
    'Both went in for the same move at the same time.',
    'A silence so loud it had its own soundtrack.',
    'Someone said something during a moment they shouldn\'t have.',
  ]},
  { round: 2, q: 'Post-cuddle commitment level:', opts: [
    'Full wraparound, no negotiation, case closed.',
    'Slow build — tested the waters, then fully committed.',
    'One arm draped like they were doing me a favor.',
  ]},
  { round: 2, q: 'Overall \'would you review this vendor again\' rating:', opts: [
    'Five stars, already thinking about round two.',
    'Solid three stars, good service, mysterious follow-up.',
    'One star, but only because I won\'t admit how good it was.',
  ]},

  // ROUND 3 — ENTERTAINMENT & ATMOSPHERE
  { round: 3, q: 'The playlist/music situation:', opts: [
    'Immaculate. Send me the Spotify link immediately.',
    'Didn\'t even clock there was music, that\'s how locked in we were.',
    'Concerning. Explains a lot about their whole personality.',
  ]},
  { round: 3, q: 'Lighting rating:', opts: [
    'Candlelit and doing WAY too much heavy lifting, and it worked.',
    'Normal lighting, full accountability, no illusions.',
    'So dim I filed a missing person\'s report on my own dignity.',
  ]},
  { round: 3, q: 'Overall \'atmosphere\' of the night:', opts: [
    'Movie-set romantic, almost embarrassingly perfect.',
    'Chaotic but charming, like a sitcom pilot episode.',
    'Mid, but the company carried it completely.',
  ]},
  { round: 3, q: 'Did either party attempt a smooth move that did NOT land:', opts: [
    'Yes, and it\'s going in my memoir.',
    'No, everything landed a little too well, who trained them.',
    'Multiple fails, all somehow more charming than success.',
  ]},
  { round: 3, q: 'The comedic timing between you two:', opts: [
    'Certified comedy duo, we should get a Netflix special.',
    'One of us was clearly funnier and we both know it.',
    'Nobody was funny but we laughed anyway out of pure delusion.',
  ]},
  { round: 3, q: 'Snack/food behavior:', opts: [
    'Shared everything without being asked. Trust established.',
    'Guarded their plate like state secrets. Noted.',
    'Ordered whatever I ordered out of pure panic.',
  ]},
  { round: 3, q: 'Final verdict on the whole night:', opts: [
    '10/10, no notes, requesting an encore immediately.',
    'Strong contender, pending a follow-up investigation.',
    'Undecided — recommend a second date purely \'for research.\'',
  ]},
];

export const roundLabels = {
  1: 'Chemistry &amp; Vibes',
  2: 'The Main Event',
  3: 'Entertainment &amp; Atmosphere',
};

export const roundTags = {
  1: 'ROUND 1 · CHEMISTRY &amp; VIBES',
  2: 'ROUND 2 · THE MAIN EVENT',
  3: 'ROUND 3 · ENTERTAINMENT &amp; ATMOSPHERE',
};

export const letters = ['A', 'B', 'C'];
export const selClasses = ['sel-a', 'sel-b', 'sel-c'];

export const verdicts = {
  A: {
    title: 'Certified Chaos Merger',
    body: 'Look at the numbers. Mostly chaotic energy across the board — this wasn\'t a date, it was a controlled demolition, and everyone walked away impressed. HR (imaginary HR, we don\'t have HR) recommends immediate round two before either of you comes to your senses.',
  },
  B: {
    title: 'Slow Burn, Long Game',
    body: 'Steady, warm, comfortable — the kind of night that doesn\'t peak loud but sticks with you for a week. No fireworks, just a suspiciously good time. This one\'s playing chess, not checkers. Proceed with cautious optimism.',
  },
  C: {
    title: 'Politely Unbothered',
    body: 'Chill vibes, low drama, respectful distance. Could be \'we\'re just really mature adults\' or could be \'the spark left early and nobody said anything.\' Only one way to find out — there\'s a round two in your future either way, purely for research.',
  },
};

export const checklistOptions = [
  'RUN IT BACK — this one\'s staying in the rotation',
  'JURY\'S OUT — needs a round two before it\'s official',
  'CUT LOSSES — good story, bad match, we move on',
  'ALREADY TEXTING THEM RIGHT NOW',
];

/**
 * Compute A/B/C score counts from answer indices (0=A, 1=B, 2=C).
 * @param {Array<number|null>} answers
 * @returns {{ A: number, B: number, C: number }}
 */
export function computeScores(answers) {
  const counts = { A: 0, B: 0, C: 0 };
  answers.forEach((a) => {
    if (a !== null && a !== undefined) counts[letters[a]]++;
  });
  return counts;
}

/**
 * Determine winning verdict key (ties favor A, then B, then C).
 * @param {{ A: number, B: number, C: number }} counts
 * @returns {'A'|'B'|'C'}
 */
export function computeVerdictKey(counts) {
  const max = Math.max(counts.A, counts.B, counts.C);
  if (counts.A === max) return 'A';
  if (counts.B === max) return 'B';
  return 'C';
}
