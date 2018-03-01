import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class SettingsPage {
	gameboard_color: string;
	ai_info_toggle: boolean;

	constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
	}

	ngOnInit() {
		this.gameboard_color = this.user.getSettings().gameboardColor;
		this.ai_info_toggle = this.user.getSettings().aiInfo;
	}

	updateGameboardColor() {
		this.user.changeSetting('gameboardColor', this.gameboard_color);
	}

	toggleAiInfo() {
		this.user.changeSetting('aiInfo', this.ai_info_toggle);
	}

}
