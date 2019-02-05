import { Game } from './game.model';

export interface PutCardResponse {
    game: Game;
    status: string;
    message: string;
}