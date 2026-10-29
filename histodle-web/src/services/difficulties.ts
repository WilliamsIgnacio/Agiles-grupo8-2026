import type { Difficulty } from '../types/difficulty';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/difficulties`;

export const getDifficulties = async (): Promise<Difficulty[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error(`Error al obtener las dificultades: ${response.statusText}`);
    }
    return response.json();
};

export const createDifficulty = async (name: string): Promise<Difficulty> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw new Error(await response.text() || `Error al crear la dificultad: ${response.statusText}`);
    }
    return response.json();
};

export const updateDifficulty = async (id: number, name: string): Promise<Difficulty> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        throw new Error(await response.text() || `Error al modificar la dificultad: ${response.statusText}`);
    }
    return response.json();
};

export const deleteDifficulty = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error(await response.text() || `Error al eliminar la dificultad: ${response.statusText}`);
    }
};
