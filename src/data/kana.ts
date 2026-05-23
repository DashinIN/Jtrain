import type { KanaCard } from "../types/cards";

const audio = (romaji: string) => ({ source: "web-speech" as const, src: undefined, license: "Browser Web Speech fallback" });

const hBasic = [
  ["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"],
  ["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"],
  ["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"],
  ["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"],
  ["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"],
  ["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"],
  ["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"],
  ["や", "ya"], ["ゆ", "yu"], ["よ", "yo"],
  ["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"],
  ["わ", "wa"], ["を", "wo"], ["ん", "n"],
];

const kBasic = [
  ["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"],
  ["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"],
  ["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"],
  ["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"],
  ["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"],
  ["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"],
  ["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"],
  ["ヤ", "ya"], ["ユ", "yu"], ["ヨ", "yo"],
  ["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"],
  ["ワ", "wa"], ["ヲ", "wo"], ["ン", "n"],
];

const dakuten = [
  ["が", "ga", "hiragana"], ["ぎ", "gi", "hiragana"], ["ぐ", "gu", "hiragana"], ["げ", "ge", "hiragana"], ["ご", "go", "hiragana"],
  ["ざ", "za", "hiragana"], ["じ", "ji", "hiragana"], ["ず", "zu", "hiragana"], ["ぜ", "ze", "hiragana"], ["ぞ", "zo", "hiragana"],
  ["だ", "da", "hiragana"], ["ぢ", "ji", "hiragana"], ["づ", "zu", "hiragana"], ["で", "de", "hiragana"], ["ど", "do", "hiragana"],
  ["ば", "ba", "hiragana"], ["び", "bi", "hiragana"], ["ぶ", "bu", "hiragana"], ["べ", "be", "hiragana"], ["ぼ", "bo", "hiragana"],
  ["ガ", "ga", "katakana"], ["ギ", "gi", "katakana"], ["グ", "gu", "katakana"], ["ゲ", "ge", "katakana"], ["ゴ", "go", "katakana"],
  ["ザ", "za", "katakana"], ["ジ", "ji", "katakana"], ["ズ", "zu", "katakana"], ["ゼ", "ze", "katakana"], ["ゾ", "zo", "katakana"],
  ["ダ", "da", "katakana"], ["ヂ", "ji", "katakana"], ["ヅ", "zu", "katakana"], ["デ", "de", "katakana"], ["ド", "do", "katakana"],
  ["バ", "ba", "katakana"], ["ビ", "bi", "katakana"], ["ブ", "bu", "katakana"], ["ベ", "be", "katakana"], ["ボ", "bo", "katakana"],
] as const;

const handakuten = [
  ["ぱ", "pa", "hiragana"], ["ぴ", "pi", "hiragana"], ["ぷ", "pu", "hiragana"], ["ぺ", "pe", "hiragana"], ["ぽ", "po", "hiragana"],
  ["パ", "pa", "katakana"], ["ピ", "pi", "katakana"], ["プ", "pu", "katakana"], ["ペ", "pe", "katakana"], ["ポ", "po", "katakana"],
] as const;

const yoon = [
  ["きゃ", "kya", "hiragana"], ["きゅ", "kyu", "hiragana"], ["きょ", "kyo", "hiragana"],
  ["しゃ", "sha", "hiragana"], ["しゅ", "shu", "hiragana"], ["しょ", "sho", "hiragana"],
  ["ちゃ", "cha", "hiragana"], ["ちゅ", "chu", "hiragana"], ["ちょ", "cho", "hiragana"],
  ["にゃ", "nya", "hiragana"], ["にゅ", "nyu", "hiragana"], ["にょ", "nyo", "hiragana"],
  ["りゃ", "rya", "hiragana"], ["りゅ", "ryu", "hiragana"], ["りょ", "ryo", "hiragana"],
  ["キャ", "kya", "katakana"], ["シュ", "shu", "katakana"], ["チョ", "cho", "katakana"], ["ニャ", "nya", "katakana"], ["リョ", "ryo", "katakana"],
] as const;

const examples = [
  ["っ", "small tsu", "hiragana", "small-tsu"], ["ッ", "small tsu", "katakana", "small-tsu"],
  ["がっこう", "gakkou", "hiragana", "small-tsu"], ["きって", "kitte", "hiragana", "small-tsu"], ["ベッド", "beddo", "katakana", "small-tsu"],
  ["おう", "ou", "hiragana", "long-vowel"], ["えい", "ei", "hiragana", "long-vowel"], ["おかあさん", "okaasan", "hiragana", "long-vowel"],
  ["コーヒー", "koohii", "katakana", "long-vowel"], ["スーパー", "suupaa", "katakana", "long-vowel"], ["ゲーム", "geemu", "katakana", "long-vowel"],
] as const;

const similar: Record<string, string[]> = {
  "シ": ["ツ"], "ツ": ["シ"], "ソ": ["ン"], "ン": ["ソ"],
  "ぬ": ["め"], "め": ["ぬ"], "ね": ["れ", "わ"], "れ": ["ね", "わ"], "わ": ["ね", "れ"],
  "さ": ["ち"], "ち": ["さ"], "ク": ["ワ", "フ"], "ワ": ["ク", "フ"], "フ": ["ク", "ワ"],
};

function kanaCard(kana: string, romaji: string, script: "hiragana" | "katakana", category: KanaCard["category"]): KanaCard {
  return {
    id: `kana-${script}-${romaji}-${kana}`,
    kana,
    romaji,
    script,
    category,
    similarTo: similar[kana],
    audio: audio(romaji),
  };
}

export const kanaCards: KanaCard[] = [
  ...hBasic.map(([kana, romaji]) => kanaCard(kana, romaji, "hiragana", "basic")),
  ...kBasic.map(([kana, romaji]) => kanaCard(kana, romaji, "katakana", "basic")),
  ...dakuten.map(([kana, romaji, script]) => kanaCard(kana, romaji, script, "dakuten")),
  ...handakuten.map(([kana, romaji, script]) => kanaCard(kana, romaji, script, "handakuten")),
  ...yoon.map(([kana, romaji, script]) => kanaCard(kana, romaji, script, "yoon")),
  ...examples.map(([kana, romaji, script, category]) => kanaCard(kana, romaji, script, category)),
];

export const kanaCategoryNotes = {
  dakuten: "゛ turns ka/sa/ta/ha rows into ga/za/da/ba: か -> が, さ -> ざ, は -> ば.",
  handakuten: "゜ works with the ha row: は -> ぱ, ひ -> ぴ, ふ -> ぷ, へ -> ぺ, ほ -> ぽ.",
  yoon: "Yoon combines kana with small ゃ, ゅ, ょ: きゃ, しゅ, ちょ, にゃ, りょ.",
  "small-tsu": "Small っ / ッ doubles the next consonant: がっこう, きって, ベッド.",
  "long-vowel": "Long vowels use patterns like おう, えい, おかあさん; katakana often uses ー.",
};
