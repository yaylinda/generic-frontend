import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { Game, StartGameResponse } from '../models';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';
import { Card } from '../models/card.model';

@Injectable()
export class GameService {

  constructor(private apiService: ApiService) { }

  getGamesForUser(username: string): Observable<Game[]> {
    return this.apiService.get('/game/' + username).pipe(map(data => {
        return data;
    }));
  }

  startGame(username: string): Observable<Game> {
    return this.apiService.get('/game/start/' + username).pipe(map(data =>{
      return data;
    }));
  }

  endTurn(gameId: string, username: string): Observable<Game> {
    return this.apiService.get('/game/endTurn/' + gameId + '/' + username).pipe(map(data => {
      return data;
    }));
  }

  getGameByGameIdAndUsername(gameId: string, username: string): Observable<Game> {
    return this.apiService.get('/game/' + gameId + '/' + username).pipe(map(data => {
      return data;
    }));
  }

  putCardOnBoard(gameId: string, username: string, rowNum: number, colNum: number, card: Card): Observable<Game> {
    let putCardDTO = {
      'row': rowNum,
      'col': colNum,
      'card': card
    };
    return this.apiService.put('/game/putCard/' + gameId + '/' + username, putCardDTO).pipe(map(data => {
      return data;
    }));
  }

  drawCard(username: string): Observable<Card> {
    return this.apiService.get('/game/card/' + username).pipe(map(data => {
      return data;
    }))
  }
}