import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { Game, StartGameResponse } from '../models';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators/map';

@Injectable()
export class GameService {
  constructor(
    private apiService: ApiService
  ) {}

  getGamesForUser(username: string): Observable<Game[]> {
    return this.apiService.get('/game/' + username).pipe(map(data => {
        console.log('result from get games: ', data);
        return data;
    }));
  }

  startGame(username: string): Observable<Game> {
    return this.apiService.get('/game/start/' + username).pipe(map(data =>{
      console.log('result from start game: ', data);
      return data;
    }));
  }

  endTurn(gameId: string, username: string): Observable<Game> {
    return this.apiService.get('/game/endTurn/' + gameId + '/' + username).pipe(map(data => {
      console.log('result from end turn: ', data);
      return data;
    }));
  }
}