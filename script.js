const game = document.querySelector(".game");
const players = [];
// Note that it is arranged like this for a reason, realise that the next index of any index is the target of that index.
// Rock wants scissors, scissors wants paper, paper wants rock. And the avoiding item is the opposite.
const types = ["rock", "scissors", "paper"];
const options = {
    players: 50
};
const optCache = [];

for (const i in options) {
    const inp = document.getElementById("o-i-" + i);
    const val = document.getElementById("o-v-" + i);
    optCache.push({inp, val, i, last: null});
}

function addPlayer() {
    const div = document.createElement("div");
    div.classList.add("player");
    const type = Math.floor(Math.random() * 3);
    div.classList.add(types[type]);
    game.appendChild(div);
    players.push({type, div, x: Math.random() * innerWidth, y: Math.random() * innerHeight});
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

        player.x += vec.x * m;
        player.y += vec.y * m;
    }
}

function render() {
    requestAnimationFrame(render);

    for (const player of players) {
        player.div.style.left = player.x + "px";
        player.div.style.top = player.y + "px";
    }
}

render();

function update() {
    while (players.length > options.players) {
        const p = players.splice(-1, 1);
        if (p[0]) p[0].div.remove();
    }
    while (players.length < options.players) addPlayer();
    for (const player of players) {
        const wantType = (player.type + 1) % 3;
        const avoidType = (player.type + 2) % 3;

        const want = players.filter(i => i.type === wantType).sort((a, b) => calcDist(player, a) - calcDist(player, b))[0];
        const avoid = players.filter(i => i.type === avoidType).sort((a, b) => calcDist(player, a) - calcDist(player, b))[0];

        if (!want && !avoid) continue;

        const avoidDist = avoid ? calcDist(avoid, player) : Infinity;

        if (avoidDist <= 20) {
            player.div.classList.remove(types[player.type]);
            player.type = avoid.type;
            player.div.classList.add(types[avoid.type]);
            continue;
        }

        if (want) moveTo(player, want, 1);
        if (avoid) moveTo(player, avoid, -1);

        if (player.x < 0) player.x = 0;
        if (player.y < 0) player.y = 0;
        if (player.x > innerWidth - 30) player.x = innerWidth - 30;
        if (player.y > innerHeight - 30) player.y = innerHeight - 30;
    }
    setTimeout(update);
}

update();

setInterval(() => {
    for (const c of optCache) {
        if (c.last === c.inp.value) continue;
        c.last = c.inp.value;
        c.val.innerText = c.last;
        options[c.i] = c.last;
    }
});