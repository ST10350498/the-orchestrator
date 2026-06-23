const highPatterns = [
  {
    pattern: /the system shall/gi,
    suggestion: 'Change to "Users need to be able to" or "The system should"'
  },
  {
    pattern: /furthermore|moreover|additionally/gi,
    suggestion: 'Use "Also", "Plus", or "Another thing" instead'
  },
  {
    pattern: /in conclusion|to summarize|ultimately/gi,
    suggestion: 'State your conclusion directly without transition phrases'
  },
  {
    pattern: /this demonstrates that|this shows that|this illustrates that/gi,
    suggestion: 'Be more direct. Say what you mean without "this shows that"'
  },
  {
    pattern: /it is important to note that|it should be noted that/gi,
    suggestion: 'Remove this phrase. Just state the fact directly.'
  },
  {
    pattern: /there are several factors|there are a number of/gi,
    suggestion: 'Be specific. List what you mean directly.'
  },
];

const mediumPatterns = [
  {
    pattern: /according to [A-Z][a-z]+ \(\d{4}\)/gi,
    suggestion: 'Move the citation to the end of the sentence or integrate it naturally'
  },
  {
    pattern: /[A-Z][a-z]{12,} [a-z]{4,} [a-z]{4,} [a-z]{4,}/,
    suggestion: 'Vary your sentence length. Mix short and medium sentences.'
  },
];

function detectAIScore(text) {
  let score = 0;
  const suggestions = [];

  const contractionCount = (text.match(/'/g) || []).length;
  if (contractionCount < 3 && text.length > 100) {
    score += 10;
    suggestions.push('Use contractions like "don\'t", "can\'t", "it\'s", "that\'s"');
  }

  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 3) {
    const lengths = sentences.map(s => s.length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.map(l => Math.abs(l - avg)).reduce((a, b) => a + b, 0) / lengths.length;
    if (variance < 15) {
      score += 15;
      suggestions.push('Vary your sentence lengths. Mix short (5-10 words) and medium (15-20 words) sentences.');
    }
  }

  for (const pattern of highPatterns) {
    if (pattern.pattern.test(text)) {
      score += 12;
      suggestions.push(pattern.suggestion);
    }
  }

  for (const pattern of mediumPatterns) {
    if (pattern.pattern.test(text)) {
      score += 8;
      suggestions.push(pattern.suggestion);
    }
  }

  if (text.includes('I think') || text.includes('I believe') || text.includes('In my experience') || text.includes('I found')) {
    score = Math.max(0, score - 8);
  }

  if (text.includes('?')) {
    score = Math.max(0, score - 5);
  }

  score = Math.min(100, Math.max(0, score));

  let verdict = 'safe';
  if (score > 60) verdict = 'rewrite';
  else if (score > 35) verdict = 'review';

  return { score, verdict, suggestions };
}

function humanizeText(text) {
  let humanized = text;

  const replacements = [
    { from: /The system shall/gi, to: 'Users need to be able to' },
    { from: /The system should/gi, to: 'The system should' },
    { from: /Furthermore,/gi, to: 'Also,' },
    { from: /Moreover,/gi, to: 'Plus,' },
    { from: /In addition,/gi, to: 'Another thing is' },
    { from: /This demonstrates that/gi, to: 'What this means is' },
    { from: /This shows that/gi, to: 'This means' },
    { from: /According to/gi, to: '' },
    { from: /It is important to note that/gi, to: '' },
    { from: /There are several/gi, to: 'Some' },
    { from: /cannot\b/gi, to: "can't" },
    { from: /do not\b/gi, to: "don't" },
    { from: /will not\b/gi, to: "won't" },
    { from: /is not\b/gi, to: "isn't" },
    { from: /are not\b/gi, to: "aren't" },
    { from: /has not\b/gi, to: "hasn't" },
    { from: /have not\b/gi, to: "haven't" },
    { from: /was not\b/gi, to: "wasn't" },
    { from: /were not\b/gi, to: "weren't" },
  ];

  for (const rep of replacements) {
    humanized = humanized.replace(rep.from, rep.to);
  }

  humanized = humanized.replace(/([a-z]) ([A-Z])/g, '$1. $2');

  if (!humanized.includes('I') && humanized.length > 50 && !humanized.startsWith('I')) {
    const firstSentence = humanized.split('.')[0];
    if (firstSentence && firstSentence.length > 10) {
      humanized = 'I found that ' + humanized.charAt(0).toLowerCase() + humanized.slice(1);
    }
  }

  return humanized;
}

module.exports = {
  detectAIScore,
  humanizeText,
  highPatterns,
  mediumPatterns,
};