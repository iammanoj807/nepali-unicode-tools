// Preeti <-> Unicode converter for Nepali.
//
// Preeti is a legacy font: it draws Devanagari shapes on top of ordinary ASCII
// keys, so text typed in Preeti is really "g]kfn" underneath. That text breaks
// as soon as the font is missing (on phones, the web, Google Docs...). Unicode
// is the real Nepali script and works everywhere.
//
// Two things make the conversion more than a lookup table:
//   1. Preeti stores glyphs in visual order. The short-i sign (ि, key "l") is
//      typed BEFORE its consonant cluster, and the reph (र्, key "{") is typed
//      AFTER its syllable. Unicode stores both in spoken order.
//   2. Some letters are built from two keys: प + m = फ, भ + m = झ, उ + m = ऊ,
//      a half letter + "f" (the ा stroke) = the full letter, and so on.

// Preeti key -> Unicode, from the Preeti font layout.
export const PREETI_MAP = {
  // lower case
  a: 'ब', b: 'द', c: 'अ', d: 'म', e: 'भ', f: 'ा', g: 'न', h: 'ज', i: 'ष्', j: 'व',
  k: 'प', l: 'ि', m: 'm', n: 'ल', o: 'य', p: 'उ', q: 'त्र', r: 'च', s: 'क', t: 'त',
  u: 'ग', v: 'ख', w: 'ध', x: 'ह', y: 'थ', z: 'श',
  // upper case
  A: 'ब्', B: 'द्य', C: 'ऋ', D: 'म्', E: 'भ्', F: 'ँ', G: 'न्', H: 'ज्', I: 'क्ष्', J: 'व्',
  K: 'प्', L: 'ी', M: 'ः', N: 'ल्', O: 'इ', P: 'ए', Q: 'त्त', R: 'च्', S: 'क्', T: 'त्',
  U: 'ग्', V: 'ख्', W: 'ध्', X: 'ह्', Y: 'थ्', Z: 'श्',
  // digits row
  1: 'ज्ञ', 2: 'द्द', 3: 'घ', 4: 'द्ध', 5: 'छ', 6: 'ट', 7: 'ठ', 8: 'ड', 9: 'ढ', 0: 'ण्',
  '!': '१', '@': '२', '#': '३', $: '४', '%': '५', '^': '६', '&': '७', '*': '८', '(': '९', ')': '०',
  // punctuation keys
  '-': '(', _: ')', '+': 'ं', '=': '.', '[': 'ृ', ']': 'े', '{': '{', '}': 'ै',
  '\\': '्', '|': '्र', ';': 'स', ':': 'स्', "'": 'ु', '"': 'ू', ',': ',', '<': '?',
  '.': '।', '>': 'श्र', '/': 'र', '?': 'रु', '`': 'ञ', '~': 'ञ्',
  // extended (Alt) characters in the Preeti font
  '¥': 'र्‍', '‘': 'ॅ', '«': '्र', 'ª': 'ङ', '¿': 'रू', 'Í': 'ङ्क', 'Ë': 'ङ्ग', 'Î': 'ङ्ख',
  '‹': 'ङ्घ', '°': 'ङ्ढ', '§': 'ट्ट', '¶': 'ठ्ठ', 'Ý': 'ट्ठ', '•': 'ड्ड', 'ç': 'ॐ', 'å': 'द्व',
  'ß': 'द्म', '›': 'द्र', '¢': 'द्घ', 'Å': 'हृ', 'Ì': 'न्न', 'ˆ': 'फ्', '‰': 'झ्', '´': 'झ',
  '¤': 'झ्', '„': 'ध्र', 'Ø': '्य', 'Ù': ';', 'Ú': '’', 'Û': '!', 'Ü': '%', 'æ': '“', 'Æ': '”',
  '˜': 'ऽ', '÷': '/', '×': '×', '±': '+', 'Ö': '=', '…': '‘', '£': 'घ्', '¡': 'ज्ञ्', '©': 'र',
};

const MATRA = 'ािीुूृेैोौ';
const MODS = 'ंँः';
const CONS = '[\\u0915-\\u0939\\u0958-\\u095F]'; // consonants, incl. nukta forms

/** Convert Preeti-encoded text (as typed with the Preeti font) to Unicode. */
export function preetiToUnicode(input) {
  let s = '';
  for (const ch of input) s += PREETI_MAP[ch] ?? ch;

  // 1. "m" changes the nearest letter before it (it may come after signs).
  s = s.replace(new RegExp(`(त्र|त्त|उ|भ|प)((?:[${MATRA}${MODS}]|्र|्)*)m`, 'g'), (all, base, mid) => {
    const to = { 'त्र': 'क्र', 'त्त': 'क्त', 'उ': 'ऊ', 'भ': 'झ', 'प': 'फ' }[base];
    return to + mid;
  });
  s = s.replace(/m/g, ''); // a stray m with nothing to modify

  // 2. A half letter plus the ा stroke is just the full letter.
  s = s.replace(/्ा/g, '');

  // 2b. A vowel sign typed before a joining halant (e.g. े then ्र) goes after it.
  //     A vowel sign can never be followed by ् in real Unicode, so this is safe.
  s = s.replace(new RegExp(`([${MATRA}${MODS}]+)(्${CONS})`, 'g'), '$2$1');

  // 3. इ + reph mark draws ई.
  s = s.replace(/इ\{/g, 'ई');

  // 4. Short i: move ि after the whole consonant cluster that follows it.
  s = s.replace(new RegExp(`ि((?:${CONS}्)*${CONS}(?:्र|्य)?)`, 'g'), '$1ि');

  // 5. Reph: "{" comes after its syllable; put र् before that syllable's cluster.
  s = placeReph(s);

  // 6. Nasal signs typed before a vowel sign go after it.
  s = s.replace(new RegExp(`([ंँ])([${MATRA}ः]+)`, 'g'), '$2$1');

  // 7. Combine split vowel signs.
  s = s
    .replace(/ेा/g, 'ो').replace(/ैा/g, 'ौ')
    .replace(/ाे/g, 'ो').replace(/ाै/g, 'ौ')
    .replace(/अो/g, 'ओ').replace(/अौ/g, 'औ').replace(/अा/g, 'आ').replace(/एे/g, 'ऐ')
    .replace(/([ािीुूृेैोौंँ])\1/g, '$1');

  return s;
}

function isCons(c) {
  return c !== undefined && /[\u0915-\u0939\u0958-\u095F]/.test(c);
}

function placeReph(s) {
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== '{') continue;
    let j = i - 1;
    while (j >= 0 && (MATRA.includes(chars[j]) || MODS.includes(chars[j]))) j--;
    if (j < 0 || !isCons(chars[j])) { chars[i] = 'र्'; continue; }
    // include "C्" pairs before the main consonant, and a following ्र / ्य
    let start = j;
    while (start >= 2 && chars[start - 1] === '्' && isCons(chars[start - 2])) start -= 2;
    chars.splice(i, 1);
    chars.splice(start, 0, 'र', '्');
    i++;
  }
  return chars.join('');
}

// ---------------------------------------------------------------------------
// Unicode -> Preeti

const FULL = {
  'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª', 'च': 'r', 'छ': '5', 'ज': 'h', 'झ': 'em',
  'ञ': '`', 'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0f', 'त': 't', 'थ': 'y', 'द': 'b',
  'ध': 'w', 'न': 'g', 'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd', 'य': 'o', 'र': '/',
  'ल': 'n', 'व': 'j', 'श': 'z', 'ष': 'if', 'स': ';', 'ह': 'x',
};
const HALF = {
  'क': 'S', 'ख': 'V', 'ग': 'U', 'घ': '£', 'च': 'R', 'ज': 'H', 'झ': '‰', 'ञ': '~', 'ण': '0',
  'त': 'T', 'थ': 'Y', 'ध': 'W', 'न': 'G', 'प': 'K', 'फ': 'ˆ', 'ब': 'A', 'भ': 'E', 'म': 'D',
  'ल': 'N', 'व': 'J', 'श': 'Z', 'ष': 'i', 'स': ':', 'ह': 'X',
};
// Ligatures with their own key. Checked longest first.
const LIGATURES = [
  ['क्ष्', 'I'], ['क्ष', 'If'], ['ज्ञ्', '¡'], ['ज्ञ', '1'], ['श्र', '>'],
  ['त्र', 'q'], ['त्त', 'Q'], ['क्र', 'qm'], ['क्त', 'Qm'],
  ['द्ध', '4'], ['द्द', '2'], ['द्य', 'B'], ['द्व', 'å'], ['द्म', 'ß'], ['द्र', '›'], ['द्घ', '¢'],
  ['ट्ट', '§'], ['ठ्ठ', '¶'], ['ट्ठ', 'Ý'], ['ड्ड', '•'], ['न्न', 'Ì'],
  ['ङ्क', 'Í'], ['ङ्ग', 'Ë'], ['ङ्ख', 'Î'], ['ङ्घ', '‹'],
];
const VOWEL_KEYS = {
  'अ': 'c', 'आ': 'cf', 'इ': 'O', 'ई': 'O{', 'उ': 'p', 'ऊ': 'pm', 'ऋ': 'C', 'ए': 'P', 'ऐ': 'P]',
  'ओ': 'cf]', 'औ': 'cf}',
};
const MATRA_KEYS = {
  'ा': 'f', 'ी': 'L', 'ु': "'", 'ू': '"', 'ृ': '[', 'े': ']', 'ै': '}', 'ो': 'f]', 'ौ': 'f}',
};
const OTHER_KEYS = {
  'ं': '+', 'ँ': 'F', 'ः': 'M', '्': '\\', '।': '.', '॥': '..', 'ॐ': 'ç', 'ऽ': '˜',
  '०': ')', '१': '!', '२': '@', '३': '#', '४': '$', '५': '%', '६': '^', '७': '&', '८': '*', '९': '(',
  '(': '-', ')': '_', '.': '=', '?': '<', '/': '÷', '+': '±', '=': 'Ö', '!': 'Û', '%': 'Ü',
  ';': 'Ù', '’': 'Ú', '“': 'æ', '”': 'Æ', '‘': '…',
};

/** Convert a run of consonants joined by halants, e.g. "स्त", to Preeti keys. */
function consonantsToPreeti(cluster) {
  let out = '';
  let i = 0;
  while (i < cluster.length) {
    let done = false;
    for (const [u, p] of LIGATURES) {
      if (cluster.startsWith(u, i)) {
        // A ligature that is not last needs its half form.
        const rest = cluster.slice(i + u.length);
        if (rest.startsWith('्') && !u.endsWith('्')) {
          out += p.endsWith('f') ? p.slice(0, -1) : p + '\\';
          i += u.length + 1;
        } else {
          out += p;
          i += u.length;
        }
        done = true;
        break;
      }
    }
    if (done) continue;
    const c = cluster[i];
    const halfNext = cluster[i + 1] === '्';
    if (halfNext && cluster[i + 2] === 'र' && i + 3 === cluster.length) {
      // C + ्र at the end of the cluster = rakar
      out += (FULL[c] ?? c);
      if (out.endsWith('km')) out = out.slice(0, -2) + 'k|m';
      else out += '|';
      i += 3;
      continue;
    }
    if (halfNext && i + 2 < cluster.length) {
      out += HALF[c] ?? (FULL[c] ?? c) + '\\';
      i += 2;
    } else if (halfNext) {
      out += HALF[c] ?? (FULL[c] ?? c) + '\\';
      i += 2;
    } else {
      out += FULL[c] ?? c;
      i += 1;
    }
  }
  return out;
}

/** Convert Unicode Nepali text to Preeti keys (to paste into a Preeti document). */
export function unicodeToPreeti(input) {
  const s = input.normalize('NFC');
  let out = '';
  // syllable = [र्](C्)*C[्र][matra][mods] | vowel[mods] | anything else
  const re = new RegExp(
    `(र्(?=${CONS}))?((?:${CONS}्)*${CONS}(?:्(?![\\u0915-\\u0939]))?)([${MATRA}]?)([${MODS}]*)|([अ-औ])([${MODS}]*)|([\\s\\S])`,
    'gu',
  );
  for (const m of s.matchAll(re)) {
    const [, reph, cluster, matra, mods, vowel, vmods, other] = m;
    if (cluster) {
      const special = cluster === 'र' && (matra === 'ु' || matra === 'ू');
      if (special) { // रु / रू have their own keys
        out += (matra === 'ु' ? '?' : '¿') + (reph ? '{' : '') + [...mods].map((c) => OTHER_KEYS[c]).join('');
        continue;
      }
      let body = consonantsToPreeti(cluster.endsWith('्') ? cluster.slice(0, -1) : cluster);
      if (cluster.endsWith('्')) {
        const last = cluster.slice(-2, -1);
        body = body.slice(0, body.length - (FULL[last] ?? last).length) + (HALF[last] ?? (FULL[last] ?? last) + '\\');
      }
      let piece = '';
      if (matra === 'ि') piece = 'l' + body;
      else piece = body + (matra ? MATRA_KEYS[matra] : '');
      if (reph) piece += '{';
      piece += [...mods].map((c) => OTHER_KEYS[c]).join('');
      out += piece;
    } else if (vowel) {
      out += (VOWEL_KEYS[vowel] ?? vowel) + [...vmods].map((c) => OTHER_KEYS[c]).join('');
    } else {
      out += OTHER_KEYS[other] ?? other;
    }
  }
  return out;
}
