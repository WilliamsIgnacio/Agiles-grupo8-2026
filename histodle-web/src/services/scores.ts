import type { Score, ScoreInput, ScoreUpdateInput } from '../types/score';

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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score),
    });
    if (!response.ok) {
        return parseError(response, 'modificar la configuración de puntaje');
    }
    return response.json();
};

export const deleteScore = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        return parseError(response, 'eliminar la configuración de puntaje');
    }
};
