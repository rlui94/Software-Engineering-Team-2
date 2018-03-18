import { Component } from '@angular/core';
import { NavController, NavParams, PopoverController, AlertController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';

import { User } from './../../providers/user';
import { PopoverSettingsPage } from './popover';

@Component({
	selector: 'page-settings',
	templateUrl: 'settings.html'
})
export class SettingsPage {
	gameboard_color: string = "#0066FF";
	ai_info_toggle: boolean = false;

	constructor(public navCtrl: NavController, public navParams: NavParams, private user: User, private popoverCtrl: PopoverController, public alertCtrl: AlertController, private socialSharing: SocialSharing) {
	}

	ngOnInit() {
		this.refresh();
	}

	refresh() {
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

	showAbout() {
		let contributors = '<div>Contributors:<br><a href="https://github.com/AvilaR" target="_blank">Roberto Avila</a><br><a href="https://github.com/tdulcet" target="_blank">Teal Dulcet</a><br><a href="https://github.com/rlui94/Software-Engineering-Team-2" target="_blank">Amandeep Kaur</a><br><a href="https://github.com/rlui94" target="_blank">Ryan Lui</a></div>';

		let attribution = '<div><br>Connect Four uses the Minimax with alpha beta pruning search algorithm to play the Connect Four game and the WebRTC protocol to play online with two devices. For more information on Connect Four, see: <a href="https://en.wikipedia.org/wiki/Connect_Four" target="_blank">https://en.wikipedia.org/wiki/Connect_Four</a>.</div>';

		let about = this.alertCtrl.create({
			title: 'About Connect Four',
			message: contributors + attribution,
			buttons: ['OK']
		});
		about.present();
	}

	showOpenSource() {
		let adaptations = '<div><br>Connect Four is adapted from <a href="https://github.com/Gimu" target="_blank">Son Nguyen\'s</a> <a href="https://github.com/Gimu/connect-four-js" target="_blank">Connect Four JS</a> and <a href="https://github.com/hjr265" target="_blank">Mahmud Ridwan\'s</a> <a href="https://github.com/hjr265/arteegee" target="_blank">Connect Four over WebRTC</a>.</div>';

		let openSource = this.alertCtrl.create({
			title: 'Connect Four License',
			message: 'Copyright &copy; 2018 The <a href="https://www.pdx.edu/" target="_blank">PSU</a> <a href="https://www.pdx.edu/computer-science/" target="_blank">CS</a> <a href="http://web.cecs.pdx.edu/~xie/se-w18/se-w18.htm" target="_blank">Software Engineering</a> Team 2.<br><br>Connect Four is released under the <a href="https://opensource.org/licenses/MIT" target="_blank">MIT License</a>.' + adaptations + '<br>Source Code: <a href="https://github.com/rlui94/Software-Engineering-Team-2" target="_blank">https://github.com/rlui94/Software-Engineering-Team-2</a>.',
			buttons: ['OK']
		});
		openSource.present();
	}

	showFeedback() {
		let prompt = this.alertCtrl.create({
			title: 'Send Feedback',
			message: 'Help improve Connect Four',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel'
				},
				{
					text: 'Next',
					handler: data => {
						this.socialSharing.canShareViaEmail().then(() => {
							this.socialSharing.shareViaEmail('', 'User Feedback', ['avila.roberto84@gmail.com'])
								.then(() => { this.user.presentToast('Thank you for your feedback!'); })
								.catch(() => { alert('An error occured while sending your feedback.'); });
						}).catch(() => {
							alert('Sending feedback via email is not available.');
						});
					}
				}
			]
		});
		prompt.present();
	}

	presentPopover(event: Event) {
		let popover = this.popoverCtrl.create(PopoverSettingsPage, { callback: () => { this.refresh(); } });
		popover.present({ ev: event });
	}

}
