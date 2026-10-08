import type { Occupation } from "./occupations";

export interface Character {
  id: number;
  name: string;
  gender: string;
  period: string;
  country: string;
  continent: string;
  knowFor: string;
  position: string;
  birthYear: number;
  yearOfDeath: number;
  occupations: Occupation[];
}

export type CharacterInput = Omit<Character, 'id' | 'occupations'> & {
  occupationIds: number[];
};

export interface CharactersOutletContext {
  characters: Character[];
  occupations: Occupation[];
  loading: boolean;
  error: string | null;
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
}