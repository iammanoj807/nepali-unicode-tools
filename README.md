# nepali-unicode-tools

Convert Nepali text between **Preeti** and **Unicode**, and type Nepali Unicode with **English letters** (Romanized Nepali). Small, dependency-free JavaScript that runs in the browser and in Node.

```js
import { preetiToUnicode, unicodeToPreeti, romanizedToUnicode } from 'nepali-unicode-tools';

preetiToUnicode('g]kfn');          // 'नेपाल'
unicodeToPreeti('नेपाल');          // 'g]kfn'
romanizedToUnicode('mero naam');   // 'मेरो नाम'
```

**Try it without installing anything:**

- [Preeti to Unicode converter](https://hamropedia.com/tools/preeti-to-unicode/): Preeti → Unicode, Unicode → Preeti and Romanized → Preeti
- [Nepali typing](https://hamropedia.com/tools/english-to-nepali/): type Nepali with English letters
- [Nepali keyboard](https://hamropedia.com/tools/nepali-keyboard/): type Unicode with the Preeti layout

These are the same converters used on [Hamropedia](https://hamropedia.com).

## Why

**Preeti** is an old Nepali font that draws Devanagari shapes on top of ordinary English keys, so text typed in it is really `g]kfn` underneath, and breaks wherever the font is missing. **Unicode** stores real Nepali letters and works everywhere. Lots of older documents and forms in Nepal are still in Preeti, so you often need to convert both ways.

Converting Preeti is more than a lookup table:

1. Preeti stores glyphs in **visual order**. The short-i sign (ि, key `l`) is typed *before* its consonant cluster, and the reph (र्, key `{`) *after* its syllable. Unicode stores both in spoken order.
2. Some letters are built from **two keys**: प + `m` = फ, भ + `m` = झ, उ + `m` = ऊ, and a half letter + `f` (the ा stroke) = the full letter.

## Install

```sh
npm install github:iammanoj807/nepali-unicode-tools
```

Or copy the files in `src/` into your project: they have no dependencies.

## API

### `preetiToUnicode(text)`

Converts text typed in the Preeti font to Nepali Unicode.

```js
preetiToUnicode('xfd|f] b]z g]kfn xf] .'); // 'हाम्रो देश नेपाल हो ।'
preetiToUnicode('k|wfgdGqL');              // 'प्रधानमन्त्री'
```

### `unicodeToPreeti(text)`

Converts Nepali Unicode to Preeti keys, for pasting into a document set in the Preeti font. The result looks like English letters until the font is set to Preeti.

```js
unicodeToPreeti('विद्यालय'); // 'ljBfno'
```

### `romanizedToUnicode(text, options?)`

Romanized Nepali to Unicode: write words the way they sound.

| Type | Get |
|---|---|
| `aa` or `A` | आ / ा |
| `ee` or `I` | ई / ी |
| `oo` or `U` | ऊ / ू |
| `T D N Sh` | ट ड ण ष |
| `M` | ं |
| `*` or `~` | ँ |
| `{English}` | keeps English words as typed |

```js
romanizedToUnicode('namaste');                       // 'नमस्ते'
romanizedToUnicode('nepal');                         // 'नेपाल' (smart spelling for common words)
romanizedToUnicode('nepal', { smart: false });       // 'नेपल'
romanizedToUnicode('2083', { digits: false });       // '2083'
```

Options: `smart` (default `true`) fixes common words typed with short vowels, `digits` (default `true`) gives Nepali digits, and `danda` (default `true`) turns a full stop into ।.

### Romanized → Preeti

```js
unicodeToPreeti(romanizedToUnicode('mero naam')); // 'd]/f] gfd'
```

## Tests

```sh
npm test
```

The Preeti tests include pairs from the published test vectors of the [`preeti`](https://www.npmjs.com/package/preeti) npm package (used as test data only), plus round-trip tests on common Nepali words.

## Found a word that converts wrongly?

[Open an issue](https://github.com/iammanoj807/nepali-unicode-tools/issues) with the input and the result you expected.

## Licence

MIT © [Manoj Kumar Thapa](https://hamropedia.com/about-us/)
