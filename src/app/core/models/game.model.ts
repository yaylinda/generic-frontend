import { GameBoard } from './gameboard.model';

export interface Game {
    username: string;
    opponentName: string;
    gameBoard: GameBoard;
    currentTurn: boolean;
    points: number;
    energy: number;
    status: string;
}