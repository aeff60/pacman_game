const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
const socket = io.connect(`${protocol}://${document.domain}:${location.port}`);

const PACMAN_SIZE = 30;
const DOT_SIZE = 5;
const SPEED = 10;

let players = {};
let imageCache = {};
let dots = initializeDots();

function initializeDots() {
    let dotsArray = [];
    for (let i = 0; i < canvas.width; i += 40) {
        for (let j = 0; j < canvas.height; j += 40) {
            dotsArray.push({ x: i + 20, y: j + 20 });
        }
    }
    return dotsArray;
}

socket.on('game_created', handleGameCreated);
socket.on('update_game', data => players = data.players);

document.addEventListener('keydown', handlePlayerMovement);
setInterval(updateGame, 500 / 60);

function handleGameCreated(data) {
    alert('Game created! Share this ID with your friend: ' + data.game_id);
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
}

function createGame() {
    socket.emit('create_game');
}

function joinGame() {
    const gameId = document.getElementById('gameIdInput').value;
    socket.emit('join_game', { 'game_id': gameId });
}

function drawAllPacmans() {
    for (let id in players) {
        const p = players[id];
        drawPacmanImage(p);
    }
}

function drawPacmanImage(p) {
    const imageUrl = p.imageUrl;

    if (!imageCache[imageUrl]) {
        const playerImage = new Image();
        playerImage.src = imageUrl;
        playerImage.onload = function() {
            imageCache[imageUrl] = playerImage;
            ctx.drawImage(playerImage, p.x - PACMAN_SIZE, p.y - PACMAN_SIZE, PACMAN_SIZE * 2, PACMAN_SIZE * 2);
        }
    } else {
        ctx.drawImage(imageCache[imageUrl], p.x - PACMAN_SIZE, p.y - PACMAN_SIZE, PACMAN_SIZE * 2, PACMAN_SIZE * 2);
    }
}

function drawDots() {
    ctx.fillStyle = "white";
    dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_SIZE, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDots();
    drawAllPacmans();
}

function handlePlayerMovement(e) {
    let player = players[socket.id] || {};
    movePlayerBasedOnKey(e.key, player);

    for (let i = 0; i < dots.length; i++) {
        if (isPlayerCloseToDot(player, dots[i])) {
            dots.splice(i, 1);
            i--;
        }
    }

    const imageUrl = document.getElementById('pacmanImageUrl').value;
    socket.emit('player_move', { pacman: { ...player, imageUrl: imageUrl } });
}

function movePlayerBasedOnKey(key, player) {
    const movementMap = {
        'ArrowRight': () => player.x += SPEED,
        'ArrowLeft': () => player.x -= SPEED,
        'ArrowUp': () => player.y -= SPEED,
        'ArrowDown': () => player.y += SPEED
    };
    const move = movementMap[key];
    if (move) move();
}

function isPlayerCloseToDot(player, dot) {
    const distance = Math.sqrt(((player.x - dot.x) ** 2) + ((player.y - dot.y) ** 2));
    return distance < PACMAN_SIZE + DOT_SIZE;
}
