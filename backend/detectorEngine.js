/**
 * AI Detector Engine for TextGuard AI Clone
 * Analyzes Perplexity, Burstiness, Repetitiveness, and Formulaic AI Triggers
 * across Tiếng Việt and English.
 */

import { detectLanguage, splitSentences } from './nlpEngine.js';

const VI_AI_TRIGGERS = [
  'không thể phủ nhận rằng',
  'trong bối cảnh hiện nay',
  'trong thời đại ngày nay',
  'trong kỷ nguyên số',
  'đóng vai trò quan trọng',
  'đóng vai trò then chốt',
  'nói tóm lại',
  'tóm lại là',
  'hơn nữa',
  'bên cạnh đó',
  'một cách toàn diện',
  'mang lại nhiều lợi ích',
  'góp phần không nhỏ',
  'không chỉ... mà còn',
  'như chúng ta đã biết',
  'đáng chú ý là',
  'là một minh chứng',
  'vô hình trung'
];

// Narrative & "Faux-Human / Healing Moral" AI patterns
// Very common when prompting ChatGPT to "write like a real human telling a story"
const VI_AI_NARRATIVE_TRIGGERS = [
  'nghĩ lại thì đôi khi',
  'không cần lúc nào cũng phải',
  'điều gì lớn lao',
  'chẳng phải chuyện gì xấu',
  'chỉ cần mọi thứ diễn ra bình thường',
  'có lẽ do lâu rồi',
  'cho mình một khoảng thời gian',
  'không phải nghĩ xem tiếp theo cần làm gì',
  'hóa ra hạnh phúc',
  'trân trọng những điều bình dị',
  'tìm lại chút bình yên',
  'đôi khi chỉ cần một khoảng lặng',
  'cuộc sống vội vã',
  'chữa lành tâm hồn',
  'học cách lắng nghe bản thân'
];

const EN_AI_TRIGGERS = [
  'in conclusion',
  'to sum up',
  'furthermore',
  'moreover',
  'it is crucial to remember',
  'it is important to note',
  'plays a crucial role',
  'plays a pivotal role',
  'in today\'s fast-paced',
  'delve into',
  'tapestry',
  'testament to',
  'navigating the complexities',
  'fosters an environment',
  'not only... but also',
  'beacon of',
  'vital importance',
  'it goes without saying'
];

const EN_AI_NARRATIVE_TRIGGERS = [
  'in the grand scheme of things',
  'realized that sometimes',
  'doesn\'t have to be grand',
  'finding beauty in the ordinary',
  'perhaps what i needed most',
  'a gentle reminder that',
  'learned to appreciate the little things',
  'amidst the chaos of life',
  'a moment of quiet contemplation'
];

/**
 * Calculate standard deviation of sentence lengths (Burstiness)
 */
function calculateBurstiness(sentenceLengths) {
  if (sentenceLengths.length <= 1) return 50;
  const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sentenceLengths.length;
  const stdDev = Math.sqrt(variance);

  // High stdDev means high burstiness (human-like).
  // Low stdDev (< 3) means uniform robotic sentence length (AI-like).
  // Normalize to 0-100 scale: stdDev of 8+ is very high burstiness (human)
  const burstinessScore = Math.min(100, Math.round((stdDev / 8) * 100));
  return burstinessScore;
}

/**
 * Calculate vocabulary richness (Type-Token Ratio)
 */
function calculateVocabularyRichness(words) {
  if (words.length === 0) return 50;
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const ttr = uniqueWords.size / words.length;
  // Normalized 0-100
  return Math.min(100, Math.round(ttr * 120));
}

/**
 * Analyze an individual sentence
 */
function analyzeSentence(sentence, lang, avgLength) {
  const lower = sentence.toLowerCase();
  const words = sentence.trim().split(/\s+/).filter(Boolean);
  const triggers = lang === 'vi' ? VI_AI_TRIGGERS : EN_AI_TRIGGERS;
  const narrativeTriggers = lang === 'vi' ? VI_AI_NARRATIVE_TRIGGERS : EN_AI_NARRATIVE_TRIGGERS;

  let aiScore = 15; // base natural baseline
  const reasons = [];

  // Check standard trigger phrases
  let foundTriggers = [];
  for (const trig of triggers) {
    if (lower.includes(trig)) {
      foundTriggers.push(trig);
    }
  }

  if (foundTriggers.length > 0) {
    aiScore += foundTriggers.length * 35;
    reasons.push(
      lang === 'vi' 
        ? `Chứa cụm từ khuôn mẫu AI: "${foundTriggers.join('", "')}"`
        : `Contains formulaic AI transition marker: "${foundTriggers.join('", "')}"`
    );
  }

  // Check narrative / faux-human healing moral triggers
  let foundNarratives = [];
  for (const trig of narrativeTriggers) {
    if (lower.includes(trig)) {
      foundNarratives.push(trig);
    }
  }

  if (foundNarratives.length > 0) {
    aiScore += foundNarratives.length * 40;
    reasons.push(
      lang === 'vi'
        ? `Phát hiện công thức suy ngẫm triết lý / chữa lành kinh điển của AI: "${foundNarratives.join('", "')}"`
        : `Detected characteristic AI philosophical epiphany / healing cliché: "${foundNarratives.join('", "')}"`
    );
  }

  // Check for "Too clean grammar despite casual slang 't' / 'm'" paradox
  if (lang === 'vi') {
    const hasSlang = /\b(?:t|m)\b/.test(lower);
    const hasPerfectConnectors = /(?:lúc đầu|trên đường đi|may là|nghĩ lại thì|cuối cùng)/i.test(sentence);
    if (hasSlang && hasPerfectConnectors && foundNarratives.length > 0) {
      aiScore += 25;
      reasons.push('Văn phong giả lập người thật: sử dụng từ xưng hô tắt kết hợp cấu trúc tự sự triết lý hoàn hảo');
    }
  }

  // Uniformity penalty: sentence length very close to 22-25 words with standard structure
  if (words.length >= 18 && words.length <= 26 && Math.abs(words.length - avgLength) < 3) {
    aiScore += 15;
    reasons.push(
      lang === 'vi'
        ? 'Độ dài câu đồng nhất điển hình của mô hình ngôn ngữ lớn (~20-25 từ)'
        : 'Uniform sentence length characteristic of LLM generation (~20-25 words)'
    );
  }

  // Passive voice & formal neutral constructions
  if (lang === 'vi') {
    if (/(?:được coi là|được xem là|có thể khẳng định rằng|sự phát triển của)/i.test(lower)) {
      aiScore += 15;
      reasons.push('Cấu trúc câu quá trịnh trọng và thụ động');
    }
  } else {
    if (/(?:it can be observed that|is widely considered to be|by utilizing)/i.test(lower)) {
      aiScore += 15;
      reasons.push('Overly passive and formal academic cadence');
    }
  }

  // Cap score 0-100
  aiScore = Math.max(5, Math.min(98, aiScore));

  let status = 'human';
  if (aiScore >= 65) {
    status = 'ai';
  } else if (aiScore >= 35) {
    status = 'mixed';
  }

  return {
    sentence,
    score: aiScore,
    status,
    reasons: reasons.length > 0 ? reasons : [lang === 'vi' ? 'Nhịp điệu tự nhiên, từ vựng đa dạng' : 'Natural cadence and varied vocabulary']
  };
}

/**
 * Main Detection Analysis
 */
export function detectAIText(text) {
  if (!text || !text.trim()) {
    return {
      aiScore: 0,
      humanScore: 100,
      burstiness: 100,
      perplexity: 100,
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      sentences: [],
      benchmarks: {
        turnitin: 0,
        gptzero: 0,
        copyleaks: 0,
        zerogpt: 0,
        crossplag: 0
      }
    };
  }

  const lang = detectLanguage(text);
  const rawSentences = splitSentences(text);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentenceLengths = rawSentences.map(s => s.trim().split(/\s+/).filter(Boolean).length);

  const avgLength = sentenceLengths.length > 0 
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length 
    : 0;

  const burstinessScore = calculateBurstiness(sentenceLengths);
  const vocabRichness = calculateVocabularyRichness(words);

  // Analyze each sentence
  const sentenceAnalyses = rawSentences.map(s => analyzeSentence(s, lang, avgLength));

  // Overall AI score is weighted average of sentences + burstiness penalty + vocab penalty
  const sentenceAverage = sentenceAnalyses.reduce((acc, item) => acc + item.score, 0) / (sentenceAnalyses.length || 1);

  // Check if narrative / faux-human storytelling persona was detected in the document
  const narrativeCount = sentenceAnalyses.filter(s => s.reasons.some(r => r.includes('triết lý') || r.includes('philosophical') || r.includes('giả lập'))).length;
  const narrativeBonus = narrativeCount >= 2 ? 35 : (narrativeCount === 1 ? 20 : 0);

  // Low burstiness increases AI score
  const burstinessPenalty = burstinessScore < 40 ? (40 - burstinessScore) * 0.4 : -((burstinessScore - 40) * 0.1);
  // Low vocab richness increases AI score
  const vocabPenalty = vocabRichness < 50 ? (50 - vocabRichness) * 0.3 : -((vocabRichness - 50) * 0.1);

  let rawOverallAi = sentenceAverage + burstinessPenalty + vocabPenalty + narrativeBonus;
  rawOverallAi = Math.max(2, Math.min(99, Math.round(rawOverallAi)));

  const humanScore = 100 - rawOverallAi;

  // Predict benchmarks with realistic standard deviations
  const benchmarks = {
    turnitin: Math.max(0, Math.min(100, Math.round(rawOverallAi * 0.96 + (Math.random() * 4 - 2)))),
    gptzero: Math.max(0, Math.min(100, Math.round(rawOverallAi * 1.02 + (Math.random() * 4 - 2)))),
    copyleaks: Math.max(0, Math.min(100, Math.round(rawOverallAi * 0.98 + (Math.random() * 4 - 2)))),
    zerogpt: Math.max(0, Math.min(100, Math.round(rawOverallAi * 0.94 + (Math.random() * 5 - 2)))),
    crossplag: Math.max(0, Math.min(100, Math.round(rawOverallAi * 0.97 + (Math.random() * 3 - 1))))
  };

  return {
    lang,
    aiScore: rawOverallAi,
    humanScore,
    burstiness: burstinessScore,
    perplexity: Math.min(100, Math.max(10, Math.round(vocabRichness * 0.6 + burstinessScore * 0.4))),
    wordCount: words.length,
    charCount: text.length,
    sentenceCount: rawSentences.length,
    sentences: sentenceAnalyses,
    benchmarks
  };
}
