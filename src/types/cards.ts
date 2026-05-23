export type AudioSource = "wikimedia" | "tatoeba" | "jitendex" | "custom" | "web-speech";

export interface AudioMeta {
  src?: string;
  source: AudioSource;
  license?: string;
  attribution?: string;
  author?: string;
  url?: string;
}

export interface KanaCard {
  id: string;
  kana: string;
  romaji: string;
  script: "hiragana" | "katakana";
  category: "basic" | "dakuten" | "handakuten" | "yoon" | "small-tsu" | "long-vowel";
  similarTo?: string[];
  audio?: AudioMeta;
}

export interface WordCard {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: "N5" | "N4";
  tags: string[];
  isIrregular?: boolean;
  exampleSentence?: string;
  exampleTranslation?: string;
  audio?: AudioMeta;
}

export interface SentenceToken {
  surface: string;
  reading?: string;
  meaning: string;
  pos?: string;
}

export interface SentenceCard {
  id: string;
  japanese: string;
  furigana?: string;
  translation: string;
  level: "N5" | "N4";
  tokens: SentenceToken[];
  grammarPoints: string[];
  audio?: AudioMeta;
}

export interface ParticleCard {
  id: string;
  sentence: string;
  blankSentence: string;
  correctParticle: string;
  options: string[];
  translation: string;
  explanation: string;
  audio?: AudioMeta;
}

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiSentenceExample {
  japanese: string;
  translation: string;
  translations?: Partial<Record<"en" | "ru" | "ja" | "es" | "de" | "fr" | "zh" | "ko" | "pt", string>>;
  source: "tatoeba" | "generated";
  license: string;
  attribution: string;
  url?: string;
}

export interface KanjiCard {
  id: string;
  kanji: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  level: "N5" | "N4";
  order: number;
  grade?: number;
  jlpt?: number;
  frequencyRank?: number;
  strokeCount: number;
  components: string[];
  builds: string[];
  etymology: string;
  mnemonic: string;
  examples: KanjiExample[];
  exampleSentence?: KanjiSentenceExample;
  audio?: AudioMeta;
}

export type CardType = "kana" | "kanji" | "word" | "sentence" | "particle";

export type StudyCard =
  | { type: "kana"; card: KanaCard }
  | { type: "kanji"; card: KanjiCard }
  | { type: "word"; card: WordCard }
  | { type: "sentence"; card: SentenceCard }
  | { type: "particle"; card: ParticleCard };
