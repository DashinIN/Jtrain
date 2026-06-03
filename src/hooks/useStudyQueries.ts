import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { StudyCard } from "../types/cards";
import { fetchAllPages, fetchJson } from "../lib/api";
import type { ApiListResponse } from "../lib/api";
import { queryClient } from "../lib/queryClient";

type KanaCard = Extract<StudyCard, { type: "kana" }>["card"];
type KanjiCard = Extract<StudyCard, { type: "kanji" }>["card"];
type WordCard = Extract<StudyCard, { type: "word" }>["card"];
type SentenceCard = Extract<StudyCard, { type: "sentence" }>["card"];
type ParticleCard = Extract<StudyCard, { type: "particle" }>["card"];

function mapSection<T extends StudyCard["type"]>(type: T, cards: Extract<StudyCard, { type: T }>["card"][]): Extract<StudyCard, { type: T }>[] {
  return cards.map((card) => ({ type, card })) as unknown as Extract<StudyCard, { type: T }>[];
}

function kanaCardsQueryOptions() {
  return {
    queryKey: ["study", "kana", "all"] as const,
    queryFn: async () => mapSection("kana", await fetchAllPages<KanaCard>("/api/v1/kana")),
  };
}

function wordsCardsQueryOptions() {
  return {
    queryKey: ["study", "words", "all"] as const,
    queryFn: async () => mapSection("word", await fetchAllPages<WordCard>("/api/v1/words")),
  };
}

function sentencesCardsQueryOptions() {
  return {
    queryKey: ["study", "sentences", "all"] as const,
    queryFn: async () => mapSection("sentence", await fetchAllPages<SentenceCard>("/api/v1/sentences")),
  };
}

function particlesCardsQueryOptions() {
  return {
    queryKey: ["study", "particles", "all"] as const,
    queryFn: async () => mapSection("particle", await fetchAllPages<ParticleCard>("/api/v1/particles")),
  };
}

function kanjiCardsQueryOptions() {
  return {
    queryKey: ["study", "kanji", "all"] as const,
    queryFn: async () => mapSection("kanji", await fetchAllPages<KanjiCard>("/api/v1/kanji")),
  };
}

export function useKanaCardsQuery(enabled = true) {
  return useQuery({
    ...kanaCardsQueryOptions(),
    enabled,
  });
}

export function useWordsCardsQuery(enabled = true) {
  return useQuery({
    ...wordsCardsQueryOptions(),
    enabled,
  });
}

export function useSentencesCardsQuery(enabled = true) {
  return useQuery({
    ...sentencesCardsQueryOptions(),
    enabled,
  });
}

export function useParticlesCardsQuery(enabled = true) {
  return useQuery({
    ...particlesCardsQueryOptions(),
    enabled,
  });
}

export function useKanjiCardsQuery(enabled = true) {
  return useQuery({
    ...kanjiCardsQueryOptions(),
    enabled,
  });
}

export function useAllStudyCardsQuery(enabled = true) {
  return useQuery({
    queryKey: ["study", "all"],
    queryFn: async () => {
      const [kana, kanji, words, sentences, particles] = await Promise.all([
        queryClient.ensureQueryData(kanaCardsQueryOptions()),
        queryClient.ensureQueryData(kanjiCardsQueryOptions()),
        queryClient.ensureQueryData(wordsCardsQueryOptions()),
        queryClient.ensureQueryData(sentencesCardsQueryOptions()),
        queryClient.ensureQueryData(particlesCardsQueryOptions()),
      ]);
      return [
        ...kana,
        ...kanji,
        ...words,
        ...sentences,
        ...particles,
      ] as StudyCard[];
    },
    enabled,
  });
}

export function useInfiniteKanjiListQuery(enabled = true, pageSize = 40) {
  return useInfiniteQuery({
    queryKey: ["study", "kanji", "list", pageSize],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchJson<ApiListResponse<KanjiCard>>(`/api/v1/kanji?limit=${pageSize}&offset=${pageParam}`),
    getNextPageParam: (lastPage) => lastPage.next_offset ?? undefined,
    enabled,
    staleTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}

export function useInfiniteWordsListQuery(enabled = true, pageSize = 20) {
  return useInfiniteQuery({
    queryKey: ["study", "words", "list", pageSize],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchJson<ApiListResponse<WordCard>>(`/api/v1/words?limit=${pageSize}&offset=${pageParam}`),
    getNextPageParam: (lastPage) => lastPage.next_offset ?? undefined,
    enabled,
    staleTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });
}
