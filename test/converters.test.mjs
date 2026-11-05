import { test } from 'node:test';
import assert from 'node:assert/strict';
import { preetiToUnicode, unicodeToPreeti, romanizedToUnicode } from '../src/index.js';

// Preeti -> Unicode pairs. Most come from the published test vectors of the
// "preeti" npm package (used here only as test data), plus a few of our own.
const PREETI = [
  ['g]kfn', 'नेपाल'], ['g]kfnL', 'नेपाली'], ['rGb', 'चन्द'], ['lxdfn', 'हिमाल'],
  ['/fli6«o', 'राष्ट्रिय'], ['ljz]if0f', 'विशेषण'], ['u0f]z', 'गणेश'], ['kfl0f', 'पाणि'],
  ['ug{', 'गर्न'], ['ug{]', 'गर्ने'], ['ug]{', 'गर्ने'], ['rGb|f]bo', 'चन्द्रोदय'],
  ['O{Zj/', 'ईश्वर'], ['k|mfO{', 'फ्राई'], [':ofk|m\'a]zL', 'स्याफ्रुबेशी'],
  ['cfkm\\gf]', 'आफ्नो'], ['cfk\\mgf}', 'आफ्नौ'], ['eQm', 'भक्त'], ['em/gf', 'झरना'],
  ['s|\'/', 'क्रुर'], ['qm\'/', 'क्रुर'], ['q\'m/', 'क्रुर'], ['k|ltlqmof', 'प्रतिक्रिया'],
  ['hfpm', 'जाऊ'], ['hfpFm', 'जाऊँ'], ['e]mNg\'', 'झेल्नु'], ['em]Ng\'', 'झेल्नु'],
  ['emfs|L', 'झाक्री'], ['kf}jf', 'पौवा'], ['If]qkf6L', 'क्षेत्रपाटी'], ['iff]8zL', 'षोडशी'],
  ['cf]vtL', 'ओखती'], ['P]gf', 'ऐना'], ['hfcf}+', 'जाऔं'], ['hfcf+}', 'जाऔं'],
  ['3/d+}', 'घरमैं'], ['-s_', '(क)'], ['!@#$%^&*()', '१२३४५६७८९०'], ['k¥of]', 'पर्‍यो'],
  ['x]Yof{]', 'हेर्थ्यो'], ['x]Yof]{', 'हेर्थ्यो'], ['d2t', 'मद्दत'], ['Clif', 'ऋषि'],
  ['6]«S;', 'ट्रेक्स'],
  // our own
  ['xfd|f] b]z g]kfn xf] .', 'हाम्रो देश नेपाल हो ।'], ['sf7df8f}+', 'काठमाडौं'],
  ['ljBfno', 'विद्यालय'], ['k|wfgdGqL', 'प्रधानमन्त्री'], [';/sf/', 'सरकार'],
];

test('Preeti -> Unicode matches known pairs', () => {
  for (const [p, u] of PREETI) assert.equal(preetiToUnicode(p), u, `preeti "${p}"`);
});

const WORDS = [
  'नेपाल', 'नेपाली', 'हिमाल', 'राष्ट्रिय', 'विशेषण', 'गणेश', 'गर्ने', 'गर्न', 'चन्द्रोदय', 'ईश्वर',
  'आफ्नो', 'भक्त', 'झरना', 'प्रतिक्रिया', 'जाऊँ', 'झेल्नु', 'पौवा', 'क्षेत्रपाटी', 'षोडशी', 'ओखती',
  'ऐना', 'जाऔं', 'घरमैं', 'हेर्थ्यो', 'मद्दत', 'ऋषि', 'काठमाडौं', 'विद्यालय', 'प्रधानमन्त्री',
  'सरकार', 'धन्यवाद', 'नमस्ते', 'विश्वविद्यालय', 'कृष्ण', 'ज्ञान', 'श्रीमान्', 'पूर्व', 'कार्यक्रम',
  'स्वास्थ्य', 'अर्थतन्त्र', 'रुख', 'रूप', 'संविधान', 'चुनाव', 'उम्मेदवार', 'फाइल', 'छोरी', 'दशैं',
  'तिहार', 'बिहीबार', 'शिक्षा', 'अङ्ग्रेजी', 'त्यसैले', 'सम्झना', 'मध्य', 'ठूलो', 'डढेलो', 'ढुङ्गा',
];

test('Unicode -> Preeti -> Unicode round-trips', () => {
  for (const w of WORDS) {
    const p = unicodeToPreeti(w);
    assert.equal(preetiToUnicode(p), w, `"${w}" -> "${p}"`);
  }
});

test('Unicode -> Preeti gives the keys a Preeti typist uses', () => {
  assert.equal(unicodeToPreeti('नेपाल'), 'g]kfn');
  assert.equal(unicodeToPreeti('हिमाल'), 'lxdfn');
  assert.equal(unicodeToPreeti('गर्ने'), 'ug]{');
  assert.equal(unicodeToPreeti('१२३'), '!@#');
});

test('Romanized -> Preeti (used by the converter tool)', () => {
  assert.equal(unicodeToPreeti(romanizedToUnicode('nepal')), 'g]kfn');
  assert.equal(unicodeToPreeti(romanizedToUnicode('mero naam')), 'd]/f] gfd');
  assert.equal(preetiToUnicode(unicodeToPreeti(romanizedToUnicode('dhanyabad'))), 'धन्यवाद');
});

test('Romanized -> Unicode', () => {
  const cases = [
    ['namaste', 'नमस्ते'], ['mero naam', 'मेरो नाम'], ['nepal', 'नेपाल'], ['kathmandu', 'काठमाडौं'],
    ['hamro desh nepal ho.', 'हाम्रो देश नेपाल हो।'], ['dhanyabad', 'धन्यवाद'], ['kRShNa', 'कृष्ण'],
    ['shree', 'श्री'], ['prashna', 'प्रश्न'], ['gyaan', 'ज्ञान'], ['sa*ga', 'सँग'], ['saMgIt', 'संगीत'],
    ['garchhan\\', 'गर्छन्'], ['2083', '२०८३'], ['3.5', '३.५'], ['{Facebook} chalaaunus', 'Facebook चलाउनुस'],
    ['aama', 'आमा'], ['bidyaarthI', 'बिद्यार्थी'], ['kasto xa', 'कस्तो छ'], ['OM', 'ॐ'],
    ['tapaai*lai', 'तपाइँलाई'], ['ramro', 'राम्रो'], ['malai', 'मलाई'], ['uslai', 'उसलाई'], ['TraafIk', 'ट्राफीक'],
    ['Mero naam Hari ho.', 'मेरो नाम हरि हो।'], ['Ram', 'रम'], ['Aama', 'आमा'], ['Nepal', 'नेपाल'], ['Sita', 'सित'], ['Topi', 'टोपि'],
    ['TikaT', 'टिकट'], ['nepalma', 'नेपालमा'], ['gharko', 'घरको'], ['Nepalko', 'नेपालको'], ['kathmanduma', 'काठमाडौंमा'], ['sharmaa', 'शर्मा'], ['dharma', 'धर्म'], ['bhaaShaa', 'भाषा'], ['ma bholi kaaThamaaDauM jaanchhu.', 'म भोलि काठमाडौं जान्छु।'],
  ];
  for (const [r, u] of cases) assert.equal(romanizedToUnicode(r), u, `romanized "${r}"`);
  assert.equal(romanizedToUnicode('nepal', { smart: false }), 'नेपल');
  assert.equal(romanizedToUnicode('2083', { digits: false }), '2083');
});
