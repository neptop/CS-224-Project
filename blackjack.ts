import * as readline from 'readline';

enum cardSuit {
	Hearts,
	Spades,
	Clubs,
	Diamonds
}

enum cardRank {
	Ace = 1, // ace can be 1 or 11, handled in scoring
	Two = 2,
	Three = 3,
	Four = 4,
	Five = 5,
	Six = 6,
	Seven = 7,
	Eight = 8,
	Nine = 9,
	Ten = 10,
	Jack = 10,
	Queen = 10,
	King = 10,
}

class Card {
	suit: cardSuit;
	rank: cardRank;

	constructor(suit:cardSuit, rank:cardRank) {
		this.suit = suit;
		this.rank = rank;
	}

	// returns value of card
	get value():number{
		return this.rank;
	}

	// converts card to string
	toString(): string{
		return ` ${cardRank[this.rank]} of ${cardSuit[this.suit]}`;

	}

}

class Deck {
	cards:Card[]=[];
	constructor() {
		this.initDeck();
	}
	// fills deck with 1 of each card from each suit and rank
	initDeck(){
    // iterate over the suit and rank values
    Object.values(cardSuit).forEach(suit => {
        if (typeof suit === 'number') {
            Object.values(cardRank).forEach(rank => {
                if (typeof rank === 'number') { 
                    this.cards.push(new Card(suit, rank));
                }
            });
        }
    });
}


	// randomizes order of cards
	shuffle(){
		for(let i = this.cards.length - 1; i > 0; i--){
			const j = Math.floor(Math.random()*(i+1));
			[this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
		}
	}

	// removes and returns the last card in deck. If the deck is empty then it is undefined
	deal(): Card | undefined{	
		return this.cards.pop();
	}
}

// 
class Player{
	hand: Card[] = [];
	name: string; // name of dealer of player

	constructor(name:string){
		this.name = name;
	}

	drawCard(card:Card){
		this.hand.push(card);
	}

	get score(): number{
		let score = 0;
		let aceCount = 0; // tracks # of aces in hand n adjusts value if needed
		for (const card of this.hand) {
			score += card.value;
			if(card.rank == cardRank.Ace){
				aceCount++;
			}
		}
		//if score is > 21 and results in a bust adjust the score of Ace from 11 to 1
		while (score > 21 && aceCount > 0){
			score -= 10;
			aceCount--;
		}
		return score;
	}

	//returns the player's hand
	playerHand(): string {
		return this.hand.map(card => card.toString()).join(',');
	}
}

// game logic
class Main {
	private rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});


	player:Player;
	dealer:Player;
	deck: Deck;

	constructor() {
		this.deck = new Deck();
		this.player = new Player("Player")
		this.dealer = new Player("Dealer")
	}

	// initializes and starts game
	async startGame() {
		this.deck.shuffle();
		this.dealCards();
		this.showCards();
	
	await this.playerTurn();
		if (this.player.score <= 21) {
			this.dealerTurn();
		}
		this.outcome();
		this.rl.close();
	}

	// deals card to player and dealer
	private dealCards() {
		for (let i = 0; i < 2; i++) {
			this.player.drawCard(this.deck.deal()!);
			this.dealer.drawCard(this.deck.deal()!);
		}
	}
	// shows both cards from player and only 1 card from dealer
	private showCards() {
		console.log(`Dealer's card: ${this.dealer.hand[1]?.toString()}`);
		console.log(`Player's cards: ${this.player.playerHand()}, Score: ${this.player.score}`);

	}
	// player logic hit or stay
	private async playerTurn () {
		let playerMove: string;
		do {
			playerMove = await this.getPlayerMove();
			if (playerMove == 'h') {
				this.player.drawCard(this.deck.deal()!);
				console.log(`Player hit: ${this.player.playerHand()}, Score: ${this.player.score}`);
				if (this.player.score > 21) {
					console.log("Player bust");
					break;
				}
			}
		}
		while (playerMove !== 's')
	}

	private getPlayerMove(): Promise<string> {
		return new Promise((resolve) => {
			this.rl.question('Select to (h)it or (s)tay. ', (answer) => {
				resolve(answer.trim().toLowerCase());
			})
		})
	}


	// sims dealer's turn, hits until a score of 17+
	private dealerTurn() {
		console.log(`Dealer's hand: ${this.dealer.playerHand()}, Score: ${this.dealer.score}`);
		while (this.dealer.score < 17) {
			this.dealer.drawCard(this.deck.deal()!);
			console.log(`Dealer hits: ${this.dealer.playerHand()}, Score: ${this.dealer.score}`);
		}
		if (this.dealer.score > 21){
			console.log("Dealer bust");
		}
	}
	// calculates outcome
	private outcome() {
		if (this.player.score > 21) {
			console.log("Dealer wins");
		}
		else if (this.player.score > this.dealer.score || this.dealer.score > 21){
			console.log("Player wins");
		}
		else if (this.player.score < this.dealer.score) {
			console.log("Dealer wins");
		}
		else {
			console.log("Player and Dealer push")
		}
	}
}

// runs game
const game = new Main();
game.startGame().catch(err => console.error(err));


