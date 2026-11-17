import type { DailyChallenge } from '../types/dailyChallenge';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/daily-challenges`;
const DAILY_CHALLENGE_RESULTS_KEY = 'histodle:daily-challenge-results';

export type DailyChallengeResult = 'won' | 'lost';

const isDailyChallengeResults = (
    value: unknown,
): value is Record<string, DailyChallengeResult> =>
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((result) => result === 'won' || result === 'lost');

export const getDailyChallengeResults = (): Record<string, DailyChallengeResult> => {
    const storedResults = localStorage.getItem(DAILY_CHALLENGE_RESULTS_KEY);
    if (storedResults === null) return {};

    const parsed: unknown = JSON.parse(storedResults);
    if (!isDailyChallengeResults(parsed)) {
        throw new Error('El progreso de los desafíos diarios tiene un formato inválido.');
    }

    return parsed;
};

export const saveDailyChallengeResult = (
    date: string,
    result: DailyChallengeResult,
): void => {
    const results = getDailyChallengeResults();
    results[date] = result;
    localStorage.setItem(
        DAILY_CHALLENGE_RESULTS_KEY,
        JSON.stringify(results),
    );
};

export const getDailyChallenge = async (date: string): Promise<DailyChallenge> => {
    const response = await fetch(`${API_BASE_URL}/${date}`);
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Error al obtener el desafío diario: ${response.statusText}`);
    }
    return response.json();
};
