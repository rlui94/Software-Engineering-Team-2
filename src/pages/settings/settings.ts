import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class SettingsPage {
	gameboard_color: string = "#0066FF";
	ai_info_toggle: boolean = true;

	constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
	}

	ngOnInit() {
		let settings = this.user.getSettings();
		this.gameboard_color = settings.gameboardColor;
		this.ai_info_toggle = settings.aiInfo;
	}

	updateGameboardColor() {
		this.user.changeSetting('gameboardColor', this.gameboard_color);
	}

	toggleAiInfo() {
		this.user.changeSetting('aiInfo', this.ai_info_toggle);
	}

}
