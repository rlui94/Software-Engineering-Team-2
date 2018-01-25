import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { User } from './../../providers/user';

@Component({
  selector: 'page-game',
  templateUrl: 'game.html'
})
export class GamePage {
  rows: number = 8; // Height
  arows: any = [];
  columns: number = 10; // Width
  acolumns: any = [];
  status: number = 0; // 0: running, 1: won, 2: lost, 3: tie
  depth: number = 4; // Search depth
  ascore: number = 100000; // Win/loss score
  round: number = 0; // 0: Human, 1: Computer
  winning_array: number[] = []; // Winning (chips) array
  iterations: number = 0; // Iteration count
  opponent: number = 2;
  board: any;
  player1: string;
  player2: string;
  rounds: number = 1;
  currentRound: number = 1;
  player1Wins: number = 0;
  player2Wins: number = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, private user: User) {
    
  }
  
  ngOnInit() {
    this.player1 = this.navParams.data.player1;
	this.player2 = this.opponent == 2 ? "Computer" : this.navParams.data.player2;
	this.rounds = this.navParams.data.rounds;
	
	// Dropdown value
	this.opponent = this.navParams.data.opponent;
	var boardsize = this.navParams.data.size;
	if (boardsize == 1)
	{
		this.rows = 6;
		this.columns = 7;
	}
	else if (boardsize == 2)
	{
		this.rows = 7;
		this.columns = 8;
	}
	else if (boardsize == 3)
	{
		this.rows = 8;
		this.columns = 10;
	}
	this.arows = Array(this.rows);
	this.acolumns = Array(this.columns);
	this.status = 0;
	this.round = this.navParams.data.first;
	this.init();
	document.getElementById('current-round').innerHTML = this.currentRound.toString();
	document.getElementById('total-rounds').innerHTML = this.rounds.toString();
	document.getElementById('player-one-wins').innerHTML = this.player1Wins.toString();
	document.getElementById('player-two-wins').innerHTML = this.player2Wins.toString();
	//document.getElementById('ai-iterations').innerHTML = "?";
	//document.getElementById('ai-time').innerHTML = "?";
	//document.getElementById('ai-column').innerHTML = "Column: ?";
	//document.getElementById('ai-score').innerHTML = "Score: ?";
	//document.getElementById('game_board').className = "";
	this.updateStatus();
	
	this.init();
  }

	init(): void {
		// Generate 'real' board
		// Create 2-dimensional array
		var game_board = new Array(this.rows);
		for (var i = 0; i < game_board.length; i++) {
			game_board[i] = new Array(this.columns);

			for (var j = 0; j < game_board[i].length; j++) {
				game_board[i][j] = null;
			}
		}

		// Create from board object (see board.js)
		this.board = game_board;

		/*// Generate visual board
		var agame_board = "";
		for (var i = 0; i < this.rows; i++) {
			agame_board += "<tr>";
			for (var j = 0; j < this.columns; j++) {
				agame_board += "<td class='empty'></td>";
			}
			agame_board += "</tr>";
		}

		document.getElementById('game_board').innerHTML = agame_board;

		// Action listeners
		var td = document.getElementById('game_board').getElementsByTagName("td");

		for (var i = 0; i < td.length; i++) {
			if (td[i].addEventListener) {
				td[i].addEventListener('click', (e:Event) => { this.act(e) }, false);
			}
		}*/
	}

	/**
	 * On-click event
	 */
	act(e: Event): void {
		var element = e.target || window.event.srcElement;

		if (this.opponent == 1)
		{
			this.place((<HTMLTableCellElement>element).cellIndex);
		}
		else if (this.opponent == 2)
		{
			
			// Human round
			if (this.round == 0) this.place((<HTMLTableCellElement>element).cellIndex);
			
			setTimeout(() => {
				// Computer round
				if (this.round == 1) this.generateComputerDecision();
			}, 1000);
		}
	}

	place(column: number): void {
		// If not finished
		if (this.score(this.board) != this.ascore && this.score(this.board) != -this.ascore && !this.isFull(this.board)) {
			var ay = 0;
			
			for (var y = this.rows - 1; y >= 0; y--) {
				if ((<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].className == 'empty') {
					ay = y;
					break;
				}
			}
			
			this.dropLoop(0, column, ay);
		}
	}
	
	dropLoop(y: number, column: number, ay: number) {
		setTimeout(() => {
			if(y != 0)
				(<HTMLTableElement>document.getElementById('game_board')).rows[y-1].cells[column].className = 'empty';
			
			if (this.round == 1) {
				(<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].className = 'coin computer-coin';
			} else {
				(<HTMLTableElement>document.getElementById('game_board')).rows[y].cells[column].className = 'coin human-coin';
			}
			
			if(y < ay)
				this.dropLoop(y + 1, column, ay);
			else
			{
				if (!this.boardplace(this.board, this.round, column)) {
					return alert("Invalid move.");
				}

				this.round = this.switchRound(this.round);
				this.updateStatus();
			}
		}, 50);
	}

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
		for (var column = 0; column < this.columns; column++) {
			var new_board = this.copy(board[0], board[1]); // Create new board

			if (this.boardplace(new_board[0], new_board[1], column)) {

				this.iterations++; // Debug

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

	minimizePlay(board: any, depth: number, alpha: number, beta: number): any {
		var score = this.score(board[0]);

		if (this.isFinished(depth, score)) return [null, score];

		// Column, score
		var min = [null, Number.MAX_SAFE_INTEGER];

		for (var column = 0; column < this.columns; column++) {
			var new_board = this.copy(board[0], board[1]);

			if (this.boardplace(new_board[0], new_board[1], column)) {

				this.iterations++;

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

	switchRound(round: number): number {
		// 0 Human, 1 Computer
		if (round == 0) {
			return 1;
		} else {
			return 0;
		}
	}


	newBoard(): void {
		var game_board = new Array(this.rows);
		for (var i = 0; i < game_board.length; i++) {
			game_board[i] = new Array(this.columns);

			for (var j = 0; j < game_board[i].length; j++) {
				game_board[i][j] = null;
				(<HTMLTableElement>document.getElementById('game_board')).rows[i].cells[j].className = 'empty';
			}
		}

		// Create from board object (see board.js)
		this.board = game_board;

	}

	updateStatus(): void {
		// Human won
		var roundEnd = false;
		if (this.score(this.board) == -this.ascore) {
			this.status = 1;
			this.markWin();
			alert(this.player1 + " has won!");
			this.user.setscore(this.player1, 1);
			roundEnd = true;
			this.player1Wins += 1;
			document.getElementById('player-one-wins').innerHTML = this.player1Wins.toString();
		}

		// Computer won
		if (this.score(this.board) == this.ascore) {
			this.status = 2;
			this.markWin();
			alert(this.player2 + " has won!");
			if (this.opponent != 2)
				this.user.setscore(this.player2, 1);
			roundEnd = true;
			this.player2Wins += 1;
			document.getElementById('player-two-wins').innerHTML = this.player2Wins.toString();
		}

		// Tie
		if (this.isFull(this.board)) {
			this.status = 3;
			alert("Tie!");
			roundEnd = true;
		}

		//When a round ends, clear the board and go to next round.
		if(roundEnd){
			if(this.currentRound < this.rounds){
				this.currentRound += 1;
				document.getElementById('current-round').innerHTML = this.currentRound.toString();
				this.newBoard();
			}
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
		for (var i = 0; i < this.winning_array.length; i++) {
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
			for (var y = this.rows - 1; y >= 0; y--) {
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
		for (var i = 0; i < 4; i++) {
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
		for (var row = 0; row < this.rows - 3; row++) {
			// Für jede Column überprüfen
			for (var column = 0; column < this.columns; column++) {
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
		for (var row = 0; row < this.rows; row++) {
			for (var column = 0; column < this.columns - 3; column++) { 
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
		for (var row = 0; row < this.rows - 3; row++) {
			for (var column = 0; column < this.columns - 3; column++) {
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
		for (var row = 3; row < this.rows; row++) {
			for (var column = 0; column <= this.columns - 4; column++) {
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
		for (var i = 0; i < this.columns; i++) {
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
		for (var i = 0; i < field.length; i++) {
			new_board.push(field[i].slice());
		}
		return [new_board, player];
	}

}
