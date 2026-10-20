/**
 * NLP Engine for TextGuard AI Clone
 * High-precision transformation rules & linguistic restructuring
 * for Vietnamese and English to bypass AI detectors.
 */

// Vietnamese AI Clichés and natural human alternatives
const VI_CLICHES = [
  {
    pattern: /\b(?:không thể phủ nhận rằng|không ai có thể phủ nhận rằng)\s+(?:trong bối cảnh hiện nay|trong thời đại ngày nay|trong thời đại số hóa ngày nay|trong kỷ nguyên số hiện nay|trong kỷ nguyên số)\b/gi,
    replacements: ['Thực tế thời gian qua,', 'Rõ ràng trong thời buổi số hóa,', 'Có thể thấy ngày nay,', 'Xét trong bối cảnh hiện tại,']
  },
  {
    pattern: /\b(?:không thể phủ nhận rằng|không ai có thể phủ nhận rằng)\b/gi,
    replacements: ['Rõ ràng là', 'Thực tế cho thấy', 'Có thể thấy', 'Ai cũng thấy', 'Đúng là']
  },
  {
    pattern: /\b(?:trong bối cảnh hiện nay|trong thời đại ngày nay|trong thời đại số hóa ngày nay|trong kỷ nguyên số hiện nay|trong xã hội hiện đại|trong kỷ nguyên số)\b/gi,
    replacements: ['Hiện giờ,', 'Thời buổi này,', 'Dạo gần đây,', 'Ngày nay,', 'Vào lúc này,']
  },
  {
    pattern: /\b(?:đóng một vai trò vô cùng quan trọng|đóng vai trò vô cùng quan trọng|đóng vai trò then chốt|đóng vai trò cốt lõi|giữ vai trò quan trọng|đang đóng một vai trò vô cùng quan trọng|đang đóng vai trò quan trọng)\b/gi,
    replacements: ['rất cần thiết', 'là yếu tố quyết định', 'ảnh hưởng trực tiếp', 'giữ vị trí chủ chốt', 'không thể thiếu']
  },
  {
    pattern: /\b(?:nói tóm lại|tóm lại là|kết luận lại|nhìn chung lại)\b/gi,
    replacements: ['Tóm gọn lại,', 'Nói chung,', 'Điểm mấu chốt là', 'Cuối cùng thì', 'Nhìn tổng thể,']
  },
  {
    pattern: /\b(?:hơn nữa|bên cạnh đó|ngoài ra còn có|thêm vào đó)\b/gi,
    replacements: ['Chưa kể,', 'Đồng thời,', 'Mặt khác,', 'Đáng chú ý là', 'Cũng phải kể đến']
  },
  {
    pattern: /\b(?:một cách toàn diện|một cách sâu sắc|một cách triệt để)\b/gi,
    replacements: ['kỹ lưỡng', 'từ nhiều góc độ', 'thấu đáo', 'tận gốc', 'tường tận']
  },
  {
    pattern: /\b(?:mang lại nhiều lợi ích to lớn|đem lại nhiều giá trị thiết thực)\b/gi,
    replacements: ['giúp ích rất nhiều', 'tạo ra giá trị rõ rệt', 'thực sự hiệu quả', 'đem lại nhiều kết quả tốt']
  },
  {
    pattern: /\b(?:góp phần không nhỏ vào|góp phần thúc đẩy)\b/gi,
    replacements: ['giúp đẩy nhanh', 'tạo đòn bẩy cho', 'tiếp thêm sức mạnh cho', 'trực tiếp hỗ trợ']
  },
  {
    pattern: /\b(?:không chỉ dừng lại ở đó mà còn|không những thế mà còn)\b/gi,
    replacements: ['Chẳng những vậy,', 'Xa hơn nữa,', 'Song song với đó,']
  },
  {
    pattern: /\b(?:vô hình trung|vô hình chung)\b/gi,
    replacements: ['tình cờ', 'ngẫu nhiên lại', 'khiến cho']
  },
  {
    pattern: /\b(?:là một minh chứng rõ nét cho|là minh chứng hùng hồn cho)\b/gi,
    replacements: ['chứng minh rõ', 'cho thấy rất cụ thể', 'làm nổi bật']
  },
  {
    pattern: /\b(?:mở ra một chân trời mới|mở ra một kỷ nguyên mới)\b/gi,
    replacements: ['mở ra nhiều hướng đi mới', 'tạo ra bước ngoặt lớn', 'mở đường cho hướng tiếp cận mới']
  }
];

// English AI Clichés and natural human alternatives
const EN_CLICHES = [
  {
    pattern: /\b(?:in conclusion|to conclude|to sum up|in summary)\b/gi,
    replacements: ['Ultimately,', 'All in all,', 'The takeaway is simple:', 'Looking back,', 'At the end of the day,']
  },
  {
    pattern: /\b(?:furthermore|moreover|in addition to this|additionally)\b/gi,
    replacements: ['Also,', 'On top of that,', 'Beyond that,', 'What is more,', 'Plus,']
  },
  {
    pattern: /\b(?:it is crucial to remember that|it is vital to understand that|it is important to note that)\b/gi,
    replacements: ['Keep in mind that', 'Notice that', 'The key thing here is', 'Don\'t forget that', 'Worth noting:']
  },
  {
    pattern: /\b(?:plays a crucial role in|plays a pivotal role in|plays an indispensable role in)\b/gi,
    replacements: ['matters a lot for', 'is central to', 'heavily drives', 'is essential for', 'makes a huge difference in']
  },
  {
    pattern: /\b(?:in today's fast-paced digital world|in the modern era|in this rapidly evolving landscape)\b/gi,
    replacements: ['Nowadays,', 'Right now,', 'These days,', 'Across current industries,', 'Today,']
  },
  {
    pattern: /\b(?:delve into|delving deep into)\b/gi,
    replacements: ['dig into', 'examine', 'explore', 'take a closer look at', 'break down']
  },
  {
    pattern: /\b(?:tapestry of|rich tapestry)\b/gi,
    replacements: ['blend of', 'mosaic of', 'network of', 'mix of']
  },
  {
    pattern: /\b(?:a testament to|stands as a testament)\b/gi,
    replacements: ['clear proof of', 'shows just how', 'highlights the impact of']
  },
  {
    pattern: /\b(?:navigating the complexities of|navigate the landscape)\b/gi,
    replacements: ['handling', 'dealing with', 'working through', 'managing']
  },
  {
    pattern: /\b(?:fosters an environment of|foster innovation)\b/gi,
    replacements: ['encourages', 'builds', 'sparks', 'fuels']
  },
  {
    pattern: /\b(?:it goes without saying that)\b/gi,
    replacements: ['Naturally,', 'Of course,', 'As expected,']
  }
];

// Conversational and natural human transition connectors
const VI_NATURAL_CONNECTORS = [
  'Thực tế thì,', 'Nói một cách thẳng thắn,', 'Chính vì thế,', 
  'Đáng kể nhất là', 'Rõ ràng,', 'Thay vào đó,', 'Xét cho cùng,'
];

const EN_NATURAL_CONNECTORS = [
  'In reality,', 'Frankly,', 'That is why', 
  'More importantly,', 'Clearly,', 'Instead,', 'After all,'
];

/**
 * Detect language (Vietnamese vs English)
 */
export function detectLanguage(text) {
  const viChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return viChars.test(text) ? 'vi' : 'en';
}

/**
 * Split text into sentences preserving punctuation
 */
export function splitSentences(text) {
  if (!text) return [];
  // Match sentences ending in ., !, ?, or newlines
  const regex = /[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g;
  const matches = text.match(regex);
  return matches ? matches.map(s => s.trim()).filter(s => s.length > 0) : [text];
}

/**
 * Smart transformation applying linguistic bursting, cliché removal,
 * syntax inversion, and tone calibration.
 */
export function humanizeLocal(text, options = {}) {
  const {
    strength = 'balanced', // 'light' | 'balanced' | 'aggressive'
    readability = 'college', // 'high_school' | 'college' | 'journalist' | 'doctorate'
    purpose = 'general' // 'general' | 'essay' | 'marketing' | 'story' | 'business' | 'legal'
  } = options;

  if (!text || !text.trim()) return '';

  const lang = detectLanguage(text);
  let processed = text;

  // 1. Cliché removal and replacement
  const cliches = lang === 'vi' ? VI_CLICHES : EN_CLICHES;
  for (const item of cliches) {
    processed = processed.replace(item.pattern, () => {
      const idx = Math.floor(Math.random() * item.replacements.length);
      return item.replacements[idx];
    });
  }

  // 2. Sentence-level syntactic & burstiness adjustments
  const paragraphs = processed.split(/\n\n+/);
  const transformedParagraphs = paragraphs.map((para) => {
    const rawSentences = splitSentences(para);
    if (rawSentences.length === 0) return para;

    const modifiedSentences = [];

    for (let i = 0; i < rawSentences.length; i++) {
      let sentence = rawSentences[i].trim();
      if (!sentence) continue;

      // Burstiness: In balanced or aggressive mode, vary sentence length
      // Break long uniform sentences (typical of AI) into short & varied cadences
      const words = sentence.split(/\s+/);

      if (strength === 'aggressive' && words.length > 22) {
        // Find natural conjunction or comma to split
        if (lang === 'vi') {
          const splitPoint = sentence.search(/,\s+(?:đồng thời|tuy nhiên|nhưng|do đó|vì vậy|qua đó)/i);
          if (splitPoint > 20 && splitPoint < sentence.length - 15) {
            const part1 = sentence.slice(0, splitPoint).trim() + '.';
            const remainder = sentence.slice(splitPoint + 1).trim();
            const part2 = remainder.charAt(0).toUpperCase() + remainder.slice(1);
            modifiedSentences.push(part1);
            modifiedSentences.push(part2);
            continue;
          }
        } else {
          const splitPoint = sentence.search(/,\s+(?:and|which|however|therefore|while|whereas)/i);
          if (splitPoint > 25 && splitPoint < sentence.length - 15) {
            const part1 = sentence.slice(0, splitPoint).trim() + '.';
            const remainder = sentence.slice(splitPoint + 1).trim();
            const part2 = remainder.charAt(0).toUpperCase() + remainder.slice(1);
            modifiedSentences.push(part1);
            modifiedSentences.push(part2);
            continue;
          }
        }
      }

      // Purpose-specific tone injection
      if (purpose === 'marketing' && i === 0 && Math.random() > 0.4) {
        if (lang === 'vi' && !sentence.startsWith('Hãy') && !sentence.includes('?')) {
          sentence = 'Điều thú vị là, ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        } else if (lang === 'en' && !sentence.includes('?')) {
          sentence = 'Here is what matters: ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
      } else if (purpose === 'essay' && i === rawSentences.length - 1 && Math.random() > 0.5) {
        if (lang === 'vi') {
          sentence = sentence.replace(/^(?:Tóm lại|Kết luận),?/i, 'Tổng hợp các luận cứ trên,');
        } else {
          sentence = sentence.replace(/^(?:In conclusion|To sum up),?/i, 'Taking these points together,');
        }
      }

      // Add conversational connector to introduce natural human perplexity
      if (strength !== 'light' && i > 0 && Math.random() < 0.22) {
        const connectors = lang === 'vi' ? VI_NATURAL_CONNECTORS : EN_NATURAL_CONNECTORS;
        const conn = connectors[Math.floor(Math.random() * connectors.length)];
        const firstChar = sentence.charAt(0);
        if (firstChar === firstChar.toUpperCase() && !sentence.startsWith(conn)) {
          sentence = conn + ' ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
        }
      }

      // Subtle human nuance tweaks (synonym variance)
      if (lang === 'vi') {
        sentence = sentence
          .replace(/\brất nhiều\b/g, () => Math.random() > 0.5 ? 'không ít' : 'hàng loạt')
          .replace(/\bhoàn toàn\b/g, () => Math.random() > 0.5 ? 'hẳn' : 'hoàn toàn')
          .replace(/\bnhanh chóng\b/g, () => Math.random() > 0.5 ? 'chớp nhoáng' : 'nhanh gọn')
          .replace(/\bvấn đề này\b/g, () => Math.random() > 0.5 ? 'chuyện này' : 'điều này');
      } else {
        sentence = sentence
          .replace(/\butilize\b/gi, 'use')
          .replace(/\bfacilitate\b/gi, 'ease')
          .replace(/\bparamount\b/gi, 'vital')
          .replace(/\bcommence\b/gi, 'kick off')
          .replace(/\bdemonstrates\b/gi, 'points to');
      }

      modifiedSentences.push(sentence);
    }

    return modifiedSentences.join(' ')
      .replace(/,\s*,+/g, ', ')
      .replace(/\s+,/g, ', ')
      .replace(/\s+\./g, '.')
      .replace(/\s{2,}/g, ' ')
      .trim();
  });

  return transformedParagraphs.join('\n\n');
}

/**
 * Humanize using an External LLM (e.g. Gemini or OpenAI API) if the user supplied an API key
 */
export async function humanizeWithLLM(text, options = {}, config = {}) {
  const { apiKey, provider = 'gemini', model = 'gemini-2.0-flash' } = config;
  const { strength = 'balanced', readability = 'college', purpose = 'general' } = options;

  if (!apiKey) {
    throw new Error('No API key provided');
  }

  const prompt = `You are an elite linguistic expert and human writer specializing in transforming AI-generated content into completely authentic, human-written text that naturally bypasses all AI detectors (including Turnitin, GPTZero, CopyLeaks, and ZeroGPT).

INPUT TEXT:
"""${text}"""

TRANSFORMATION RULES:
1. Target Readability: ${readability.toUpperCase()} level.
2. Purpose/Context: ${purpose.toUpperCase()}.
3. Humanization Strength: ${strength.toUpperCase()} (Light = keep structure, fix nuance; Balanced = optimal rhythm and natural flow; Aggressive = deep syntactic restructuring to eradicate AI patterns).
4. Eradicate all AI tells:
   - Strip formulaic transition markers ("Furthermore", "In conclusion", "It is important to remember", "Tapestry", "Delve", "Không thể phủ nhận", "Trong thời đại ngày nay", "Đóng vai trò quan trọng", "Tóm lại là", v.v.).
   - Maximize Burstiness: Intermix short punchy sentences (3-7 words) with rhythmic, compound sentences. Avoid uniform 20-word robotic sentences.
   - Inject Perplexity: Use authentic, contextually rich vocabulary, natural idioms, active verbs, and human conversational markers.
   - Preserve 100% of the core factual meaning, logic, and intent of the original text.
   - Maintain the language of the original text (Vietnamese or English).
5. Output ONLY the finalized humanized text. Do not include introductions, explanations, quotes, or markdown wrappers.`;

  if (provider === 'gemini') {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: strength === 'aggressive' ? 0.9 : 0.75,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Gemini API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error('Empty response from Gemini');
    return candidateText.trim();
  }

  if (provider === 'openai') {
    const openaiUrl = 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(openaiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: strength === 'aggressive' ? 0.9 : 0.75
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim();
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
