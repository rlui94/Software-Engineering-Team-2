import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController } from 'ionic-angular';

import { User } from './../../providers/user';
import { PopoverSettingsPage } from './popover';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class SettingsPage {
	gameboard_color: string = "#0066FF";
	ai_info_toggle: boolean = true;

	constructor(public navCtrl: NavController, public navParams: NavParams, private user: User, private popoverCtrl: PopoverController) {
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

	presentPopover(event: Event) {
		let popover = this.popoverCtrl.create(PopoverSettingsPage);
		popover.present({ ev: event });
	}

}
