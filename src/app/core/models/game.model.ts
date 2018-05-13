import { GameBoard } from './gameboard.model';

export interface Game {
    id: string;
    username: string;
    opponentName: string;
    gameBoard: GameBoard;
    currentTurn: boolean;
    points: number;
    energy: number;
    status: string;
}