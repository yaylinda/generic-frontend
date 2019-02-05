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
    opponentPoints: number;
    energy: number;
    status: string;
    cards: Card[];
    numCardsPlayed: number;
    numTurns: number;
    numRows: number;
    numCols: number;
    createdDate: string;
    player2JoinDate: string;
    lastModifiedDate: string;
    completedDate: string;
}