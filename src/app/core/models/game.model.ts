import { Cell } from './cell.model';
import { Card } from './card.model';
import { GameStats } from './gamestats.model';

export interface Game {
    id: string;
    username: string;
    opponentName: string;
    board: Cell[][];
    transitionBoard: Cell[][];
    previousBoard: Cell[][];
    currentTurn: boolean;
    points: number;
    opponentPoints: number;
    energy: number;
    status: string;
    cards: Card[];
    numRows: number;
    numCols: number;
    createdDate: string;
    player2JoinDate: string;
    lastModifiedDate: string;
    completedDate: string;
    winner: string;
    gameStats: GameStats;
    endzone: Card[];
    opponentEndzone: Card[];

}