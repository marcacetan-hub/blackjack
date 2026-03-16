const suits = ["S", "C", "D", "H"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let wins = 0;
let loss = 0;
let showDealer = false;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const createDeck = () => {
    const deck = [];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            let value;

            if (rank === "A") {
                value = 11;
            } else if (["J", "Q", "K"].includes(rank)) {
                value = 10;
            } else {
                value = Number(rank);
            };

            deck.push({
                rank: rank,
                suit: suit,
                value: value,
                img: `/images/cards/${rank}-${suit}.png`
            });
        };
    };

    return deck;
};

const shuffle = deck => {
    for (let i = deck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    };
    return deck;
};

const drawCard = () => deck.pop();

const calculateHandValue = hand => {
    let total = 0;
    let aceCount = 0;

    for (let card of hand) {
        total += card.value;
        if (card.rank === "A") {
            aceCount++;
        };
    };

    while (total > 21 && aceCount > 0) {
        total -= 10;
        aceCount--;
    };

    return total;
};

const startGame = () => {
    deck = shuffle(createDeck());

    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];

    gameOver = false;
    showDealer = false;

    document.getElementById("hit-btn").disabled = false;
    document.getElementById("stay-btn").disabled = false;

    textNumbers();
    renderPlayerHand();
    renderDealerHand(false);
};

const playerHit = () => {
    if (gameOver) return;

    playerHand.push(drawCard());
    renderPlayerHand();

    if (calculateHandValue(playerHand) > 21) {
        playerBust();
        gameOver = true;
        document.getElementById("hit-btn").disabled = true;
        document.getElementById("stay-btn").disabled = true;
        showDealer = true;
        renderDealerHand(true);
    };
    textNumbers();
};

const playerStay = () => {
    showDealer = true;
    endGame();
    renderDealerHand(true);
    textNumbers();
};

const renderPlayerHand = () => {
    const container = document.getElementById("player-cards");
    container.innerHTML = "";

    playerHand.forEach(card => {
        const img = document.createElement("img");
        img.src = card.img;
        img.classList.add("card");
        img.width = 100;
        container.appendChild(img);
    });
};

const renderDealerHand = (reveal = false) => {
    const container = document.getElementById("dealer-cards");
    container.innerHTML = "";

    dealerHand.forEach((card, index) => {
        const img = document.createElement("img");
        img.classList.add("card");
        img.width = 100;

        if (index !== 0 && !reveal) {
            img.src = "/images/cards/back.png";
        } else {
            img.src = card.img;
        }

        container.appendChild(img);
    });
};

const textNumbers = () => {
    document.getElementById("loss").textContent = loss;
    document.getElementById("wins").textContent = wins;
    if (showDealer) {
        document.getElementById("dealer-sum").textContent = calculateHandValue(dealerHand);
    } else {
        document.getElementById("dealer-sum").textContent = "[HIDDEN]"
    }
    document.getElementById("player-sum").textContent = calculateHandValue(playerHand);
};

const endGame = async () => {
    let dealerTotal = calculateHandValue(dealerHand);
    let playerTotal = calculateHandValue(playerHand);

    document.getElementById("hit-btn").disabled = true;
    document.getElementById("stay-btn").disabled = true;

    showDealer = true;
    for (let i = 1; i < dealerHand.length; i++){
        await delay(500);
        renderDealerHand(true);
        textNumbers();
    }

    while (dealerTotal < 17) {
        await delay(500);
        dealerHand.push(drawCard());
        dealerTotal = calculateHandValue(dealerHand);
        renderDealerHand(true);
        textNumbers();
    };
    
    if (dealerTotal > 21){
        dealerBust();
    } else if (dealerTotal < playerTotal) {
        playerWin();
    } else if (dealerTotal === playerTotal) {
        playerPush();
    } else {
        playerLose();
    };

    textNumbers();
};

const dealerBust = () => {
    console.log("Dealer busts!")
    playerWin();
};

const playerBust = () => {
    console.log("Player busts!")
    playerLose();
};

const playerLose = () => {
    loss++
    console.log("Player loses!")
    textNumbers();
};

const playerPush = () => {
    console.log("Player pushes!")
    textNumbers();
};

const playerWin = () => {
    wins++;
    console.log("Player wins!");
    textNumbers();
};

document.getElementById("hit-btn").addEventListener("click", playerHit);
document.getElementById("stay-btn").addEventListener("click", playerStay);
document.getElementById("new-btn").addEventListener("click", startGame);

deck = shuffle(createDeck());
startGame();