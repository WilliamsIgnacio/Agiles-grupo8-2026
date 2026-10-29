import type { Occupation } from "./occupations";
import type { Difficulty } from "./difficulty";

export interface CharacterHint {
  id: number;
  characterId: number;
  text: string;
}

export type CharacterHintInput = Pick<CharacterHint, 'text'> & {
  id?: number;
};

export interface Character {
  id: number;
  name: string;
  difficultyId: number;
  difficulty: Difficulty;
  gender: string;
  period: string;
  country: string;
  continent: string;
  knowFor: string;
  position: string;
  birthYear: number;
  yearOfDeath: number;
  occupations: Occupation[];
  hints: CharacterHint[];
}

export type CharacterInput = Omit<Character, 'id' | 'difficulty' | 'occupations' | 'hints'> & {
  occupationIds: number[];
  hints: CharacterHintInput[];
};

export interface CharactersOutletContext {
  characters: Character[];
  occupations: Occupation[];
  loading: boolean;
  error: string | null;
  addCharacter: (character: Character) => void;
  updateCharacter: (character: Character) => void;
  removeCharacter: (id: number) => void;
}