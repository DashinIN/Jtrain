# JTrain product concept

JTrain is an adaptive web trainer for Japanese writing and pronunciation. The core learning loop is multimodal:

```text
see -> hear -> recognize -> write -> pronounce -> review
```

The application should not behave like a static kana table or a simple four-choice quiz. It should gradually unlock hiragana, katakana, romaji bridges, basic kanji, words, and short sentences, then keep mixing new material with reviews and weak spots.

## Learning modes

The app should support separate study areas:

- Hiragana: the base Japanese syllabary.
- Katakana: kana for loanwords, names, emphasis, and foreign sound patterns.
- Romaji: a starter bridge from Latin spelling to Japanese sounds.
- Kanji: characters with readings, meanings, examples, components, and stroke guidance.
- Words, sentences, and particles: context-based reinforcement after symbol recognition.

Training directions should be flexible:

- Hiragana -> romaji: show `か`, answer `ka`.
- Romaji -> hiragana: show `shi`, answer `し`.
- Katakana -> romaji: show `ツ`, answer `tsu`.
- Hiragana <-> katakana: show `あ`, find `ア`, and reverse.
- Sound -> symbol: play `ne`, choose `ね` or `ネ`.
- Symbol -> pronunciation: show `り`, user says `ri`.
- Kanji -> meaning: show `水`, answer `water`.
- Meaning -> kanji: show `fire`, answer `火`.
- Kanji -> reading: show `山`, answer `やま` or `san`.
- Word -> reading: show `日本`, answer `にほん`.

## Progress model

Progress must be per symbol/card, not just "20 characters completed".

Each card can be derived into one of these user-facing states:

- New: first introduction.
- Learning: already seen, still unstable.
- Reinforcing: mostly correct, still needs review.
- Learned: stable recognition over repeated reviews.
- Weak: frequent mistakes, slow answers, or confusion with similar cards.

The trainer should automatically prioritize visually or phonetically confusable groups, for example:

- Hiragana: `ぬ`, `め`, `ね`, `れ`, `わ`.
- Katakana: `シ`, `ツ`, `ソ`, `ン`.
- Kana sounds: `し`, `ち`, `つ`.

Useful progress summaries:

- Hiragana: learned out of 46 base signs.
- Katakana: learned out of 46 base signs.
- Dakuten / handakuten progress.
- Yoon combinations progress.
- Kanji N5 and N4 progress.
- Strong cards, weak cards, and cards due today.

Implementation note: the current app already stores SRS state in local storage through `useSrsProgress`. Weak cards are represented by the SRS state and surfaced in weak-spot screens.

## New-card introduction

Opening a new symbol should show a compact learning card:

- Large symbol.
- Reading.
- Script/type.
- Audio playback.
- Slow playback when possible.
- Example word.
- Similar or corresponding symbol.

Example:

```text
か
Reading: ka
Type: hiragana
Example: かさ - kasa - umbrella
Similar: カ - katakana ka
```

Audio priorities:

- Play automatically on first introduction when browser policy allows it.
- Offer replay.
- Support slower speech.
- Use local audio files when present.
- Fall back to Web Speech when local audio is unavailable.
- Compare close sounds where useful.

## Exercise types

The exercise system should be modular so the same content can be trained in different ways.

1. Multiple choice: show `ね`, choose `ne`, `re`, `wa`, or `nu`.
2. Keyboard input: show `ふ`, type `fu`.
3. Reverse input: show `ra`, choose or type `ら` / `ラ`.
4. Audio prompt: play `mo`, choose `ま`, `も`, `む`, or `め`.
5. Pronunciation: show `り`, user says `ri`.
6. Drawing: show `ka`, user draws `か`.
7. Kanji drawing: check rough shape first, then stroke order, direction, proportions, and component placement as the feature matures.

For early handwriting, feedback should be forgiving:

```text
Shape is close, but stroke order is off.
Try starting with the upper horizontal stroke.
```

## Mode modifiers

Each training mode should expose difficulty modifiers:

- Only new cards.
- Mix old reviews.
- Include audio.
- Only weak cards.
- Hide answer choices.
- Enable drawing.
- Enable pronunciation.
- Enable voice control.

Kana coverage:

- Base hiragana.
- Base katakana.
- Dakuten: `が`, `ざ`, `だ`, `ば`.
- Handakuten: `ぱ`, `ぴ`, `ぷ`.
- Small `ゃゅょ`.
- Yoon: `きゃ`, `しゅ`, `ちょ`.
- Long sounds.
- Small `っ`.

Katakana-specific coverage:

- Similar pairs: `シ` / `ツ`, `ソ` / `ン`.
- Foreign combinations: `ファ`, `ティ`, `チェ`, `ウィ`.
- Long vowels with `ー`.

Kanji coverage:

- JLPT N5 and N4.
- Topics: numbers, days, nature, people, school.
- Components/radicals.
- Frequency.
- User mistakes.

## Voice-first mode

The long-term goal is a hands-free mode where the user can train without pressing buttons.

Example visual session:

```text
App: How is this symbol read?
Screen: さ
User: sa
App: Correct. Next.
Screen: む
User: mu
App: Correct.
```

Example audio-only session:

```text
App: Choose the hiragana for "ko".
User: こ.
App: Correct.
```

Voice commands:

- repeat
- slower
- next
- I don't know
- show answer
- again
- stop
- hiragana mode
- only mistakes

Implementation note: speech recognition is browser-dependent and may not work fully offline in every browser. The app should treat local data, local progress, and cached UI as offline-capable, while pronunciation recognition remains a progressive enhancement.

## Mobile behavior

Mobile should feel purpose-built, not like a shrunken desktop layout.

Main screen:

- Continue learning.
- Today's reviews.
- Weak symbols.
- Start training.

Training screen:

- One large prompt in the center.
- Large answer buttons.
- Fast audio access.
- "I don't know" action.
- Finger drawing mode.
- One-button microphone.
- Auto-advance after correct answers.

Drawing screen:

- Large drawing area.
- Clear.
- Check.
- Show stroke order.

## Information architecture

Recommended top-level sections:

```text
Home
├── Today's training
├── Progress
├── Hiragana
├── Katakana
├── Kanji
├── Weak spots
├── Voice mode
├── Drawing
└── Settings
```

Per-symbol card:

```text
Symbol: き
Reading: ki
Type: hiragana
Status: reinforcing
Accuracy: 82%
Mistakes: often confused with さ
Last review: today
Next review: tomorrow
```

## Implementation principles

The main product difference is that the app trains multiple associations, not just `symbol -> romaji`.

The target association graph:

- Symbol -> sound.
- Sound -> symbol.
- Romaji -> symbol.
- Symbol -> romaji.
- Symbol -> handwriting.
- Symbol -> word.
- Word -> reading.
- Meaning -> kanji.
- Kanji -> meaning.

The app should stay local-first:

- Core datasets live in `src/data`.
- User progress lives in browser storage.
- The built frontend can be cached by a service worker.
- Local audio files in `public/audio` should be preferred over remote audio.
- Backend services are optional for sync, accounts, admin dataset management, analytics, and larger shared content.

