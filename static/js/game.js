const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PACMAN_SIZE = 20;
const DOT_SIZE = 5;
const SPEED = 5;

let players = {};

let dots = [];
for (let i = 0; i < canvas.width; i += 40) {
    for (let j = 0; j < canvas.height; j += 40) {
        dots.push({ x: i + 20, y: j + 20 });
    }
}

function drawAllPacmans() {
    for (let id in players) {
        let p = players[id];
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(p.x, p.y, PACMAN_SIZE, 0, Math.PI * 2);
        ctx.fill();
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

const socket = io.connect('http://' + document.domain + ':' + location.port);

socket.on('update_game', function(data) {
    players = data.players;
});

document.addEventListener('keydown', (e) => {
    let player = players[socket.id] || {};
    
    if (e.key === 'ArrowRight') player.dir = 'RIGHT';
    if (e.key === 'ArrowLeft') player.dir = 'LEFT';
    if (e.key === 'ArrowUp') player.dir = 'UP';
    if (e.key === 'ArrowDown') player.dir = 'DOWN';
    
    if (player.dir === 'RIGHT') player.x += SPEED;
    if (player.dir === 'LEFT') player.x -= SPEED;
    if (player.dir === 'UP') player.y -= SPEED;
    if (player.dir === 'DOWN') player.y += SPEED;
    
    for (let i = 0; i < dots.length; i++) {
        let dot = dots[i];
        let distance = Math.sqrt(((player.x - dot.x) ** 2) + ((player.y - dot.y) ** 2));
        if (distance < PACMAN_SIZE + DOT_SIZE) {
            dots.splice(i, 1);
            i--;
        }
    }

    socket.emit('player_move', { pacman: player });
});

setInterval(updateGame, 1000 / 60);
