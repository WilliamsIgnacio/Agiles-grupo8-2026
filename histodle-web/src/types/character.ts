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
}

export interface CharactersOutletContext {
  characters: Character[];
  loading: boolean;
  error: string | null;
}