export interface Card {
    id: string;
    owner: string;
    type: string;
    might: number
    movement: number;
    cost: number;
    clicked: boolean;
    justDrew: boolean;
    numTurnsOnBoard: number;
}