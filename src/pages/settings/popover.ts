import { Component } from '@angular/core';
import { ViewController, NavController, AlertController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
	template: `
	<ion-list>
	<button ion-item (click)="resetsettingsTapped($event)">Reset Settings</button>
	</ion-list>
	`
})
export class PopoverSettingsPage {
	callback: Function;

	constructor(
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		private user: User,
		public alertCtrl: AlertController,
		public navParams: NavParams
	) {
		this.callback = this.navParams.data.callback;
	}

	resetsettingsTapped(event) {
		let logout = this.alertCtrl.create({
			title: 'Confirm',
			message: 'Are you sure you want to reset settings back to their default values?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel'
				},
				{
					text: 'Reset Settings',
					handler: () => {
						this.user.resetsettings();
						this.callback();
					}
				}
			]
		});
		logout.present();
		this.viewCtrl.dismiss();
	}
}
