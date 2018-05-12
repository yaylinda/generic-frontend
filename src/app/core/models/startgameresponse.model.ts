import { Game } from "./game.model";

export interface StartGameResponse {
    games: Game[];
    newGame: Game;
}