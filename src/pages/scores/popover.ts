import { Component } from '@angular/core';
import { ViewController, NavController, AlertController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
	template: `
    <ion-list> 
      <button ion-item (click)="clearscoresTapped($event)">Clear High Scores</button>
    </ion-list> 
  `
})
export class PopoverPage {
	callback: Function;

	constructor(
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		private user: User,
		public alertCtrl: AlertController,
		public navParams: NavParams
	) { }

	ngOnInit() {
		this.callback = this.navParams.data.callback;
	}

	clearscoresTapped(event) {
		let logout = this.alertCtrl.create({
			title: 'Confirm',
			message: 'Are you sure you want to clear the high scores?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel'
				},
				{
					text: 'Clear High Scores',
					handler: () => {
						this.user.clearscores();
						this.callback();
					}
				}
			]
		});
		logout.present();
		this.viewCtrl.dismiss();
	}
}
