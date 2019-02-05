import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { Game } from '../models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from '../models/card.model';
import { PutCardResponse } from '../models/putcardresponse.model';

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

  putCardOnBoard(gameId: string, sessionToken: string, rowNum: number, colNum: number, card: Card, index: number): Observable<PutCardResponse> {
    let putCardDTO = {
      'row': rowNum,
      'col': colNum,
      'cardIndex': index, 
      'card': card
    };
    return this.apiService.put('/games/putCard/' + gameId, putCardDTO, sessionToken).pipe(map(data => {
      return data;
    }));
  }
}