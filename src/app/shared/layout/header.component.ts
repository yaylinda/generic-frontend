import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User, UserService, ApiService } from '../../core';

@Component({
  selector: 'app-layout-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  
  constructor(
    private userService: UserService,
    private apiService: ApiService,
    private router: Router
  ) { }

  currentUser: User;

  ngOnInit() {
    this.userService.currentUser.subscribe(
      (userData) => {
        this.currentUser = userData;
      }
    );
  }

  logout() {
    this.apiService
      .post('/user/logout/' + this.currentUser.token)
      .subscribe(() => {
        console.log('logged out');
      })
  }
}
