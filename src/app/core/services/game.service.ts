import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { Game } from '../models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Card } from '../models/card.model';
import { PutCardResponse } from '../models/putcardresponse.model';
import { FriendRequest } from '../models/friendrequest.model';
import { Player } from '../models/player.model';

@Injectable()
export class GameService {
  constructor(private apiService: ApiService) { }

  getGames(sessionToken: string): Observable<Game[]> {
    return this.apiService.get('/games', sessionToken).pipe(map(data => {
        return data;
    }));
  }

  getJoinableGames(sessionToken: string): Observable<Game[]> {
    return this.apiService.get('/games/joinable', sessionToken).pipe(map(data => {
        return data;
    }));
  }

  joinGame(sessionToken: string, gameId: string): Observable<Game> {
    return this.apiService.get(`/games/join?gameId=${gameId}`, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  createGame(sessionToken: string): Observable<Game> {
    return this.apiService.post('/games/new', {}, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  endTurn(gameId: string, sessionToken: string, discardHand: boolean): Observable<Game> {
    return this.apiService.get('/games/endTurn/' + gameId + '?discard=' + discardHand, sessionToken).pipe(map(data => {
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

  getFriends(sessionToken: string): Observable<Player[]> {
    return this.apiService.get('/players/friends', sessionToken).pipe(map(data => {
      return data;
    }));
  }

  getOtherPlayers(sessionToken: string): Observable<Player[]> {
    return this.apiService.get('/players', sessionToken).pipe(map(data => {
      return data;
    }));
  }

  getFriendRequests(sessionToken: string): Observable<FriendRequest[]> {
    return this.apiService.get('/players/friends/requests', sessionToken).pipe(map(data => {
      return data;
    }));
  }

  addFriend(sessionToken: string, usernameToAdd: string): any {
    let body = {'requestee': usernameToAdd};
    return this.apiService.post('/players/friends/requests', body, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  respondToFriendRequest(sessionToken: string, requestId: string, isAccept: boolean): any {
    let body = {
      'requestId': requestId,
      'isAccept': isAccept
    };
    return this.apiService.put('/players/friends/responses', body, sessionToken).pipe(map(data => {
      return data;
    }));
  }

  inviteToGame(sessionToken: string, player2: string) {
    let body = {
      'player2': player2
    };
    return this.apiService.post('/games/invite', body, sessionToken).pipe(map(data => {
      return data;
    }));
  }
}