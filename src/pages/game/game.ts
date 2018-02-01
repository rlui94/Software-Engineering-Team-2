import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import Peer from 'peerjs';

import { User } from './../../providers/user';

@Component({
	selector: 'page-game',
	templateUrl: 'game.html'
})
export class GamePage {
	rows: number = 8; 	// Height
	arows: any = [];
	columns: number = 10; 	// Width
	acolumns: any = [];
	status: number = 0; 	// 0: running, 1: won, 2: lost, 3: tie
	depth: number = 4; 	// Search depth
	ascore: number = 100000;// Win/loss score
	round: number = 0; 	// 0: Human, 1: Computer
	winning_array: number[] = []; // Winning (chips) array
	iterations: number = 0; // Iteration count
	opponent: number = 2;
	board: any;
	player1: string;
	player2: string;
	rounds: number = 1; 	// Number of rounds to play
	currentRound: number = 1;
	player1Wins: number = 0;// Players score for the current game
	player2Wins: number = 0;
	ties: number = 0;
	winner: number = 0;
	selectedcolorplayer1: string = "#FFFF00";
	selectedcolorplayer2: string = "#FF0000";
	gameCode: string = "";
	peer: any;
	conn: any;
	apikey: string = "em7dcs9izcjo47vi";

	constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController, private user: User) {

	}

	ngOnInit() {
		this.opponent = this.navParams.data.opponent;
		this.player1 = this.navParams.data.player1;
		this.selectedcolorplayer1 = this.navParams.data.selectedcolorplayer1;
		this.selectedcolorplayer2 = this.navParams.data.selectedcolorplayer2;
		this.status = 0;

		if (this.opponent == 4) {
			this.gameCode = this.navParams.data.gameCode;

			this.peer = new Peer({ key: this.apikey });

			this.conn = this.peer.connect(this.gameCode);
			this.conn.on('data', (data: any) => { this.recieve(data); });
			this.conn.on('error', (err: any) => { this.error(err); });
			this.conn.on('disconnected', () => { this.disconnected(); });
			this.conn.on('open', (id) => {
				this.send({
					version: 1,
					type: 2,
					player: this.player1
				});
			});
		}
		else {
			this.rounds = this.navParams.data.rounds;

			// Dropdown value
			var boardsize = this.navParams.data.size;
			if (boardsize == 1) {
				this.rows = 6;
				this.columns = 7;
			}
			else if (boardsize == 2) {
				this.rows = 7;
				this.columns = 8;
			}
			else if (boardsize == 3) {
				this.rows = 8;
				this.columns = 10;
			}
			this.arows = Array(this.rows);
			this.acolumns = Array(this.columns);
			this.round = this.navParams.data.first;
			if (this.opponent == 3) {
				this.gameCode = Math.random().toString(36).substr(2, 4);

				let prompt = this.alertCtrl.create({
					title: 'Human vs Human (Online)',
					message: "Please share this game code with your opponent:",
					inputs: [
						{
							type: 'text',
							name: 'gameCode',
							value: this.gameCode,
						}
					],
					buttons: [
						{
							text: 'Cancel',
							role: 'cancel',
							handler: data => {
								//console.log('Cancel clicked');

								this.navCtrl.pop();
							}
						},
						{
							text: 'OK',
							handler: data => {
								//console.log(data);


							}
						}
					]
				});
				prompt.present();

				this.peer = new Peer(this.gameCode, { key: this.apikey });

				this.peer.on('connection', (conn) => {
					this.conn = conn;
					this.send({
						version: 1,
						type: 1,
						player: this.player1,
						size: boardsize,
						first: this.round,
						rounds: this.rounds
					});
					this.conn.on('data', (data: any) => { this.recieve(data); });
					this.conn.on('error', (err: any) => { this.error(err); });
					this.conn.on('disconnected', () => { this.disconnected(); });
				});


			}
			else {
				this.player2 = this.opponent == 2 ? "Computer" : this.navParams.data.player2;

				this.initBoard();

				this.updateStatus();

				this.initBoard();
			}
		}

		if (this.opponent != 2) {
			document.getElementById('debug').style.display = "none";
		}
	}

	send(data: any) {
		console.log(data);

		this.conn.send(data);
	}

	recieve(data: any) {
		console.log(data);

		if (data.version == 1) {
			if (data.type == 1) {
				this.rounds = data.rounds;

				var boardsize = data.size;
				let size = "";
				if (boardsize == 1) {
					this.rows = 6;
					this.columns = 7;
					size = "7 × 6";
				}
				else if (boardsize == 2) {
					this.rows = 7;
					this.columns = 8;
					size = "8 × 7";
				}
				else if (boardsize == 3) {
					this.rows = 8;
					this.columns = 10;
					size = "10 × 8";
				}
				this.arows = Array(this.rows);
				this.acolumns = Array(this.columns);
				this.round = data.first;
				let first = this.round ? "Opponent" : "You";
				this.player2 = data.player;

				this.initBoard();

				this.updateStatus();

				this.initBoard();

				let prompt = this.alertCtrl.create({
					title: 'Human vs Human (Online)',
					subTitle: "Please accept or decline the request:",
					message: "Your Opponent:\t" + this.player2 + "<br>Board size:\t" + size + "<br>Player going first:\t" + first + "<br>Number of rounds:\t" + this.rounds,
					buttons: [
						{
							text: 'Decline',
							role: 'cancel',
							handler: data => {
								//console.log('Cancel clicked');

								this.navCtrl.pop();
							}
						},
						{
							text: 'Accept',
							handler: data => {
								//console.log(data);


							}
						}
					]
				});
				prompt.present();
			}
			else if (data.type == 2) {
				this.player2 = data.player;

				this.initBoard();

				this.updateStatus();

				this.initBoard();
			}
			else if (data.type == 3) {
				this.place(data.column);
			}
		}
	}

	error(err: any) {
		console.error(err);
		alert("An error occurred: " + JSON.stringify(err) + ".");
	}

	disconnected() {
		this.peer.reconnect();
	}



	/*
	 * Create initial game board
	 *
	 */
	initBoard(): void {
		// Generate 'real' board
		// Create 2-dimensional array
		var game_board = new Array(this.rows);
		for (var i = 0; i < game_board.length; ++i) {
			game_board[i] = new Array(this.columns);

			for (var j = 0; j < game_board[i].length; ++j) {
				game_board[i][j] = null;
			}
		}

		// Create from board object (see board.js)
		this.board = game_board;

	}



	/**
	 * On-click event
	 *
	 */
	act(e: Event): void {
		var element = e.target || window.event.srcElement;

		if (this.opponent == 1) {
			this.place((<HTMLTableCellElement>element).cellIndex);
		}
		else if (this.opponent == 2) {

			// Human round
			if (this.round == 0) this.place((<HTMLTableCellElement>element).cellIndex);

			setTimeout(() => {
				// Computer round
				if (this.round == 1) this.generateComputerDecision();
			}, 1000);
		}
		else if (this.opponent == 3 || this.opponent == 4) {
			let column = (<HTMLTableCellElement>element).cellIndex;

			this.place(column);

			this.send({
				version: 1,
				type: 3,
				column: column
			});
		}
	}


	/*
	 * Finds first available location of specific column.
	 *
	 */
	place(column: number): void {
		// If not finished
		if (this.score(this.board) != this.ascore && this.score(this.board) != -this.ascore && !this.isFull(this.board)) {
			var ay = 0;

			for (var y = this.rows - 1; y >= 0; --y) {
				if ((<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].className == 'empty') {
					ay = y;
					break;
				}
			}

			this.dropLoop(0, column, ay);
		}
	}


	/*
	 * Puts disk in specific location(I think loop == disk)
	 *
	 */
	dropLoop(y: number, column: number, ay: number) {
		setTimeout(() => {
			if (y != 0) {
				(<HTMLTableElement>document.getElementById('game_board')).rows[y - 1].cells[column].className = 'empty';
				(<HTMLTableElement>document.getElementById('game_board')).rows[y - 1].cells[column].style.background = '';
			}

			(<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].className = 'coin';

			if (this.round == 1) {
				(<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].style.background = this.selectedcolorplayer2;
			} else {
				(<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].style.background = this.selectedcolorplayer1;
			}

			if (y < ay)
				this.dropLoop(y + 1, column, ay);
			else {
				if (!this.boardplace(this.board, this.round, column)) {
					return alert("Invalid move.");
				}

				this.round = this.switchRound(this.round);
				this.updateStatus();
				this.updateRound();
			}
		}, 50);
	}

	/*
	 * AI
	 *
	 */
	generateComputerDecision(): void {
		if (this.score(this.board) != this.ascore && this.score(this.board) != -this.ascore && !this.isFull(this.board)) {
			this.iterations = 0; // Reset iteration count
			document.getElementById('loading').style.display = "block"; // Loading message

			// AI is thinking
			setTimeout(() => {
				// Debug time
				var startzeit = new Date().getTime();

				// Algorithm call
				var ai_move = this.maximizePlay(this.copy(this.board, 0), this.depth, 0, 0);

				var laufzeit = new Date().getTime() - startzeit;
				document.getElementById('ai-time').innerHTML = laufzeit.toFixed(2) + 'ms';

				// Place ai decision
				this.place(ai_move[0]);

				// Debug
				document.getElementById('ai-column').innerHTML = 'Column: ' + parseInt(ai_move[0] + 1);
				document.getElementById('ai-score').innerHTML = 'Score: ' + ai_move[1];
				document.getElementById('ai-iterations').innerHTML = this.iterations.toString();

				document.getElementById('loading').style.display = "none"; // Remove loading message
			}, 100);
		}
	}

	/**
	 * Algorithm
	 * Minimax principle
	 */
	maximizePlay(board: any, depth: number, alpha: number, beta: number): any {
		// Call score of our board
		var score = this.score(board[0]);

		// Break
		if (this.isFinished(depth, score)) return [null, score];

		// Column, Score
		var max = [null, Number.MIN_SAFE_INTEGER];

		// For all possible moves
		for (var column = 0; column < this.columns; ++column) {
			var new_board = this.copy(board[0], board[1]); // Create new board

			if (this.boardplace(new_board[0], new_board[1], column)) {

				++this.iterations; // Debug

				var next_move = this.minimizePlay(new_board, depth - 1, alpha, beta); // Recursive calling

				// Evaluate new move
				if (max[0] == null || next_move[1] > max[1]) {
					max[0] = column;
					max[1] = next_move[1];
					alpha = next_move[1];
				}

				if (alpha >= beta) return max;
			}
		}

		return max;
	}


	/*
	 * AI
	 */
	minimizePlay(board: any, depth: number, alpha: number, beta: number): any {
		var score = this.score(board[0]);

		if (this.isFinished(depth, score)) return [null, score];

		// Column, score
		var min = [null, Number.MAX_SAFE_INTEGER];

		for (var column = 0; column < this.columns; ++column) {
			var new_board = this.copy(board[0], board[1]);

			if (this.boardplace(new_board[0], new_board[1], column)) {

				++this.iterations;

				var next_move = this.maximizePlay(new_board, depth - 1, alpha, beta);

				if (min[0] == null || next_move[1] < min[1]) {
					min[0] = column;
					min[1] = next_move[1];
					beta = next_move[1];
				}

				if (alpha >= beta) return min;

			}
		}
		return min;
	}



	/*
	 * Switch player turn.
	 *
	 */
	switchRound(round: number): number {
		// 0 Human, 1 Computer
		if (round == 0) {
			return 1;
		} else {
			return 0;
		}
	}


	/*
	 * Clears the game board and resets status.
	 *
	 */
	resetBoard(): void {
		this.status = 0;
		this.round = this.navParams.data.first;

		var game_board = new Array(this.rows);
		for (var i = 0; i < game_board.length; ++i) {
			game_board[i] = new Array(this.columns);

			for (var j = 0; j < game_board[i].length; ++j) {
				game_board[i][j] = null;
				(<HTMLTableElement>document.getElementById('game_board')).rows[i].cells[j].className = 'empty';
				(<HTMLTableElement>document.getElementById('game_board')).rows[i].cells[j].style.background = '';
			}
		}

		this.board = game_board;
		document.getElementById('ai-iterations').innerHTML = "?";
		document.getElementById('ai-time').innerHTML = "?";
		document.getElementById('ai-column').innerHTML = "Column: ?";
		document.getElementById('ai-score').innerHTML = "Score: ?";
		document.getElementById('game_board').className = "";
		this.updateStatus();
	}


	/*
	 * Decides what do to after a round is finished.
	 * 1)Clear board for another round, 
	 * or 
	 * 2)Marks the winner of the game by checking player scores.
	 * 
	 */
	updateRound(): void {

		//If the round is over(win or tie)
		if (this.status == 1 || this.status == 2 || this.status == 3) {
			//if there are still rounds to play, increment round counter
			//and clear the game board.
			if (this.currentRound < this.rounds) {
				setTimeout(() => {
					++this.currentRound;
					this.resetBoard();
				}, 1000);
			}
			//otherwise state the winner of the game.
			else {
				if (this.player1Wins > this.player2Wins) {
					this.winner = 1;
				}
				else if (this.player2Wins > this.player1Wins) {
					this.winner = 2;
				}
				else {
					this.winner = 3;
				}

				if (this.opponent == 3 || this.opponent == 4)
					this.peer.destroy();
			}
		}

	}


	/*
	 * Status: 	0 - Running
	 *		1 - Human wins    (Player 1)
	 *		2 - Computer wins (Player 2)
	 *		3 - Tie
	 */
	updateStatus(): void {
		// Human won
		if (this.score(this.board) == -this.ascore) {
			this.status = 1;
			this.markWin();
			++this.player1Wins;

			let score = this.user.setscore(this.player1, 1);
			this.showAlert(this.player1 + " has won round " + this.currentRound + "!", "New high score of " + score + ".");
		}

		// Computer won
		if (this.score(this.board) == this.ascore) {
			this.status = 2;
			this.markWin();
			++this.player2Wins;

			let title = this.player2 + " has won round " + this.currentRound + "!";
			let message = "";
			if (this.opponent != 2) {
				let score = this.user.setscore(this.player2, 1);
				message = "New high score of " + score + "."
			}
			this.showAlert(title, message);
		}

		// Tie
		if (this.isFull(this.board)) {
			this.status = 3;
			++this.ties;

			this.showAlert("Tie!", "");
		}


		var html = document.getElementById('status');
		if (this.status == 0) {
			html.className = "status-running";
			html.innerHTML = "running";
		} else if (this.status == 1) {
			html.className = "status-won";
			html.innerHTML = "won";
		} else if (this.status == 2) {
			html.className = "status-lost";
			html.innerHTML = "lost";
		} else {
			html.className = "status-tie";
			html.innerHTML = "tie";
		}
	}

	markWin(): void {
		document.getElementById('game_board').className = "finished";
		for (var i = 0; i < this.winning_array.length; ++i) {
			var name = (<HTMLTableElement>document.getElementById('game_board')).rows[this.winning_array[i][0]].cells[this.winning_array[i][1]].className;
			(<HTMLTableElement>document.getElementById('game_board')).rows[this.winning_array[i][0]].cells[this.winning_array[i][1]].className = name + " win";
		}
	}

	/**
	 * Determines if situation is finished.
	 *
	 * @param {number} depth
	 * @param {number} score
	 * @return {boolean}
	 */
	isFinished(depth: number, score: number): boolean {
		if (depth == 0 || score == this.ascore || score == -this.ascore || this.isFull(this.board)) {
			return true;
		}
		return false;
	}

	/**
	 * Place in current board.
	 *
	 * @param {number} column
	 * @return {boolean} 
	 */
	boardplace(field: any, player: any, column: number): boolean {
		// Check if column valid
		// 1. not empty 2. not exceeding the board size
		if (field[0][column] == null && column >= 0 && column < this.columns) {
			// Bottom to top
			for (var y = this.rows - 1; y >= 0; --y) {
				if (field[y][column] == null) {
					field[y][column] = player; // Set current player coin
					break; // Break from loop after inserting
				}
			}
			player = this.switchRound(player);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Return a score for various positions (either horizontal, vertical or diagonal by moving through our board).
	 *
	 * @param {number} row
	 * @param {number} column
	 * @param {number} delta_y
	 * @param {number} delta_x
	 * @return {number}
	 */
	scorePosition(field: any, row: number, column: number, delta_y: number, delta_x: number): number {
		var human_points = 0;
		var computer_points = 0;

		// Save winning positions to arrays for later usage
		var winning_array_human = [];
		var winning_array_computer = [];

		// Determine score through amount of available chips
		for (var i = 0; i < 4; ++i) {
			if (field[row][column] == 0) {
				winning_array_human.push([row, column]);
				human_points++; // Add for each human chip
			} else if (field[row][column] == 1) {
				winning_array_computer.push([row, column]);
				computer_points++; // Add for each computer chip
			}

			// Moving through our board
			row += delta_y;
			column += delta_x;
		}

		// Marking winning/returning score
		if (human_points == 4) {
			this.winning_array = winning_array_human;
			// Computer won (100000)
			return -this.ascore;
		} else if (computer_points == 4) {
			this.winning_array = winning_array_computer;
			// Human won (-100000)
			return this.ascore;
		} else {
			// Return normal points
			return computer_points;
		}
	}

	/**
	 * Returns the overall score for our board.
	 *
	 * @return {number}
	 */
	score(field: any): number {
		var points = 0;

		var vertical_points = 0;
		var horizontal_points = 0;
		var diagonal_points1 = 0;
		var diagonal_points2 = 0;

		// Board-size: 7x6 (height x width)
		// Array indices begin with 0
		// => e.g. height: 0, 1, 2, 3, 4, 5

		// Vertical points
		// Check each column for vertical score
		// 
		// Possible situations
		//  0  1  2  3  4  5  6
		// [x][ ][ ][ ][ ][ ][ ] 0
		// [x][x][ ][ ][ ][ ][ ] 1
		// [x][x][x][ ][ ][ ][ ] 2
		// [x][x][x][ ][ ][ ][ ] 3
		// [ ][x][x][ ][ ][ ][ ] 4
		// [ ][ ][x][ ][ ][ ][ ] 5
		for (var row = 0; row < this.rows - 3; ++row) {
			// Für jede Column überprüfen
			for (var column = 0; column < this.columns; ++column) {
				// Die Column bewerten und zu den Punkten hinzufügen
				var score = this.scorePosition(field, row, column, 1, 0);
				if (score == this.ascore) return this.ascore;
				if (score == -this.ascore) return -this.ascore;
				vertical_points += score;
			}
		}

		// Horizontal points
		// Check each row's score
		// 
		// Possible situations
		//  0  1  2  3  4  5  6
		// [x][x][x][x][ ][ ][ ] 0
		// [ ][x][x][x][x][ ][ ] 1
		// [ ][ ][x][x][x][x][ ] 2
		// [ ][ ][ ][x][x][x][x] 3
		// [ ][ ][ ][ ][ ][ ][ ] 4
		// [ ][ ][ ][ ][ ][ ][ ] 5
		for (var row = 0; row < this.rows; ++row) {
			for (var column = 0; column < this.columns - 3; ++column) {
				var score = this.scorePosition(field, row, column, 0, 1);
				if (score == this.ascore) return this.ascore;
				if (score == -this.ascore) return -this.ascore;
				horizontal_points += score;
			}
		}



		// Diagonal points 1 (left-bottom)
		//
		// Possible situation
		//  0  1  2  3  4  5  6
		// [x][ ][ ][ ][ ][ ][ ] 0
		// [ ][x][ ][ ][ ][ ][ ] 1
		// [ ][ ][x][ ][ ][ ][ ] 2
		// [ ][ ][ ][x][ ][ ][ ] 3
		// [ ][ ][ ][ ][ ][ ][ ] 4
		// [ ][ ][ ][ ][ ][ ][ ] 5
		for (var row = 0; row < this.rows - 3; ++row) {
			for (var column = 0; column < this.columns - 3; ++column) {
				var score = this.scorePosition(field, row, column, 1, 1);
				if (score == this.ascore) return this.ascore;
				if (score == -this.ascore) return -this.ascore;
				diagonal_points1 += score;
			}
		}

		// Diagonal points 2 (right-bottom)
		//
		// Possible situation
		//  0  1  2  3  4  5  6
		// [ ][ ][ ][x][ ][ ][ ] 0
		// [ ][ ][x][ ][ ][ ][ ] 1
		// [ ][x][ ][ ][ ][ ][ ] 2
		// [x][ ][ ][ ][ ][ ][ ] 3
		// [ ][ ][ ][ ][ ][ ][ ] 4
		// [ ][ ][ ][ ][ ][ ][ ] 5
		for (var row = 3; row < this.rows; ++row) {
			for (var column = 0; column <= this.columns - 4; ++column) {
				var score = this.scorePosition(field, row, column, -1, +1);
				if (score == this.ascore) return this.ascore;
				if (score == -this.ascore) return -this.ascore;
				diagonal_points2 += score;
			}

		}

		points = horizontal_points + vertical_points + diagonal_points1 + diagonal_points2;
		return points;
	}

	/**
	 * Determines if board is full.
	 *
	 * @return {boolean}
	 */
	isFull(field: any): boolean {
		for (var i = 0; i < this.columns; ++i) {
			if (field[0][i] == null) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Returns a copy of our board.
	 *
	 * @return {Board}
	 */
	copy(field: any, player: number): any {
		var new_board = new Array();
		for (var i = 0; i < field.length; ++i) {
			new_board.push(field[i].slice());
		}
		return [new_board, player];
	}

	showAlert(title: string, message: string) {
		let alert = this.alertCtrl.create({
			title: title,
			message: message,
			buttons: ['OK']
		});
		alert.present();
	}

}
