import type { Character } from './character';

export interface Challenge {
    id: number;
    characterId: number;
    name: string;
    description: string;
    character: Character;
}

export type ChallengeInput = Pick<Challenge, 'characterId' | 'name' | 'description'>;
