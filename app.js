
const state = {
    mode: null,
    turn: 0,
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
const wordBox = document.getElementById("word-box");
const ROUND_TIME = 65;
let timerId = null;
const scoreTime1 = document.getElementById("score-time1");
const scoreTime2 = document.getElementById("score-time2");

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

    if (!state.mode) {
        msgError.textContent = "Clique em Enviar para definir os times."
        return;
    }
    msgError.textContent = "";

    state.turn = 0;
    state.points = {};

    if (state.mode === "solo") {
        state.players.forEach(j => state.points[j] = 0);
    } else {
        state.points = { "Time 1": 0, "Time 2": 0 };
    }

    resetRound();
    renderCurrentPlayer();
    showScreen("screen-game");
}

function resetRound() {
    clearInterval(timerId);
    timerId = null;

    document.getElementById("timer").textContent = "";
    document.getElementById("words-list").innerHTML = "";
    document.getElementById("btn-words").disabled = false;
}

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(t => t.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

const usedWords = new Set();
let lastWords = [];

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
    let available = allWords.filter(w => !usedWords.has(w.palavra));

    if (available.length < qty) {
        usedWords.clear();
        available = allWords.filter(w => !lastWords.includes(w.palavra));

        if (available.length < qty) available = [...allWords];
    }

    const chosen = shuffle(available).slice(0, qty);
    chosen.forEach(w => usedWords.add(w.palavra));
    lastWords = chosen.map(w => w.palavra);
    return chosen;
}

function showRoundWords() {
    state.words = drawWords(3);

    const ul = document.getElementById("words-list");
    ul.innerHTML = "";
    state.words.forEach((w, i) => {
        const li = document.createElement("li");
        const mid = Math.floor(state.words.length / 2);
        li.style.setProperty("--pos", i - mid);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `word-${i}`;
        checkbox.dataset.palavra = w.palavra;

        const label = document.createElement("label");
        label.htmlFor = `word-${i}`;
        label.textContent = w.palavra;
        
        li.appendChild(checkbox);
        li.appendChild(label);
        ul.appendChild(li);
    });
}

function startTimer(readySec, seconds, onEnd) {
    const el = document.getElementById("timer");

    clearInterval(timerId);

    let secReady = readySec;
    let remaining = seconds;
    el.textContent = secReady;

    timerId = setInterval(() => {
        secReady--;
        el.textContent = secReady;

        if (secReady <= 0){
            el.textContent = "Valendo!!!";
            clearInterval(timerId);
            timerId = setInterval(() => {
                remaining--;
                el.textContent = remaining;

                if (remaining <= 0) {
                    clearInterval(timerId);
                    timerId = null;
                    onEnd();
                }
            }, 1000);
        }
        
    }, 1000);
}

function startRound() {
    showRoundWords();
    startTimer(5, ROUND_TIME, endRound);
}

function endRound() {
    document.getElementById("btn-words").disabled = false;
    alert("Tempo esgotado!");
}

document.getElementById("btn-words").addEventListener("click", () => {
    document.getElementById("btn-words").disabled = true;
    startRound();
})

function tallyRoundScore() {
    const checkboxes = document.querySelectorAll("#words-list input[type='checkbox']");
    const acertos = [...checkboxes].filter(cb => cb.checked).length;

    const { name, team } = getCurrentPlayerName();
    const key = state.mode === "solo" ? name : `Time ${team}`;

    state.points[key] = (state.points[key] || 0) + acertos;
}

function renderScore() {
    const ptsT1 = state.points["Time 1"];
    const ptsT2 = state.points["Time 2"];
    
    document.getElementById("score-time1").textContent = ptsT1;
    document.getElementById("score-time2").textContent = ptsT2;

    console.log(`Pontos: ${ptsT1}`);
    console.log(`Pontos: ${ptsT2}`);
    
}

function getCurrentPlayerName() {
    if (state.mode === "solo") {
        return {
            name: state.players[state.turn % state.players.length],
            team: null
        };
    }

    const teamIdx = state.turn % 2;
    const team = state.teams[teamIdx];
    const posInTeam = Math.floor(state.turn/2) % team.length;

    return { name: team[posInTeam], team: teamIdx + 1 };
}

function renderCurrentPlayer() {
    const { name, team } = getCurrentPlayerName();

    document.getElementById("current-player").textContent = name;
    document.getElementById("current-team").textContent = team ? `Equipe ${team}` : "";
}

document.getElementById("btn-next").addEventListener("click", nextPlayer);

function nextPlayer() {
    tallyRoundScore();
    renderScore();
    resetRound();
    state.turn++;
    renderCurrentPlayer();
}
