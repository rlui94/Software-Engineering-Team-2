import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';

import { User } from './../../providers/user';
import { PopoverPage } from './popover'

@Component({
  selector: 'page-scores',
  templateUrl: 'scores.html'
})
export class ScoresPage {
  scores: Array<{ player: string, score: number }> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private user: User, private popoverCtrl: PopoverController) {
    
  }
  
  ngOnInit() {
	this.scores = this.user.getscores();
  }
  
  presentPopover(event: Event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }
}
