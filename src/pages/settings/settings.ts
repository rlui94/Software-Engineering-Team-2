import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class SettingsPage {
	gameboard_color: string = "#0066FF";

	constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
	}

	ngOnInit() {
		this.gameboard_color = this.user.getGameboardColor();
	}

	updateGameboardColor() {
		this.user.changeSetting('gameboardColor', this.gameboard_color);
	}
}
