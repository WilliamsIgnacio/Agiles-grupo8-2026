import type { Challenge, ChallengeInput } from '../types/challenge';
import { csrfHeaders } from './auth';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/challenges`;

export const getChallenges = async (): Promise<Challenge[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error(`Error al obtener los desafíos: ${response.statusText}`);
    }
    return response.json();
};

export const getChallenge = async (id: number): Promise<Challenge> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
        throw new Error(`Error al obtener el desafío: ${response.statusText}`);
    }
    return response.json();
};

export const createChallenge = async (challenge: ChallengeInput): Promise<Challenge> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(challenge),
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Error al crear el desafío: ${response.statusText}`);
    }
    return response.json();
};

export const updateChallenge = async (
    id: number,
    challenge: ChallengeInput,
): Promise<Challenge> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...csrfHeaders() },
        body: JSON.stringify(challenge),
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Error al modificar el desafío: ${response.statusText}`);
    }
    return response.json();
};

export const deleteChallenge = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE', credentials: 'include', headers: csrfHeaders() });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Error al eliminar el desafío: ${response.statusText}`);
    }
};
