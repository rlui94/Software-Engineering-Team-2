import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
    
  }
}
