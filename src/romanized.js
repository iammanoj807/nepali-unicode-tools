// Romanized Nepali -> Nepali Unicode (Devanagari) transliteration.
//
// Type Nepali the way it sounds in English letters ("mero naam" -> "मेरो नाम").
// The scheme follows the conventions most Nepali typists already know:
//   aa / A = ा      ee / ii / I = ी      oo / uu / U = ू
//   T D N Sh = ट ड ण ष      M = ं (anusvara)      * or ~ = ँ (chandrabindu)
//   x = छ (as in "xa" = छ)  \ = force a halanta (्) at the end of a word
//   {braces} keep English text exactly as typed: "{Facebook}" -> "Facebook"
//
// A consonant followed by another consonant joins into a conjunct
// ("namaste" -> "नमस्ते"). A consonant at the end of a word keeps its
// inherent "a", so "naam" gives "नाम", not "नाम्".

const HALANT = '्';

// Longest keys must be tried first; the tokenizer sorts them.
const CONSONANTS = {
  ksh: 'क्ष', kSh: 'क्ष', chh: 'छ', Chh: 'छ', gy: 'ज्ञ', jny: 'ज्ञ', tr: 'त्र',
  kh: 'ख', gh: 'घ', ng: 'ङ', ch: 'च', jh: 'झ', ny: 'ञ', NY: 'ञ',
  Th: 'ठ', Dh: 'ढ', th: 'थ', dh: 'ध', ph: 'फ', bh: 'भ', sh: 'श', Sh: 'ष',
  k: 'क', g: 'ग', c: 'च', x: 'छ', j: 'ज', T: 'ट', D: 'ड', N: 'ण',
  t: 'त', d: 'द', n: 'न', p: 'प', f: 'फ', b: 'ब', m: 'म', y: 'य',
  r: 'र', l: 'ल', w: 'व', v: 'व', W: 'व', V: 'व', s: 'स', S: 'ष', h: 'ह',
  q: 'क', Q: 'क', z: 'ज', Z: 'ज', K: 'क', G: 'ग', C: 'च', J: 'ज',
  P: 'प', F: 'फ', B: 'ब', Y: 'य', L: 'ल', X: 'छ',
};

// [independent vowel, dependent sign (matra)]
const VOWELS = {
  aa: ['आ', 'ा'], A: ['आ', 'ा'],
  ai: ['ऐ', 'ै'], au: ['औ', 'ौ'], ou: ['औ', 'ौ'],
  ee: ['ई', 'ी'], ii: ['ई', 'ी'], I: ['ई', 'ी'],
  oo: ['ऊ', 'ू'], uu: ['ऊ', 'ू'], U: ['ऊ', 'ू'],
  rri: ['ऋ', 'ृ'], R: ['ऋ', 'ृ'],
  a: ['अ', ''], i: ['इ', 'ि'], u: ['उ', 'ु'], e: ['ए', 'े'], E: ['ए', 'े'], o: ['ओ', 'ो'], O: ['ओ', 'ो'],
};

const SIGNS = { M: 'ं', '*': 'ँ', '~': 'ँ', H: 'ः' };

const DIGITS = { 0: '०', 1: '१', 2: '२', 3: '३', 4: '४', 5: '५', 6: '६', 7: '७', 8: '८', 9: '९' };

// Common words people type without marking the long vowel. Applied only to a
// whole word, only when "smart" is on, and always overridable with braces.
export const SMART_WORDS = {
  nepal: 'नेपाल', nepali: 'नेपाली', kathmandu: 'काठमाडौं', pokhara: 'पोखरा',
  lalitpur: 'ललितपुर', bhaktapur: 'भक्तपुर', biratnagar: 'विराटनगर', birgunj: 'वीरगंज',
  janakpur: 'जनकपुर', dharan: 'धरान', butwal: 'बुटवल', chitwan: 'चितवन',
  bhai: 'भाइ', didi: 'दिदी', bahini: 'बहिनी', dai: 'दाइ', aama: 'आमा', baba: 'बाबा', buwa: 'बुवा',
  dhanyabad: 'धन्यवाद', dhanyawad: 'धन्यवाद', namaskar: 'नमस्कार', namaste: 'नमस्ते',
  sanchai: 'सन्चै', khana: 'खाना', paani: 'पानी', ghar: 'घर', kaam: 'काम',
  ma: 'म', timi: 'तिमी', tapai: 'तपाईं', tapain: 'तपाईं', hami: 'हामी', uni: 'उनी',
  mero: 'मेरो', timro: 'तिम्रो', hamro: 'हाम्रो', tapaiko: 'तपाईंको',
  ho: 'हो', hoina: 'होइन', chha: 'छ', cha: 'छ', xa: 'छ', chhaina: 'छैन', chaina: 'छैन', xaina: 'छैन',
  ke: 'के', kina: 'किन', kasari: 'कसरी', kaha: 'कहाँ', kahile: 'कहिले',
  ramro: 'राम्रो', naramro: 'नराम्रो', thik: 'ठिक', sathi: 'साथी', maya: 'माया',
  bidyalaya: 'विद्यालय', bishwobidyalaya: 'विश्वविद्यालय', sarkar: 'सरकार', desh: 'देश',
  shubha: 'शुभ', badhai: 'बधाई', janmadin: 'जन्मदिन', dashain: 'दशैं', tihar: 'तिहार',
  hajur: 'हजुर', huncha: 'हुन्छ', hunchha: 'हुन्छ', garnus: 'गर्नुस्', aunus: 'आउनुस्',
};
// Postpositions that get attached to a word ("nepalma"). Longest first.
const POSTPOSITIONS = [
  ['dekhi', 'देखि'], ['baata', 'बाट'], ['bata', 'बाट'], ['sanga', 'सँग'], ['haru', 'हरू'],
  ['laai', 'लाई'], ['lai', 'लाई'], ['maa', 'मा'], ['kaa', 'का'], ['ko', 'को'], ['ki', 'की'],
  ['ka', 'का'], ['ma', 'मा'], ['le', 'ले'],
];

// Ambiguous words are deliberately left out: "pani" (पनि "also" / पानी "water")
// and "kam" (कम "less" / काम "work") follow the plain rules instead.

function buildTable() {
  const entries = [];
  for (const [k, v] of Object.entries(CONSONANTS)) entries.push([k, 'C', v]);
  for (const [k, v] of Object.entries(VOWELS)) entries.push([k, 'V', v]);
  for (const [k, v] of Object.entries(SIGNS)) entries.push([k, 'S', v]);
  entries.sort((a, b) => b[0].length - a[0].length);
  return entries;
}
const TABLE = buildTable();
const MAX_KEY = Math.max(...TABLE.map((e) => e[0].length));

function matchAt(text, i) {
  for (let len = Math.min(MAX_KEY, text.length - i); len > 0; len--) {
    const piece = text.slice(i, i + len);
    for (const e of TABLE) if (e[0] === piece) return e;
  }
  return null;
}

/** Transliterate one run of Latin letters/signs (no spaces) into Devanagari. */
function transliterateWord(word, opts) {
  // A capitalised word ("Hari", "Mero", "Sita") is a name or the start of a
  // sentence, not a request for ः / ं / ण / ष. Read those first letters as
  // ordinary consonants. T and D keep their meaning (ट ड), since many Nepali
  // words do start with them.
  const isTitle = /^[A-Z][a-z\\*~]*$/.test(word);
  if (isTitle) {
    const f = word[0];
    const n = word[1] || '';
    if ('HMNS'.includes(f) || (f === 'R' && /[aeiou]/.test(n)) || (f === 'A' && n === 'a')) {
      word = f.toLowerCase() + word.slice(1);
    }
  }
  if (opts.smart) {
    const lower = word.toLowerCase();
    const hit = SMART_WORDS[lower];
    if (hit && (word === lower || isTitle)) return hit;
    // A known word with a postposition stuck on: nepalma -> नेपालमा, gharko -> घरको.
    // Only for stems in the dictionary, so words like "sharma" are left alone.
    for (const [suf, ne] of POSTPOSITIONS) {
      if (lower.length > suf.length && lower.endsWith(suf) && SMART_WORDS[lower.slice(0, -suf.length)]) {
        return SMART_WORDS[lower.slice(0, -suf.length)] + ne;
      }
    }
    // The postposition "lai" (लाई) is nearly always typed short: malai, tapailai.
    if (/lai$/.test(word)) {
      const stem = word.slice(0, -3);
      return (stem ? transliterateWord(stem, opts) : '') + 'लाई';
    }
  }
  let out = '';
  let pendingConsonant = false; // last output was a bare consonant (inherent a)
  let i = 0;
  while (i < word.length) {
    const ch = word[i];
    if (ch === '\\') {
      if (pendingConsonant) out += HALANT;
      pendingConsonant = false;
      i++;
      continue;
    }
    if (ch === 'O' && word[i + 1] === 'M') { // OM -> ॐ
      out += 'ॐ';
      pendingConsonant = false;
      i += 2;
      continue;
    }
    const e = matchAt(word, i);
    if (!e) {
      out += ch;
      pendingConsonant = false;
      i++;
      continue;
    }
    const [key, type, val] = e;
    if (type === 'C') {
      if (pendingConsonant) out += HALANT;
      out += val;
      pendingConsonant = true;
    } else if (type === 'V') {
      out += pendingConsonant ? val[1] : val[0];
      pendingConsonant = false;
    } else {
      out += val;
      pendingConsonant = false;
    }
    i += key.length;
  }
  return out;
}

const WORD_CHAR = /[A-Za-z\\*~]/;

/**
 * Convert romanized Nepali text to Unicode.
 * @param {string} text
 * @param {{ smart?: boolean, digits?: boolean, danda?: boolean }} [options]
 *   smart  - fix common words typed without long vowels (default true)
 *   digits - 0-9 -> ०-९ (default true)
 *   danda  - full stop "." -> "।" (default true; a dot between digits stays)
 */
export function romanizedToUnicode(text, options = {}) {
  const opts = { smart: true, digits: true, danda: true, ...options };
  let out = '';
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') { // literal passthrough
      const end = text.indexOf('}', i + 1);
      if (end === -1) { out += text.slice(i + 1); break; }
      out += text.slice(i + 1, end);
      i = end + 1;
      continue;
    }
    if (WORD_CHAR.test(ch)) {
      let j = i;
      while (j < text.length && WORD_CHAR.test(text[j])) j++;
      out += transliterateWord(text.slice(i, j), opts);
      i = j;
      continue;
    }
    if (opts.digits && DIGITS[ch] !== undefined) { out += DIGITS[ch]; i++; continue; }
    if (ch === '|') {
      if (text[i + 1] === '|') { out += '॥'; i += 2; } else { out += '।'; i++; }
      continue;
    }
    if (ch === '.' && opts.danda) {
      const prevDigit = /[0-9०-९]/.test(text[i - 1] || '');
      const nextDigit = /[0-9]/.test(text[i + 1] || '');
      if (text[i + 1] === '.') { out += '.'; i += 2; continue; } // ".." -> literal dot
      out += prevDigit && nextDigit ? '.' : '।';
      i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

/** The cheat-sheet rows shown on the tool page: [type this, get this]. */
export const CHEAT_SHEET = {
  vowels: [['a', 'अ'], ['aa / A', 'आ ा'], ['i', 'इ ि'], ['ee / I', 'ई ी'], ['u', 'उ ु'], ['oo / U', 'ऊ ू'], ['e', 'ए े'], ['ai', 'ऐ ै'], ['o', 'ओ ो'], ['au', 'औ ौ'], ['R / rri', 'ऋ ृ']],
  consonants: [['k kh g gh ng', 'क ख ग घ ङ'], ['ch chh j jh ny', 'च छ ज झ ञ'], ['T Th D Dh N', 'ट ठ ड ढ ण'], ['t th d dh n', 'त थ द ध न'], ['p ph/f b bh m', 'प फ ब भ म'], ['y r l w/v', 'य र ल व'], ['sh Sh s h', 'श ष स ह'], ['ksh tr gy', 'क्ष त्र ज्ञ'], ['x', 'छ']],
  signs: [['M', 'ं (anusvara)'], ['* or ~', 'ँ (chandrabindu)'], ['H', 'ः (visarga)'], ['\\', '् (halanta)'], ['.', '। (purna biram)'], ['OM', 'ॐ'], ['{text}', 'keeps English as typed']],
};

/** What a single key types in Romanized mode, for the on-screen keyboard labels. */
export function romanKeyLabel(ch) {
  if (VOWELS[ch]) return VOWELS[ch][0];
  if (CONSONANTS[ch]) return CONSONANTS[ch];
  if (SIGNS[ch]) return '◌' + SIGNS[ch];
  if (DIGITS[ch] !== undefined) return DIGITS[ch];
  if (ch === '\\') return '◌्';
  if (ch === '.') return '।';
  return ch;
}
