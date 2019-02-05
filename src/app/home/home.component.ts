import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { UserService, User, Game } from '../core';
import { GameService } from '../core/services/game.service';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { Card } from '../core/models/card.model';
import { Cell } from '../core/models/cell.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private router: Router,
    private userService: UserService,
    private gameService: GameService
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
  inGameMode: boolean = false;

  stompClient;

  ngOnInit() {
    this.userService.isAuthenticated.subscribe((authenticated) => {
        this.isAuthenticated = authenticated;
        if (authenticated) {
          console.log(authenticated);
          this.currentUser = this.userService.getCurrentUser();
          this.gameService.getGames(this.currentUser.sessionToken).subscribe(data => {
            console.log("GET GAMES result from game service: ", data);
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
    let ws = new SockJS('http://localhost:8080/socket/');
    this.stompClient = Stomp.over(ws);
    let that = this;

    this.stompClient.connect({}, function(frame) {

      that.stompClient.subscribe("/topic/opponentEndedTurn/" + that.currentUser.username, (message) => {
        console.log("result from subscribe opponentEndedTurn: " + message);
        if(message.body) {
          that.gameService.getGameByGameId(message.body, that.currentUser.sessionToken).subscribe(game => {
            console.log('result from getGameByGameId:', game)
            that.activeGame = game;
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
          });
        }
      });

      that.stompClient.subscribe("/topic/player2Joined/" + that.currentUser.username, (message) => {
        console.log("result from subscribe player2Joined: " + message);
        if(message.body) {
          that.gameService.getGameByGameId(message.body, that.currentUser.sessionToken).subscribe(game => {
            console.log('result from getGameByGameId:', game)
            that.activeGame = game;
          });
          that.gameService.getGames(that.currentUser.sessionToken).subscribe(games => {
            console.log('result from getGamesForUser (after player 2 joined):', games)
            that.games = games;
          });
        }
      });
    });
  }

  handleClickedGame(gameIndex: number) {
    this.inGameMode = true;
    this.activeGame = this.games[gameIndex];
    console.log(this.activeGame);
    this.activeGameCells = [];
    for (let i = 0; i < this.activeGame.board.length; i++) {
      this.activeGameCells = this.activeGameCells.concat(this.activeGame.board[i]);
    }
    console.log(this.activeGameCells);
  }

  handleClickedBack() {
    this.inGameMode = false;
    this.activeGame = null;
    this.activeGameCells = [];
    this.games = [];
    this.completedGames = [];

    this.gameService.getGames(this.currentUser.sessionToken).subscribe(data => {
      console.log("GET GAMES result from game service: ", data);
      data.forEach(g => {
        if (g.status === 'COMPLETED') {
          this.completedGames.push(g);
        } else {
          this.games.push(g);
        }
      })
    });
  }

  startGame() {
    console.log('start game pressed');
    this.gameService.startGame(this.currentUser.sessionToken).subscribe(newGame => {
      console.log("START GAME result from game service: ", newGame);
      this.activeGame = newGame;
      this.gameService.getGames(this.currentUser.sessionToken).subscribe(games => {
        this.games = games;
      });
    });
  }

  endTurn() {
    if (this.activeGame.currentTurn && this.activeGame.status !== 'COMPLETED') {
      this.gameService.endTurn(this.activeGame.id, this.currentUser.sessionToken).subscribe(game => {
        console.log("END TURN result from game service: ", game);
        this.activeGame = game;
        this.gameService.getGames(this.currentUser.sessionToken).subscribe(games => {
          this.games = games;
        });
      });
    }
  }

  setActiveGame(game: Game) {
    this.activeGame = game;
    console.log('updated active game: ', this.activeGame);
  }

  handleClickedCard(card: Card) {
    console.log('clicked card: ', card);
    if (this.previouslyClickedCard && this.previouslyClickedCard != card) {
      this.previouslyClickedCard.clicked = false;
    }
    if (card.clicked) {
      card.clicked = false;
    } else {
      card.clicked = true;
    }
    this.previouslyClickedCard = card;
  }

  processClickedCell(rowNum: number, colNum: number) {
    console.log('clicked rowNum=' + rowNum + ', colNum=', colNum, 'previouslyClickedCard=', this.previouslyClickedCard);
    
    if (this.previouslyClickedCard 
      && !this.activeGame.board[rowNum][colNum].card 
      && this.activeGame.currentTurn 
      && this.isPutCardAllowed(rowNum, this.previouslyClickedCard)
      && this.activeGame.energy - this.previouslyClickedCard.cost >= 0
      && this.activeGame.status === 'IN_PROGRESS' || this.activeGame.status === 'WAITING_PLAYER_2') {

      this.activeGame.board[rowNum][colNum].card = this.previouslyClickedCard;
      let usedCardIndex = this.activeGame.cards.indexOf(this.previouslyClickedCard);

      this.gameService
        .putCardOnBoard(this.activeGame.id, this.currentUser.sessionToken, rowNum, colNum, this.previouslyClickedCard)
        .subscribe(game => {
          this.activeGame = game;
          this.gameService.drawCard(this.activeGame.id, this.currentUser.sessionToken, usedCardIndex)
            .subscribe(card => {
              console.log('drew new card: ', card);
              card.justDrew = true;
              this.activeGame.cards.splice(usedCardIndex, 1, card);
            });
        });

      this.previouslyClickedCard = null;
    }
  }

  isPutCardAllowed(rowNum: number, cardToPut: Card): boolean {
    if (cardToPut.type === 'WALL') {
      return (rowNum >= this.activeGame.board.length - 1)
    } else if (cardToPut.type ==='TROOP') {
      return (rowNum >= this.activeGame.board.length - 2)
    }
    return false;
  }

}
