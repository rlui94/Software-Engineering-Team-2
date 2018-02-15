import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { User } from './../../providers/user';
import { NetworkService } from '../../providers/network-service';

import { GamePage } from '../game/game';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	opponent: number = 2;
	player1: string;
	player2: string;
	depth: string = '4';
	size: number = 3;
	first: number = 0;
	rounds: number = 1;
	selectedcolorplayer1: string = "#FFFF00";
	selectedcolorplayer2: string = "#FF0000";
	gameCode: string = "";

	constructor(public navCtrl: NavController, private user: User, private networkService: NetworkService) {

	}

	ngOnInit() {
		if (this.networkService.noConnection())
			this.networkService.showNetworkAlert();
	}

	onSubmit(formData) {
		this.navCtrl.push(GamePage, {
			opponent: this.opponent,
			player1: this.player1,
			player2: this.player2,
			depth: parseInt(this.depth),
			size: this.size,
			first: this.first,
			rounds: this.rounds,
			selectedcolorplayer1: this.selectedcolorplayer1,
			selectedcolorplayer2: this.selectedcolorplayer2,
			gameCode: this.gameCode,
		});
	}

}
