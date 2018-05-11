import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { Article, UserService } from '../../core';
import { of } from 'rxjs/observable/of';
import { concatMap } from 'rxjs/operators/concatMap';
import { tap } from 'rxjs/operators/tap';

@Component({
  selector: 'app-favorite-button',
  templateUrl: './favorite-button.component.html'
})
export class FavoriteButtonComponent {
  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  @Input() article: Article;
  @Output() toggle = new EventEmitter<boolean>();
  isSubmitting = false;

  toggleFavorite() {
    this.isSubmitting = true;

    this.userService.isAuthenticated.pipe(concatMap(
      (authenticated) => {
        // Not authenticated? Push to login screen
        if (!authenticated) {
          this.router.navigateByUrl('/login');
          return of(null);
        }
      }
    )).subscribe();
  }
}
