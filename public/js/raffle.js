const steps = 10;
let velocity = 10;
let increase = 1;
let stopping = false;

const audio = new Audio('/sounds/peao.mp3');
let original;

function shuffle() {
  const el = document.getElementById('raffle');

  if (!original) original = el.innerHTML;

  el.scrollTop = el.scrollTop + steps;

  if (el.scrollTop + el.offsetHeight >= el.scrollHeight) {
    el.innerHTML += original;
  }
  console.log(el.scrollTop);
  if (stopping) {
    velocity += increase;
    increase *= 1.3;
    if (velocity < 600) {
      setTimeout(shuffle, velocity);
    } else {
      stopping = false;
      pickWinner();
    }

    return;
  }

  setTimeout(shuffle, velocity);
}

function pickWinner() {
  const containerEl = document.getElementById('raffle');
  const baseEl = document.getElementById('needle');
  const x = baseEl.clientWidth - (baseEl.clientWidth / 2);
  const y = baseEl.offsetTop;
  console.log(x, y+5);

  const players = document.querySelectorAll('.player');
  console.log(players.length);
  console.log(players[0]);
  [].forEach.call(players, function(player) {
    const startY = player.offsetTop - containerEl.scrollTop;
    const endY = startY + player.clientHeight;
    if (startY < y && endY > y) {
      console.log('Winner is', player.innerHTML);
    }
    // console.log(player.innerHTML, player.clientHeight, '[', startY, endY, '] -', y);
  });
}

function start() {
  const el = document.getElementById('container');
  el.className = 'container';

  velocity = 10;
  increase = 1;
  audio.play();
  shuffle();
}

function stop() {
  audio.pause();
  audio.curretTime = 0;
  stopping = true;
  document.querySelectorAll('.player').forEach(e => e.remove());
}

function startRaffle(players) {
  const el = document.getElementById('raffle');
  players.forEach(p => {
    const playerEl = document.createElement('div');
    playerEl.className = 'player';
    playerEl.innerHTML = p;
    el.appendChild(playerEl);
  });

  start();
  // const min = 12;
  // const max = 30;
  // const runTime = Math.floor(Math.random() * (max - min + 1)) + min;
  setTimeout(stop, 12000);
}

const socket = io.connect();
socket.on('startRaffle', ({ players }) => {
  startRaffle(players);
});
