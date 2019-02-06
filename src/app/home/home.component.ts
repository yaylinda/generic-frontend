import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { UserService, User, Game } from '../core';
import { GameService } from '../core/services/game.service';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Card } from '../core/models/card.model';
import { Cell } from '../core/models/cell.model';
import {MatSnackBar} from '@angular/material';

import { environment } from '../../environments/environment';

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

  numRows: number[] = [0,1,2,3,4];
  numCols: number[] = [0,1,2,3];

  isAuthenticated: boolean;
  currentUser: User;

  games: Game[] = [];
  completedGames: Game[] = [];
  activeGame: Game;
  activeGameCells: Cell[];

  previouslyClickedCard: Card;
  previouslyClickedCardIndex: number;

  inGameMode: boolean = false;

  stompClient;

  ngOnInit() {
    this.userService.isAuthenticated.subscribe((authenticated) => {
        this.isAuthenticated = authenticated;
        if (authenticated) {
          console.log(authenticated);
          this.currentUser = this.userService.getCurrentUser();
          this.gameService.getGames(this.currentUser.sessionToken).subscribe(data => {
            data.forEach(g => {
              if (g.status === 'COMPLETED') {
                this.completedGames.push(g);
              } else {
                this.games.push(g);
              }
            })
          });
          this.initializeWebSocketConnection();
        }
      });
  }

  initializeWebSocketConnection() {
    let ws = new SockJS(`${environment.api_url}/socket/`);
    this.stompClient = Stomp.over(ws);
    let that = this;

    this.stompClient.connect({}, function(frame) {

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
          that.gameService.getGames(that.currentUser.sessionToken).subscribe(games => {
            console.log('result from getGames (after getting message):', games)
            that.games = games;
          });
        }
      });

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
          that.gameService.getGames(that.currentUser.sessionToken).subscribe(games => {
            console.log('result from getGamesForUser (after player 2 joined):', games)
            that.games = games;
          });
        }
      });
    });
  }

  startGame() {
    console.log('start game pressed');
    this.gameService.startGame(this.currentUser.sessionToken).subscribe(newGame => {
      console.log("new game from game service: ", newGame);
      this.updateActiveGameAndCellsList(newGame);
      this.inGameMode = true;
    });
  }

  handleClickedGame(gameIndex: number) {
    console.log('clicked game at index: ', gameIndex);
    this.updateActiveGameAndCellsList(this.games[gameIndex]);
    this.inGameMode = true;
  }

  handleClickedBack() {
    this.inGameMode = false;
    this.activeGame = null;
    this.activeGameCells = [];
    this.games = [];
    this.completedGames = [];

    this.gameService.getGames(this.currentUser.sessionToken).subscribe(data => {
      console.log("getting games list: ", data);
      data.forEach(g => {
        if (g.status === 'COMPLETED') {
          this.completedGames.push(g);
        } else {
          this.games.push(g);
        }
      })
    });
  }

  endTurn(dicardHand: boolean) {
    if (this.activeGame.currentTurn && this.activeGame.status !== 'COMPLETED') {
      this.gameService.endTurn(this.activeGame.id, this.currentUser.sessionToken, dicardHand).subscribe(game => {
        console.log("END TURN result from game service: ", game);
        this.updateActiveGameAndCellsList(game);
        this.gameService.getGames(this.currentUser.sessionToken).subscribe(games => {
          this.games = games;
        });
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

    if (this.previouslyClickedCard && this.activeGame.currentTurn) {
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

  updateActiveGameAndCellsList(newGame: Game) {
    console.log("converting activeGame into activeGameCells...");
    this.activeGame = newGame;
    this.activeGameCells = [];
    for (let i = 0; i < this.activeGame.board.length; i++) {
      this.activeGameCells = this.activeGameCells.concat(this.activeGame.board[i]);
    }
  }
}
