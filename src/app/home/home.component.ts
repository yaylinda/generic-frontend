import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { UserService, User, Game } from '../core';
import { GameService } from '../core/services/game.service';

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
