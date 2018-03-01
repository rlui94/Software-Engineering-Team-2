import { Injectable } from '@angular/core';
import { ToastController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

let defaultSettings = {
	gameboardColor: "#0066FF",
	aiInfo: true,
};

@Injectable()
export class User {
	userSettings: any;
	scores: Array<{ player: string, score: number }> = [];

	constructor(public storage: Storage, private toastCtrl: ToastController, public alertCtrl: AlertController) {
		storage.get('scores').then(scores => {
			if (scores == null) {

			} else {
				this.scores = scores;
			}
		});

		storage.get('userSettings').then(settings => {
			if (settings == null) {
				this.userSettings = defaultSettings;
				storage.set('userSettings', this.userSettings);
			}
			else {
				this.userSettings = settings;
			}
		});
	}

	getSettings() {
		return this.userSettings;
	}

	changeSetting(settingName: string, value: any) {
		this.userSettings[settingName] = value;
		this.storage.set('userSettings', this.userSettings);
	}

	getscores() {
		return this.scores;
	}

	setscore(player: string, score: number) {
		let highscore = 0;

		let index = this.scores.map((s) => { return s.player; }).indexOf(player);

		if (index > -1) {
			this.scores[index].score += score;
			highscore = this.scores[index].score;
		}
		else {
			this.scores.push({ player: player, score: score });
			highscore = score;
		}

		this.scores.sort((a, b) => {
			if (a.score == b.score)
				return a.player.localeCompare(b.player);
			else
				return b.score - a.score;
		});

		this.storage.set('scores', this.scores);

		return highscore;
	}

	clearscores() {
		this.scores = [];
		this.storage.set('scores', this.scores);
	}

	presentToast(message: string) {
		let toast = this.toastCtrl.create({
			message: message,
			duration: 3000,
			position: 'bottom'
		});

		toast.present();
	}
}
