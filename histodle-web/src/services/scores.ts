import type {
    Score,
    ScoreCalculationInput,
    ScoreCalculationResult,
    ScoreInput,
    ScoreUpdateInput,
} from '../types/score';
import { csrfHeaders } from './auth';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/scores`;

const parseError = async (response: Response, action: string): Promise<never> => {
    throw new Error(await response.text() || `Error al ${action}: ${response.statusText}`);
};

export const getScores = async (): Promise<Score[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        return parseError(response, 'obtener los puntajes');
    }
    return response.json();
};

export const createScore = async (score: ScoreInput): Promise<Score> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(score),
    });
    if (!response.ok) {
        return parseError(response, 'crear la configuración de puntaje');
    }
    return response.json();
};

export const updateScore = async (id: number, score: ScoreUpdateInput): Promise<Score> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(score),
    });
    if (!response.ok) {
        return parseError(response, 'modificar la configuración de puntaje');
    }
    return response.json();
};

export const deleteScore = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE', credentials: 'include', headers: csrfHeaders() });
    if (!response.ok) {
        return parseError(response, 'eliminar la configuración de puntaje');
    }
};

export const calculateScore = async (
    difficultyId: number,
    input: ScoreCalculationInput,
): Promise<ScoreCalculationResult> => {
    const response = await fetch(
        `${API_BASE_URL}/difficulty/${difficultyId}/calculate`,
        {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
            body: JSON.stringify(input),
        },
    );
    if (!response.ok) {
        return parseError(response, 'calcular el puntaje');
    }
    return response.json();
};
