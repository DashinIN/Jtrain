import type { ParticleCard } from "../types/cards";

const webSpeech = { source: "web-speech" as const, license: "Browser Web Speech fallback" };

const rows = [
  ["私は学生です。", "私___学生です。", "は", "I am a student.", "は = topic marker."],
  ["水を飲みます。", "水___飲みます。", "を", "I drink water.", "を = object marker."],
  ["学校に行きます。", "学校___行きます。", "に", "I go to school.", "に = direction/time/target."],
  ["公園で遊びます。", "公園___遊びます。", "で", "I play at the park.", "で = place of action/tool."],
  ["猫が好きです。", "猫___好きです。", "が", "I like cats.", "が = subject/emphasis marker."],
  ["これは私の本です。", "これは私___本です。", "の", "This is my book.", "の = possession/description."],
  ["犬と歩きます。", "犬___歩きます。", "と", "I walk with a dog.", "と = and/with/quote."],
  ["私も行きます。", "私___行きます。", "も", "I will also go.", "も = also."],
  ["駅へ行きます。", "駅___行きます。", "へ", "I go toward the station.", "へ = direction."],
  ["家から来ました。", "家___来ました。", "から", "I came from home.", "から = from."],
  ["三時まで勉強します。", "三時___勉強します。", "まで", "I study until three.", "まで = until/to."],
  ["朝に本を読みます。", "朝___本を読みます。", "に", "I read a book in the morning.", "に = time marker."],
  ["箸で食べます。", "箸___食べます。", "で", "I eat with chopsticks.", "で = tool/means."],
  ["先生に聞きます。", "先生___聞きます。", "に", "I ask the teacher.", "に = target."],
  ["友だちと話します。", "友だち___話します。", "と", "I speak with a friend.", "と = with."],
  ["日本語が分かります。", "日本語___分かります。", "が", "I understand Japanese.", "が = subject for ability/understanding."],
  ["本は高いです。", "本___高いです。", "は", "The book is expensive.", "は = topic marker."],
  ["コーヒーを買います。", "コーヒー___買います。", "を", "I buy coffee.", "を = object marker."],
];

export const particleCards: ParticleCard[] = rows.map(([sentence, blankSentence, correctParticle, translation, explanation], index) => ({
  id: `particle-${String(index + 1).padStart(3, "0")}`,
  sentence,
  blankSentence,
  correctParticle,
  options: ["は", "が", "を", "に", "で", "の", "と", "も", "へ", "から", "まで"]
    .filter((item, itemIndex, array) => item === correctParticle || itemIndex % 3 === index % 3)
    .slice(0, 4),
  translation,
  explanation,
  audio: webSpeech,
}));
