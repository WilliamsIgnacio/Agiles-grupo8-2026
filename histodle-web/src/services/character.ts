import type { Character, CharacterInput } from '../types/character';

const API_BASE_URL = 'http://localhost:8080/characters';

export const getCharacters = async (): Promise<Character[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error(`Error al obtener los personajes: ${response.statusText}`);
  }
  const data: Character[] = await response.json()
  return data || [];
};

export const createCharacter = async (characterData: CharacterInput): Promise<Character> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type' : 'application/json',
    },
    body: JSON.stringify(characterData),
  });

  if (!response.ok) {
    throw new Error(`Error al registrar el personaje: ${response.statusText}`);
  }

  return response.json();
};

export const updateCharacter = async (
  id: number,
  characterData: CharacterInput,
): Promise<Character> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(characterData),
  });

  if (!response.ok) {
    throw new Error(`Error al modificar el personaje: ${response.statusText}`);
  }

  return response.json();
};