function random(min, max) {
	return Math.floor(Math.random() * (max-min+1))+min;
}

function Card(suit, type) {
	this.suit = suit;
	this.type = type;
	this.number = this.type;
	this.color = "";
	this.flipped = false;
	this.canBeGrabbed = false;
	this.firstTime = true;
	this.originalX = 0;
	this.originalY = 0;
	this.x = 0;
	this.y = 0;
	this.width = 70;
	this.height = 100;
	this.placed = false;
	this.inStack = false;

	if (this.suit == "Spade" || this.suit == "Club") {
		this.color = "Black";
	} else {
		this.color = "Red";
	}

	switch (this.type) {
		case 1:
			this.type = "Ace";
			break;
		case 11:
			this.type = "Jack";
			break;
		case 12:
			this.type = "Queen";
			break;
		case 13:
			this.type = "King";
			break;
	}

	this.img = new Image(this.width, this.height);
	this.src = `${this.suit}${this.type}.png`;
	this.img.src = this.src;
}

Card.prototype.draw = function(x, y, condition, mouse) {
	if (this.placed) {
		if (!mouse) {
			if (this.suit == "Spade") {
				x = 300;
			} else if (this.suit == "Diamond") {
				x = 380;
			} else if (this.suit == "Club") {
				x = 460;
			} else if (this.suit == "Heart") {
				x = 540;
			}

			y = 20;

			this.x = x;
			this.y = y;

			this.originalX = x;
			this.originalY = y;
		}

		graphics.drawImage(this.img, x, y, this.width, this.height);
		graphics.beginPath();
		graphics.strokeStyle = "black";
		graphics.rect(x, y, this.width, this.height);
		graphics.stroke();
	} else if (condition) {
		graphics.drawImage(this.img, x, y, this.width, this.height);
		graphics.beginPath();
		graphics.strokeStyle = "black";
		graphics.rect(x, y, this.width, this.height);
		graphics.stroke();
	} else {
		graphics.strokeStyle = "white";
		graphics.fillStyle = "red";
		graphics.beginPath();
		graphics.rect(x, y, this.width, this.height);
		graphics.fill();
		graphics.stroke();
	}
}