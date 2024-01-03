const game = document.querySelector(".game");
const rockAmount = document.getElementById("rock-amount");
const paperAmount = document.getElementById("paper-amount");
const scissorsAmount = document.getElementById("scissors-amount");
const rockBg = document.querySelector(".bg-rock");
const paperBg = document.querySelector(".bg-paper");
const scissorsBg = document.querySelector(".bg-scissors");
const bgWhole = document.querySelector(".bg");
const players = [];
// Note that it is arranged like this for a reason, realise that the next index of any index is the target of that index.
// Rock wants scissors, scissors wants paper, paper wants rock. And the avoiding item is the opposite.
const types = ["rock", "scissors", "paper"];
const options = {
    time: 100,
    players: 50,
    acceleration: 0,
    friction: 10,
    bgOpacity: 0,
    magnet: 0
};
const optDefaults = {
    time: 100,
    players: 50,
    acceleration: 0,
    friction: 10,
    bgOpacity: 0,
    magnet: 0
};
const optCache = [];
const optFn = {
    players(val) {
        if (players.length === val) return;
        players.forEach(i => i.div.remove());
        players.length = 0;
        const r = Math.round(val / 3);
        for (let i = 0; i < val; i++) addPlayer(Math.floor(i / r));
    },
    bgOpacity(val) {
        bgWhole.style.opacity = val + "%";
    }
};

for (const i in options) {
    const inp = document.getElementById("o-i-" + i);
    const val = document.getElementById("o-v-" + i);
    const revert = document.createElement("div");
    revert.classList.add("revert", "icon", "h16");
    revert.hidden = true;
    inp.parentElement.appendChild(revert);
    const local = localStorage.getItem("__rps__" + i);
    if (local) inp.value = local;
    revert.addEventListener("click", () => {
        inp.value = optDefaults[i];
    });
    optCache.push({inp, revert, val, i, last: null});
}

setInterval(() => {
    for (const c of optCache) {
        const v = c.inp.value * 1;
        if (c.last === v) continue;
        localStorage.setItem("__rps__" + c.i, c.inp.value);
        c.revert.hidden = v === optDefaults[c.i];
        if (optFn[c.i]) optFn[c.i](v);
        c.last = v;
        c.val.innerText = c.last + "";
        options[c.i] = c.last;
    }
});

function addPlayer(type = Math.floor(Math.random() * 3)) {
    const div = document.createElement("div");
    div.classList.add("player");
    div.classList.add(types[type]);
    game.appendChild(div);
    players.push({type, div, x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: 0, vy: 0});
}

function switchPlayer(player, to) {
    player.div.classList.remove(types[player.type]);
    player.type = to;
    player.div.classList.add(types[to]);
}

function calcDist(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function moveTo(player, to, m) {
    const vec = {x: to.x - player.x, y: to.y - player.y};
    const mag = Math.sqrt(vec.x ** 2 + vec.y ** 2);
    if (mag !== 0) {
        vec.x /= mag;
        vec.y /= mag;
        if (options.acceleration > 0) {
            player.vx += vec.x * m * options.acceleration / 100;
            player.vy += vec.y * m * options.acceleration / 100;
        } else {
            player.vx = 0;
            player.vy = 0;
            player.x += vec.x * m;
            player.y += vec.y * m;
        }
    }
}

function boundPlayer(player) {
    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > innerWidth - 30) player.x = innerWidth - 30;
    if (player.y > innerHeight - 30) player.y = innerHeight - 30;
}

function render() {
    requestAnimationFrame(render);
    for (const player of players) {
        player.div.style.left = player.x + "px";
        player.div.style.top = player.y + "px";
    }

    const rocks = players.filter(i => i.type === 0).length;
    const papers = players.filter(i => i.type === 2).length;
    const scissors = players.filter(i => i.type === 1).length;
    const total = players.length;

    rockAmount.innerText = rocks + "";
    paperAmount.innerText = papers + "";
    scissorsAmount.innerText = scissors + "";

    rockBg.style.width = rocks / total * 100 + "%";
    paperBg.style.width = papers / total * 100 + "%";
    scissorsBg.style.width = scissors / total * 100 + "%";
}

render();

let lastUpdate = Date.now() - 1;
const fixedDeltaTime = 20;
let dtAcc = 0;

function fixedUpdate() {
    for (const player of players) {
        player.vx *= (1 - options.friction / 100);
        player.vy *= (1 - options.friction / 100);
        player.x += player.vx;
        player.y += player.vy;
        const wantType = (player.type + 1) % 3;
        const avoidType = (player.type + 2) % 3;
        for (const p2 of players) {
            if (p2.type === player.type) continue;
            const dist = calcDist(player, p2);
            if (dist > 800) continue;
            if (dist <= 20 && p2.type === avoidType) switchPlayer(player, avoidType);
            if (dist < 18) continue;
            moveTo(player, p2, (p2.type === wantType ? 1 : -1) * (options.magnet ? 1 / dist * 50 : 1 / 10));
        }
        boundPlayer(player);
    }
}

function update() {
    dtAcc += (Date.now() - lastUpdate) * options.time / 100;
    dtAcc = Math.min(dtAcc, 2000)
    lastUpdate = Date.now();
    let u = 0;
    while (dtAcc > fixedDeltaTime && (++u < 30)) {
        dtAcc -= fixedDeltaTime;
        fixedUpdate();
    }
    setTimeout(update);
}

update();