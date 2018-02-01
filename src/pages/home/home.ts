import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { User } from './../../providers/user';

import { GamePage } from '../game/game';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	opponent: number = 2;
	player1: string;
	player2: string;
	size: number = 3;
	first: number = 0;
	rounds: number = 1;
	selectedcolorplayer1: string = "#FFFF00";
	selectedcolorplayer2: string = "#FF0000";
	gameCode: string = "";

	constructor(public navCtrl: NavController, private user: User) {

	}

	onSubmit(formData) {
		this.navCtrl.push(GamePage, {
			opponent: this.opponent,
			player1: this.player1,
			player2: this.player2,
			size: this.size,
			first: this.first,
			rounds: this.rounds,
			selectedcolorplayer1: this.selectedcolorplayer1,
			selectedcolorplayer2: this.selectedcolorplayer2,
			gameCode: this.gameCode,
		});
	}

}
