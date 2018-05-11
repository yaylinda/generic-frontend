import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Profile } from '../core';

@Component({
  selector: 'app-profile-favorites',
  templateUrl: './profile-favorites.component.html'
})
export class ProfileFavoritesComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  profile: Profile;

  ngOnInit() {
    this.route.parent.data.subscribe(
      (data: {profile: Profile}) => {
        this.profile = data.profile;
      }
    );
  }

}
