import { GameBoard } from './gameboard.model';
import { Cell } from './cell.model';
import { Card } from './card.model';

export interface Game {
    id: string;
    username: string;
    opponentName: string;
    board: Cell[][];
    previousBoard: Cell[][];
    currentTurn: boolean;
    points: number;
    energy: number;
    status: string;
    cards: Card[];
}