import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { UserService, User, Game } from '../core';
import { GameService } from '../core/services/game.service';

import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

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

  isAuthenticated: boolean;
  currentUser: User;
  games: Game[] = [];
  activeGame: Game;
  inGameMode: boolean = false;
  stompClient;

  ngOnInit() {
    this.userService.isAuthenticated.subscribe((authenticated) => {
        this.isAuthenticated = authenticated;
        if (authenticated) {
          console.log(authenticated);
          this.currentUser = this.userService.getCurrentUser();
          this.gameService.getGamesForUser(this.currentUser.username).subscribe(data => {
            console.log("GET GAMES result from game service: ", data);
            this.games = data;
          });
        }
      });
    this.initializeWebSocketConnection();      
  }

  initializeWebSocketConnection() {
    let ws = new SockJS('http://localhost:8080/socket/');
    this.stompClient = Stomp.over(ws);
    let that = this;
    this.stompClient.connect({}, function(frame) {
      console.log('initializing stomp client');
      that.stompClient.subscribe("/topic/opponentEndedTurn", (message) => {
        console.log("result from subscribe: " + message);
        if(message.body) {
          that.gameService.getGameByGameIdAndUsername(message.body, that.currentUser.username).subscribe(game => {
            console.log('result from getGameByGameIdAndUsername:', game)
            that.activeGame = game;
          });
          that.gameService.getGamesForUser(that.currentUser.username).subscribe(games => {
            console.log('result from getGamesForUser (after getting message):', games)
            that.games = games;
          });
        }
      });
    });
  }

  startGame() {
    console.log('start game pressed');
    this.gameService.startGame(this.currentUser.username).subscribe(newGame => {
      console.log("START GAME result from game service: ", newGame);
      this.activeGame = newGame;
      this.gameService.getGamesForUser(this.currentUser.username).subscribe(games => {
        this.games = games;
      });
    });
  }

  endTurn() {
    console.log('submit turn pressed');
    if (this.activeGame.currentTurn) {
      this.gameService.endTurn(this.activeGame.id, this.activeGame.username).subscribe(game => {
        console.log("END TURN result from game service: ", game);
        this.activeGame = game;
        this.gameService.getGamesForUser(this.currentUser.username).subscribe(games => {
          this.games = games;
        });
      });
    } else {
      console.log("it is not your turn, so you can't end it");
    }
  }

  setActiveGame(game: Game) {
    this.activeGame = game;
  }
}
