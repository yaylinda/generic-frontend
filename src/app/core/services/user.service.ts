import { Injectable } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';
import { map ,  distinctUntilChanged } from 'rxjs/operators';

@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor (
    private apiService: ApiService,
    private http: HttpClientModule,
    private jwtService: JwtService
  ) {}

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.apiService.get('/users/' + this.jwtService.getToken())
        .subscribe(
          data => this.setAuth(data),
          err => this.purgeAuth()
        );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    console.log("setAuth user:", user);
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.sessionToken);
    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(type, credentials): Observable<User> {
    const route = (type === 'login') ? '/login' : '/register';
    console.log(credentials);
    return this.apiService.post('/users' + route, credentials)
      .pipe(map(
      data => {
        console.log("response: ", data);
        this.setAuth(data);
        return data;
      }
    ));
  }

  getCurrentUser(): User {
    console.log("getCurrentUser: ", this.currentUserSubject.value);
    return this.currentUserSubject.value;
  }

  // Update the user on the server (email, pass, etc)
  update(user): Observable<User> {
    return this.apiService
    .put('/user/', user)
    .pipe(map(data => {
      // Update the currentUser observable
      this.currentUserSubject.next(data.user); // TODO when updating this, change to 'data'
      return data.user;
    }));
  }

}
