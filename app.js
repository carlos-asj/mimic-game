
const state = {
    mode: null,
    players: [],
    times: [[], []],
    currentPlayer: 0,
    points: {},
    words: []
}

const inputName = document.getElementById("input-player");
const listPlayers = document.getElementById("players-list");
const msgError = document.getElementById("msg-err");
const teamsBox = document.getElementById("teams-box");

document.getElementById("btn-add").addEventListener("click", () => {
    const name = inputName.value.trim();
    if (!name) return;
    state.players.push(name);
    inputName.value = "";
    inputName.focus();
    renderPlayers();
});

function renderPlayers() {
    listPlayers.innerHTML = "";
    state.players.forEach((name, i) => {
        const li = document.createElement("li");
        li.textContent = name + " ";
        const btn = document.createElement("button");
        btn.textContent = "Remover";
        btn.addEventListener("click", () => {
            state.players.splice(i, 1);
            renderPlayers();
        });
        li.appendChild(btn);
        listPlayers.appendChild(li);
    });
}

function renderTeams() {
    const [t1, t2] = state.teams;
    const ul1 = document.getElementById("team-1");
    const ul2 = document.getElementById("team-2");
    ul1.innerHTML = "";
    ul2.innerHTML = "";

    t1.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        ul1.appendChild(li);
    });

    t2.forEach(name => {
        const li = document.createElement("li");
        li.textContent = name;
        ul2.appendChild(li);
    });
}

document.getElementById("btn-start").addEventListener("click", startGame);

function showTeams() {
    const total = state.players.length;

    if (total < 3) {
        msgError.textContent = "São necessários pelo menos 3 jogadores para iniciar o jogo.";
        teamsBox.classList.remove("active");
        return;
    }
    msgError.textContent = "";

    if (total === 3){
        state.mode = "solo";
        teamsBox.classList.remove("active");
        return;
    }

    state.mode = "teams";
    state.teams = sliceTeams(state.players);
    renderTeams();
    teamsBox.classList.add("active");
}

document.getElementById("btn-send").addEventListener("click", showTeams);

document.getElementById("btn-shuffle").addEventListener("click", () => {
    state.teams = sliceTeams(state.players);
    renderTeams();
});

function startGame() {
    const total = state.players.length;

    if (total < 3) {
        msgError.textContent = "São necessários pelo menos 3 jogadores para iniciar o jogo.";
        return;
    }
    msgError.textContent = "";

    state.currentPlayer = 0;
    state.points = {};

    if (total === 3) {
        state.mode = "solo";
        state.players.forEach(j => state.points[j] = 0);
        document.getElementById("btn-shuf").style.display = "block";
    } else {
        state.mode = "teams";
        state.teams = sliceTeams(state.players);
        state.points = { "Time 1": 0, "Time 2": 0 };
    }

    showScreen("screen-game");
    sincScreenReady();
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function sincScreenReady() {
    const el = document.getElementById("player");

    if (state.mode === "solo") {
        el.textContent = state.players[state.currentPlayer % state.players.length];
    } else {
        const teamIndex = state.currentPlayer % 2;
        const team = state.teams[teamIndex];
        const roundTeam = Math.floor(state.currentPlayer / 2);
        const who = team[roundTeam % team.length];
        el.textContent = `${who}`;
    }
}

async function loadWords() {
    const res = await fetch("words.json");
    allWords = await res.json();
}

loadWords();

document.getElementById("btn-words").addEventListener("click", drawWords());

function sliceTeams(players) {
    const shuf = shuffle(players);
    const mid = Math.ceil(shuf.length / 2);
    return [shuf.slice(0, mid), shuf.slice(mid)];
}

function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function drawWords(qty = 3) {
    let available = allWords.filter(w => !usedWordshas(w.word));

    if (available.lenght < qty) {
        usedWords.clear();
        available = [...allWords];
    }

    const chosen = shuffle(available).slice(0, qty);
    chosen.forEach(w => usedWords.add(w.word));
    return chosen;
}

function showRoundWords() {
    state.words = drawWords(3);

    const ul = document.getElementById("words-list");
    ul.innerHTML = "";
    state.words.forEach(w => {
        const li = document.createElement("li");
        li.textContent = w.word;
        ul.appendChild(li);
    })
}

const DEV = new URLSearchParams(location.search).has("dev");

if (DEV) {
    state.players= ["Ana", "Beto", "Carlos", "Duda", "Eva", "Fábio"];
    state.mode = "teams";
    state.teams = sliceTeams(state.players);
    renderPlayers();
    renderTeams();
}