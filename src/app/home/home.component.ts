import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService, User, Game } from '../core';
import { GameService } from '../core/services/game.service';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Card } from '../core/models/card.model';
import { Cell } from '../core/models/cell.model';
import {MatSnackBar} from '@angular/material';

import { environment } from '../../environments/environment';
import { getLocaleDayNames } from '@angular/common';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private userService: UserService,
    private gameService: GameService,
    private snackBar: MatSnackBar
  ) { }

  isAuthenticated: boolean;
  currentUser: User;

  gamesListNumCols: number;

  games: Game[] = [];
  completedGames: Game[] = [];
  joinableGames: Game[] = [];
  activeGame: Game;
  activeGameCells: Cell[];

  previouslyClickedCard: Card;
  previouslyClickedCardIndex: number;

  inGameMode: boolean = false;

  stompClient;

  ngOnInit() {
    this.gamesListNumCols = 1;
    this.userService.isAuthenticated.subscribe((authenticated) => {
        this.isAuthenticated = authenticated;
        if (authenticated) {
          console.log("user is authenticated");
          this.currentUser = this.userService.getCurrentUser();
          this.getGamesLists();
          this.initializeWebSocketConnection();
        }
      });
  }

  initializeWebSocketConnection() {
    let ws = new SockJS(`${environment.api_url}/socket/`);
    this.stompClient = Stomp.over(ws);
    let that = this;

    this.stompClient.connect({}, function() {

      // when opponent ended turn, update activeGame/Cells
      that.stompClient.subscribe("/topic/opponentEndedTurn/" + that.currentUser.username, (message) => {
        console.log("result from subscribe opponentEndedTurn: " + message);
        if(message.body) {
          that.gameService.getGameByGameId(message.body, that.currentUser.sessionToken).subscribe(game => {
            console.log('result from getGameByGameId:', game)
            that.activeGame = game;
            that.activeGameCells = [];
            for (let i = 0; i < that.activeGame.board.length; i++) {
              that.activeGameCells = that.activeGameCells.concat(that.activeGame.board[i]);
            }
          });
        }
      });

      // when opponent put card on board, update activeGame/Cells
      that.stompClient.subscribe("/topic/opponentPutCard/" + that.currentUser.username, (message) => {
        console.log("result from subscribe opponentPutCard: " + message);
        if(message.body) {
          that.gameService.getGameByGameId(message.body, that.currentUser.sessionToken).subscribe(game => {
            console.log('result from getGameByGameId:', game)
            that.activeGame = game;
            that.activeGameCells = [];
            for (let i = 0; i < that.activeGame.board.length; i++) {
              that.activeGameCells = that.activeGameCells.concat(that.activeGame.board[i]);
            }
          });
        }
      });

      // when player 2 joins the game, update the active game display
      that.stompClient.subscribe("/topic/player2Joined/" + that.currentUser.username, (message) => {
        console.log("result from subscribe player2Joined: " + message);
        if(message.body) {
          that.gameService.getGameByGameId(message.body, that.currentUser.sessionToken).subscribe(game => {
            console.log('result from getGameByGameId:', game)
            that.activeGame = game;
            that.activeGameCells = [];
            for (let i = 0; i < that.activeGame.board.length; i++) {
              that.activeGameCells = that.activeGameCells.concat(that.activeGame.board[i]);
            }
          });
        }
      });

      // when another player created a game, update joinable games list
      that.stompClient.subscribe("/topic/gameCreated", (message) => {
        console.log("game created... updating joinable games: ", message);
        if (message.body != that.currentUser.username) {
          that.gameService.getJoinableGames(that.currentUser.sessionToken).subscribe(games => {
            console.log('result from getJoinableGames:', getLocaleDayNames)
            that.joinableGames = games;
          });
        }
      });
      
    });
  }

  joinGame(gameId) {
    console.log('join game pressed');
    this.gameService.joinGame(this.currentUser.sessionToken, gameId).subscribe(newGame => {
      console.log("join game result: ", newGame);
      this.updateActiveGameAndCellsList(newGame);
      this.inGameMode = true;
    });
  }

  createGame() {
    console.log('start game pressed');
    this.gameService.createGame(this.currentUser.sessionToken).subscribe(newGame => {
      console.log("new game result: ", newGame);
      this.updateActiveGameAndCellsList(newGame);
      this.inGameMode = true;
    });
  }

  handleClickedGame(gameIndex: number, useActiveGamesList: boolean) {
    console.log('clicked game at index: ', gameIndex);
    if (useActiveGamesList) {
      this.updateActiveGameAndCellsList(this.games[gameIndex]);
    } else {
      this.updateActiveGameAndCellsList(this.completedGames[gameIndex]);
    }
    this.inGameMode = true;
  }

  handleClickedBack() {
    this.inGameMode = false;
    this.activeGame = null;
    this.activeGameCells = [];
    this.games = [];
    this.joinableGames = [];
    this.completedGames = [];
    this.getGamesLists();
  }

  endTurn(dicardHand: boolean) {
    if (this.activeGame.currentTurn && this.activeGame.status !== 'COMPLETED') {
      this.gameService.endTurn(this.activeGame.id, this.currentUser.sessionToken, dicardHand).subscribe(game => {
        console.log("END TURN result from game service: ", game);
        this.updateActiveGameAndCellsList(game);
      });
    }
  }

  handleClickedCard(card: Card, index: number) {
    console.log('clicked card: ', card);
    console.log('clicked index: ', index);
    this.previouslyClickedCard = card;
    this.previouslyClickedCardIndex = index;
  }

  handleClickedCell(index: number) {
    console.log('clicked index=', index);
    console.log('previouslyClickedCard=', this.previouslyClickedCard);
    
    let rowNum: number = Math.floor(index / this.activeGame.numCols);
    let colNum: number = Math.floor(index % this.activeGame.numCols)

    console.log('rowNum:', rowNum, ', colNum:', colNum)

    if (this.previouslyClickedCard && this.activeGame.currentTurn && this.activeGame.status !== 'COMPLETED') {
      this.gameService
        .putCardOnBoard(this.activeGame.id, this.currentUser.sessionToken, rowNum, colNum, this.previouslyClickedCard, this.previouslyClickedCardIndex)
        .subscribe(response => {
          console.log('putCardResponse:', response);
          this.updateActiveGameAndCellsList(response.game);
          if (response.status === 'INVALID') {
            console.log('invalid put card, showing snack bar');
            this.snackBar.open(response.message, 'Dismiss', {
              duration: 2000
            });
          }
        });
      this.previouslyClickedCard = null;
    }
  }

  getGamesLists() {
    this.gameService.getGames(this.currentUser.sessionToken).subscribe(data => {
      data.forEach(g => {
        if (g.status === 'COMPLETED') {
          this.completedGames.push(g);
        } else {
          this.games.push(g);
        }
      })
      console.log("games: ", this.games);
      console.log("completedGames: ", this.completedGames);
    });
    this.gameService.getJoinableGames(this.currentUser.sessionToken).subscribe(data => {
      this.joinableGames = data;
      console.log("joinableGames: ", this.joinableGames);
    });
  }

  updateActiveGameAndCellsList(newGame: Game) {
    console.log("converting activeGame into activeGameCells...");
    this.activeGame = newGame;
    this.activeGameCells = [];
    for (let i = 0; i < this.activeGame.board.length; i++) {
      this.activeGameCells = this.activeGameCells.concat(this.activeGame.board[i]);
    }
  }
}
