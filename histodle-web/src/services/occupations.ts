import type { Occupation } from '../types/occupations';

const API_BASE_URL = `${import.meta.env.VITE_API_URL ?? 'http://localhost:8080'}/occupations`;

export const getOccupations = async (): Promise<Occupation[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error(`Error al obtener las ocupaciones: ${response.statusText}`);
    }

    const data: Occupation[] = await response.json();
    return data || [];
}

export const createOccupation = async (occupationData: Omit<Occupation, 'id'>): Promise<Occupation> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(occupationData),
    });

    if (!response.ok) {
        throw new Error(`Error al registrar la ocupación: ${response.statusText}`);
    }

    return response.json();
};

export const updateOccupation = async (
    id: number,
    occupationData: Omit<Occupation, 'id'>,
): Promise<Occupation> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(occupationData),
    });

    if (!response.ok) {
        throw new Error(`Error al modificar la ocupación: ${response.statusText}`);
    }

    return response.json();
};

export const deleteOccupation = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Error al eliminar la ocupación: ${response.statusText}`);
    }
};