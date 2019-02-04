import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { Game, StartGameResponse } from '../models';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { Card } from '../models/card.model';

@Injectable()
export class GameService {

  constructor(private apiService: ApiService) { }

  getGames(sessionToken: string): Observable<Game[]> {
    return this.apiService.get('/games', sessionToken).pipe(map(data => {
        return data;
    }));
  }

  startGame(sessionToken: string): Observable<Game> {
    return this.apiService.get('/games/start', sessionToken).pipe(map(data => {
      return data;
    }));
  }

  endTurn(gameId: string, sessionToken: string): Observable<Game> {
    return this.apiService.get('/games/endTurn/' + gameId, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  getGameByGameId(gameId: string, sessionToken: string): Observable<Game> {
    return this.apiService.get('/games/' + gameId, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  putCardOnBoard(gameId: string, sessionToken: string, rowNum: number, colNum: number, card: Card): Observable<Game> {
    let putCardDTO = {
      'row': rowNum,
      'col': colNum,
      'card': card
    };
    return this.apiService.put('/games/putCard/' + gameId, putCardDTO, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  drawCard(gameId: string, sessionToken: string, usedCardIndex: number): Observable<Card> {
    return this.apiService.get('/games/card/' + gameId + '/' + usedCardIndex, sessionToken).pipe(map(data => {
      return data;
    }))
  }
}