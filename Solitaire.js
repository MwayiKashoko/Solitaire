/* Use different card images
Make it so cards don't overflow off of the screen
-- Make a win screen
Make it so cards that have been placed correctly can be used again
Allow changing the difficulty
Fix card selecting glitch
*/

const canvas = document.getElementById("canvas");
const graphics = canvas.getContext("2d");

(function() {
	const difficultySelect = document.getElementById("difficultySelect");
	const width = canvas.width;
	const height = canvas.height;

	//Easy is one draw while hard is 3 draw
	let difficulty = "easy";

	let originalCards = [];
	let shuffledCards = [];
	let usedIndexes = [];
	let cardsDisplayed = [];
	let cardStock = [];
	let cardWaste = [];
	let cardOnTop = null;
	let grabbedCard = null;
	let grabbedCards = [];

	let correctlyPlacedSpades = 0;
	let placedSpades = [];
	let correctlyPlacedDiamonds = 13;
	let placedHearts = [];
	let correctlyPlacedClubs = 26;
	let placedClubs = [];
	let correctlyPlacedHearts = 39;
	let placedDiamonds = [];
	let won = false;

	difficultySelect.onchange = function() {
		difficulty = difficultySelect.value;
	}

	canvas.addEventListener("click", function(mouse) {
		let mouseX = mouse.offsetX;
		let mouseY = mouse.offsetY;

		if (mouseX > 20 && mouseX < 90 && mouseY > 20 && mouseY < 120) {
			if (difficulty == "easy") {
				if (cardStock.length >= 1) {
					cardWaste.push(cardStock[cardStock.length-1]);
					cardStock.pop();

					cardOnTop = cardWaste[cardWaste.length-1];
				} else {
					for (let i = cardWaste.length-1; i >= 0; i--) {
						cardStock.push(cardWaste[i]);
					}

					cardWaste = [];

					cardOnTop = null;
				}
			} else if (difficulty == "hard") {
				if (cardStock.length >= 1) {
					let maxAmountOfCards = cardStock.length;

					if (maxAmountOfCards >= 3) {
						maxAmountOfCards = 3;
					} 

					for (let i = 0; i < maxAmountOfCards; i++) {
						cardWaste.push(cardStock[cardStock.length-1]);
						cardStock.pop();
					}

					cardOnTop = cardWaste[cardWaste.length-1];
				} else {
					for (let i = cardWaste.length-1; i >= 0; i--) {
						cardStock.push(cardWaste[i]);
					}

					cardWaste = [];

					cardOnTop = null;
				}
			}
		}
	});

	let mouseDown = false;
	let mouseX = 0;
	let offsetX = 0;
	let mouseY = 0;
	let offsetY = 0;

	let fromPlaced = false;

	const getMousePos = (evt) => {
		const rect = canvas.getBoundingClientRect();

		return {
			x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
			y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
		};
	}

	canvas.addEventListener("mousedown", function(mouse) {
		mouseDown = true;
		let index = 0;

		//let mouseX = mouse.offsetX;
		//let mouseY = mouse.offsetY;

		let m = getMousePos(mouse);
		mouseX = m.x;
		mouseY = m.y;

		graphics.fillRect(mouseX, mouseY, 20, 20);

		let area;

		fromPlaced = false;

		if (mouseX <= 95 && mouseY <= 120) {
			area = "cardStock";
		} else if (mouseX >= 95 && mouseX <= 290 && mouseY <= 130) {
			area = "cardWaste";
		} else if (mouseY >= 150) {
			area = "cardsDisplayed";
		} else if (mouseX >= 300 && mouseY <= 125) {
			area = "placed";
		}

		if (area == "cardWaste" && cardWaste.length > 0) {
			let lastCard = cardWaste[cardWaste.length-1];

			if(mouseX >= lastCard.originalX && mouseX <= lastCard.originalX+lastCard.width && mouseY >= lastCard.originalY && mouseY <= lastCard.originalY+lastCard.height) {
				grabbedCard = lastCard;
			}
		} else if (area == "cardsDisplayed") {
			let hasGrabbed = false;

			for (let i = 0; i < cardsDisplayed.length; i++) {
				if (hasGrabbed) {
					break;
				}

				for (let j = 0; j < cardsDisplayed[i].length; j++) {
					if(cardsDisplayed[i][j].flipped && mouseX >= cardsDisplayed[i][j].originalX && mouseX <= cardsDisplayed[i][j].originalX+cardsDisplayed[i][j].width && mouseY >= cardsDisplayed[i][j].originalY && mouseY <= cardsDisplayed[i][j].originalY+cardsDisplayed[i][j].height) {
						grabbedCard = cardsDisplayed[i][j];

						for (let k = j; k >= 0; k--) {
							grabbedCards.push(cardsDisplayed[i][k]);
						}

						hasGrabbed = true;
						break;
					}
				}
			}
		} else if (area == "placed") {
			let foundCard = false;

			let lastCard;

			let suitList = [placedSpades, placedDiamonds, placedClubs, placedHearts];

			for (let i = 0; i < suitList.length; i++) {
				if (foundCard) {
					break;
				}

				if (suitList[i].length > 0 && !foundCard) {
					lastCard = suitList[i][suitList[i].length-1];

					if(mouseX >= lastCard.originalX && mouseX <= lastCard.originalX+lastCard.width && mouseY >= lastCard.originalY && mouseY <= lastCard.originalY+lastCard.height) {
						grabbedCard = lastCard;
						foundCard = true;
						fromPlaced = true;
					}
				}
			}
		}

		if (grabbedCard) {
			//offsetX = mouseX-grabbedCard.originalX;
			//offsetY = mouseY-grabbedCard.originalY;
		}
	});

	canvas.addEventListener("mousemove", function(mouse) {
		//mouseX = mouse.offsetX;
		//mouseY = mouse.offsetY;

		let m = getMousePos(mouse);
		mouseX = m.x;
		mouseY = m.y;
	});

	document.addEventListener("mouseup", function(mouse) {
		if (grabbedCard != null) {
			let m = getMousePos(mouse);
			const mouseX = m.x;
			const mouseY = m.y;
			checkConditions(mouseX, mouseY);
		}

		mouseDown = false;
		grabbedCard = null;
		grabbedCards = [];
	});

	for (let i = 0; i < 7; i++) {
		cardsDisplayed.push([]);
	}

	for (let i = 1; i < 14; i++) {
		originalCards.push(new Card("Spade", i));
	}

	for (let i = 1; i < 14; i++) {
		originalCards.push(new Card("Diamond", i));
	}

	for (let i = 1; i < 14; i++) {
		originalCards.push(new Card("Club", i));
	}

	for (let i = 1; i < 14; i++) {
		originalCards.push(new Card("Heart", i));
	}

	function shuffleCards() {
		shuffledCards = [];
		usedIndexes = [];
		let flipIndex = 1;
		let flipCount = 7;

		while (shuffledCards.length < 52) {
			let index = random(0, 51);
			let used = false;

			for (let i = 0; i < usedIndexes.length; i++) {
				if (index == usedIndexes[i]) {
					used = true;
				}
			}

			if (!used) {
				shuffledCards.push(originalCards[index]);
				usedIndexes.push(index);

				if (shuffledCards.length == flipIndex) {
					shuffledCards[shuffledCards.length-1].flipped = true;

					flipIndex += flipCount;
					flipCount--;
				}
			}
		}

		let k = 0;

		for (let i = 0; i < cardsDisplayed.length; i++) {
			for (let j = i; j < 7; j++) {
				cardsDisplayed[i].push(shuffledCards[k]);
				k++;
			}
		}

		for (let i = k; i < shuffledCards.length; i++) {
			cardStock.push(shuffledCards[i]);
		}
	}

	shuffleCards();

	function reset() {
		//originalCards = [];
		shuffledCards = [];
		usedIndexes = [];
		cardsDisplayed = [];

		for (let i = 0; i < 7; i++) {
			cardsDisplayed.push([]);
		}

		cardStock = [];
		cardWaste = [];
		cardOnTop = null;
		grabbedCard = null;
		grabbedCards = [];

		correctlyPlacedSpades = 0;
		placedSpades = [];
		correctlyPlacedDiamonds = 13;
		placedHearts = [];
		correctlyPlacedClubs = 26;
		placedClubs = [];
		correctlyPlacedHearts = 39;
		placedDiamonds = [];
		won = false;

		originalCards.forEach((card, i, arr) => {
			arr[i].flipped = false;
			arr[i].canBeGrabbed = false;
			arr[i].firstTime = true;
			arr[i].placed = false;
			arr[i].inStack = false;
		});

		shuffleCards();
	}

	function updateCards() {
		for (let i = 0; i < originalCards.length; i++) {
			originalCards[i].canBeGrabbed = false;
		}

		if (cardWaste.length >= 1) {
			cardWaste[cardWaste.length-1].canBeGrabbed = true;
		}

		for (let i = 0; i < cardsDisplayed.length; i++) {
			if (cardsDisplayed[i].length > 0) {
				cardsDisplayed[i][0].flipped = true;

				for (let j = 0; j < cardsDisplayed[i].length; j++) {
					if (cardsDisplayed[i][j].flipped) {
						cardsDisplayed[i][j].canBeGrabbed = true;
					}
				}
			}
		}

		for (let i = 0; i < placedSpades.length; i++) {
			placedSpades[i].canBeGrabbed = true;
		}

		for (let i = 0; i < placedDiamonds.length; i++) {
			placedDiamonds[i].canBeGrabbed = true;
		}

		for (let i = 0; i < placedClubs.length; i++) {
			placedClubs[i].canBeGrabbed = true;
		}

		for (let i = 0; i < placedHearts.length; i++) {
			placedHearts[i].canBeGrabbed = true;
		}

		let lengthX = cardsDisplayed.length;

		for (let i = 0; i < lengthX; i++) {
			let lengthY = cardsDisplayed[i].length;

			for (let j = 0; j < lengthY; j++) {
				cardsDisplayed[i][lengthY-j-1].originalX = (lengthX-i)*80+100;
				cardsDisplayed[i][lengthY-j-1].originalY = j*40+150;
			}
		}

		for (let i = 0; i < cardStock.length; i++) {
			cardStock[i].originalX = 20;
			cardStock[i].originalY = 20;
		}

		let maxSubtractedCards = cardWaste.length;

		if (maxSubtractedCards >= 3) {
			maxSubtractedCards = 3;
		}

		for (let i = cardWaste.length-maxSubtractedCards; i < cardWaste.length; i++) {
			cardWaste[i].originalX = 250+(i-cardWaste.length)*40;
		}

		if (difficulty == "easy" && cardWaste.length > 0) {
			cardWaste[cardWaste.length-1].originalX = 100;
		}
	}

	function checkConditions(mouseX, mouseY) {
		if (mouseY > 20 && mouseY < 120) {
			if (grabbedCard == originalCards[correctlyPlacedSpades]) {
				if (mouseX > 300 && mouseX < 370) {
					grabbedCard.placed = true;
					grabbedCard.originalX = 300;
					grabbedCard.originalY = 20;
					placedSpades.push(grabbedCard);
					correctlyPlacedSpades++;
				}
			} else if (grabbedCard == originalCards[correctlyPlacedDiamonds]) {
				if (mouseX > 380 && mouseX < 450) {
					grabbedCard.placed = true;
					grabbedCard.originalX = 380;
					grabbedCard.originalY = 20;
					placedDiamonds.push(grabbedCard);
					correctlyPlacedDiamonds++;
				}
			} else if (grabbedCard == originalCards[correctlyPlacedClubs]) {
				if (mouseX > 460 && mouseX < 530) {
					grabbedCard.placed = true;
					grabbedCard.originalX = 460;
					grabbedCard.originalY = 20;
					placedClubs.push(grabbedCard);
					correctlyPlacedClubs++;
				}
			} else if (grabbedCard == originalCards[correctlyPlacedHearts]) {
				if (mouseX > 540 && mouseX < 610) {
					grabbedCard.placed = true;
					grabbedCard.originalX = 540;
					grabbedCard.originalY = 20;
					placedHearts.push(grabbedCard);
					correctlyPlacedHearts++;
				}
			}
		}

		if (grabbedCard.placed) {
			for (let i = 0; i < cardsDisplayed.length; i++) {
				if (cardsDisplayed[i].indexOf(grabbedCard) >= 0) {
					cardsDisplayed[i].splice(cardsDisplayed[i].indexOf(grabbedCard), 1);
				}
			}

			if (cardWaste.indexOf(grabbedCard) >= 0) {
				cardWaste.splice(cardWaste.indexOf(grabbedCard), 1);
			}

			let newCard = grabbedCard;

			if (!newCard.inStack) {
				setTimeout(() => newCard.inStack = true, 500);
			}
		}

		if (grabbedCard.inStack) {
			let foundMatch = false;

			for (let i = 0; i < cardsDisplayed.length; i++) {
				if (foundMatch) {
					break;
				}

				for (let j = 0; j < cardsDisplayed[i].length; j++) {
					if (mouseX >= cardsDisplayed[i][j].originalX && mouseX <= cardsDisplayed[i][j].originalX+cardsDisplayed[i][j].width && mouseY >= cardsDisplayed[i][j].originalY && mouseY <= cardsDisplayed[i][j].originalY+cardsDisplayed[i][j].height) {
						cardsDisplayed[i].unshift(grabbedCard);

						if (grabbedCard.suit == "Spade") {
							placedSpades.pop();
							correctlyPlacedSpades--;
						} else if (grabbedCard.suit == "Diamond") {
							placedDiamonds.pop();
							correctlyPlacedDiamonds--;
						} else if (grabbedCard.suit == "Club") {
							placedClubs.pop();
							correctlyPlacedClubs--;
						} else {
							placedHearts.pop();
							correctlyPlacedHearts--;
						}

						grabbedCard.placed = false;
						grabbedCard.inStack = false;
						foundMatch = true;
						break;
					}
				}
			}
		}

		if (grabbedCard.type == "King") {
			for (let i = 0; i < cardsDisplayed.length; i++) {
				if (cardsDisplayed[i].length == 0) {
					if (mouseX > (cardsDisplayed.length-i)*80+100 && mouseX < (cardsDisplayed.length-i)*80+170 && mouseY > 150 && mouseY < 250) {
						if (cardWaste.indexOf(grabbedCard) >= 0) {
							cardWaste.splice(cardWaste.indexOf(grabbedCard), 1);
							cardsDisplayed[i].push(grabbedCard);
						} else {
							for (let j = 0; j < cardsDisplayed.length; j++) {
								let conditionMet = false;

								if (cardsDisplayed[j].indexOf(grabbedCard) >= 0) {
									conditionMet = true;

									for (let k = cardsDisplayed[j].indexOf(grabbedCard); k >= 0; k--) {
										cardsDisplayed[i].unshift(cardsDisplayed[j][k]);
										cardsDisplayed[j].splice(cardsDisplayed[j].indexOf(cardsDisplayed[j][k]), 1);
									}
								}

								if (conditionMet) {
									break;
								}
							}
						}
					}
				}
			}
		} else {
			for (let i = 0; i < cardsDisplayed.length; i++) {
				if (cardsDisplayed[i].length >= 1) {
					if (mouseX > (cardsDisplayed.length-i)*80+100 && mouseX < (cardsDisplayed.length-i)*80+180 && mouseY > cardsDisplayed[i][0].originalY && mouseY < cardsDisplayed[i][0].originalY+100) {
						if (grabbedCard.color != cardsDisplayed[i][0].color && grabbedCard.number == cardsDisplayed[i][0].number-1) {
							if (cardWaste.indexOf(grabbedCard) >= 0) {
								cardWaste.splice(cardWaste.indexOf(grabbedCard), 1);
								cardsDisplayed[i].unshift(grabbedCard);
							} else {
								for (let j = 0; j < cardsDisplayed.length; j++) {
									let conditionMet = false;

									if (cardsDisplayed[j].indexOf(grabbedCard) >= 0) {
										conditionMet = true;

										for (let k = cardsDisplayed[j].indexOf(grabbedCard); k >= 0; k--) {
											cardsDisplayed[i].unshift(cardsDisplayed[j][k]);
											cardsDisplayed[j].splice(cardsDisplayed[j].indexOf(cardsDisplayed[j][k]), 1);
										}
									}

									if (conditionMet) {
										break;
									}
								}
							}
						}
					}
				}
			}
		}
	}

	function displayCards() {
		for (let i = 0; i < 4; i++) {
			graphics.strokeStyle = "white";
			graphics.beginPath();
			graphics.rect(i*80+300, 20, 70, 100);
			graphics.stroke();
		}

		graphics.fillStyle = "white";
		graphics.font = "50px sans-serif";
		graphics.fillText("S", 315, 80);
		graphics.fillText("D", 395, 80);
		graphics.fillText("C", 475, 80);
		graphics.fillText("H", 555, 80);

		if (placedSpades.length > 0 && placedSpades[placedSpades.length-1] != grabbedCard) {
			placedSpades[placedSpades.length-1].draw(0, 0, false);
		} 

		if (placedHearts.length > 0 && placedHearts[placedHearts.length-1] != grabbedCard) {
			placedHearts[placedHearts.length-1].draw(0, 0, false);
		} 

		if (placedClubs.length > 0 && placedClubs[placedClubs.length-1] != grabbedCard) {
			placedClubs[placedClubs.length-1].draw(0, 0, false);
		}

		if (placedDiamonds.length > 0 && placedDiamonds[placedDiamonds.length-1] != grabbedCard) {
			placedDiamonds[placedDiamonds.length-1].draw(0, 0, false);
		}

		let lengthX = cardsDisplayed.length;

		for (let i = 1; i < 8; i++) {
			graphics.beginPath();
			graphics.rect(i*80+100, 150, 70, 100);
			graphics.stroke();
		}

		for (let i = 0; i < lengthX; i++) {
			let lengthY = cardsDisplayed[i].length;

			for (let j = 0; j < lengthY; j++) {
				if (cardsDisplayed[i][lengthY-j-1] != grabbedCard) {

					if (grabbedCards.indexOf(cardsDisplayed[i][lengthY-j-1]) == -1) {
						cardsDisplayed[i][lengthY-j-1].draw((lengthX-i)*80+100, j*40+150, cardsDisplayed[i][lengthY-j-1].flipped);
					}
				}
			}
		}

		graphics.beginPath();
		graphics.strokeStyle = "white";
		graphics.rect(20, 20, 70, 100);
		graphics.stroke();

		if (cardStock.length >= 1) {
			cardStock[0].draw(20, 20, false);
		}

		if (difficulty == "easy" && cardWaste.length >= 1) {
			if (cardWaste.length >= 2) {
				cardWaste[cardWaste.length-2].draw(100, 20, true);
			}

			if (grabbedCard != cardWaste[cardWaste.length-1]) {
				cardWaste[cardWaste.length-1].draw(100, 20, true);
			}
		} else if (difficulty == "hard") {
			let maxSubtractedCards = cardWaste.length;

			if (maxSubtractedCards >= 3) {
				maxSubtractedCards = 3;
			}

			for (let i = cardWaste.length-maxSubtractedCards; i < cardWaste.length; i++) {
				if (difficulty == "hard") {
					if (grabbedCard != cardWaste[i]) {
						cardWaste[i].draw(250+(i-cardWaste.length)*40, 20, true);
					}
				}
			}
		}

		if (grabbedCard != null) {
			if (fromPlaced && grabbedCard.number > 1) {
				let cardUnder = new Image();
				let suit = eval(`placed${grabbedCard.suit}s`);

				cardUnder.src = suit.at(-2).src;

				graphics.drawImage(cardUnder, grabbedCard.originalX, grabbedCard.originalY, 70, 100);
			}
			
			grabbedCard.draw(mouseX-grabbedCard.width/2, mouseY-grabbedCard.height/2, true, true);
		}

		if (grabbedCards.length > 0) {
			for (let i = 0; i < grabbedCards.length; i++) {
				grabbedCards[i].draw(mouseX-grabbedCards[i].width/2, i*40+mouseY-grabbedCards[i].height/2, true);
			}
		}
	}

	function youWon() {
		alert("You Win!!!");
		win = true;
	}

	function draw() {
	    graphics.clearRect(0, 0, width, height);

	    updateCards();
	    displayCards();

	    if (correctlyPlacedSpades == 13 && correctlyPlacedDiamonds == 26 && correctlyPlacedClubs == 39 && correctlyPlacedHearts == 52 && !won) {
	    	youWon();
	    }
	}

	function update() {
	    draw();

	    requestAnimationFrame(update);
	}

	update();
})();
