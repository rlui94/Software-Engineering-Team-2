import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class SettingsPage {
	gameboard_color: string;

	constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
	}

	getGameboardColor() {
		return this.gameboard_color;
		//return this.user.getGameboardColor();
	}

	updateGameboardColor() {
		this.user.changeSetting('gameboardColor', this.gameboard_color);
	}
}
