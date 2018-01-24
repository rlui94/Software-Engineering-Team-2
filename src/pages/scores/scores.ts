import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
  selector: 'page-scores',
  templateUrl: 'scores.html'
})
export class ScoresPage {
  scores: Array<{ player: string, score: number }> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
    
  }
  
  ngOnInit() {
	this.scores = this.user.getscores();
  }
}
