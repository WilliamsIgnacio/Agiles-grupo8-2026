import { csrfHeaders } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export interface LeaderboardEntry {
    position: number;
    name: string;
    challengesPlayed: number;
    totalPoints: number;
}

export interface ChallengeResultInput {
    attemptsUsed: number;
    hintsUsed: number;
    won: boolean;
}

export interface ChallengeResultResponse {
    score: number;
    counted: boolean;
}

const readError = async (response: Response, action: string) => {
    const message = await response.text();
    return new Error(message || `Error al ${action}: ${response.statusText}`);
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_URL}/leaderboard`);
    if (!response.ok) {
        throw await readError(response, 'obtener el ranking');
    }
    return response.json();
};

export const recordChallengeResult = async (
    challengeId: number,
    result: ChallengeResultInput,
): Promise<ChallengeResultResponse> => {
    const response = await fetch(`${API_URL}/challenges/${challengeId}/results`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(result),
    });
    if (!response.ok) {
        throw await readError(response, 'registrar el resultado del desafío');
    }
    return response.json();
};

export const recordDailyChallengeResult = async (
    date: string,
    result: ChallengeResultInput,
): Promise<ChallengeResultResponse> => {
    const response = await fetch(`${API_URL}/daily-challenges/${date}/results`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(result),
    });
    if (!response.ok) {
        throw await readError(response, 'registrar el resultado del desafío diario');
    }
    return response.json();
};
