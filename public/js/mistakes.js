const audio = new Audio('/sounds/fart.mp3');
const steps = 10;

function update(mistakes, sessionMistakes) {
  const mistakesEl = document.getElementById('mistakes');
  const sessionMistakesEl = document.getElementById('sessionMistakes');
  mistakesEl.innerHTML = mistakes > 0 ? mistakes : '-';
  sessionMistakesEl.innerHTML = sessionMistakes > 0 ? sessionMistakes : '-';
}

function animate(mistakes, sessionMistakes) {
  audio.pause();
  audio.currentTime = 0;
  audio.loop = false;
  audio.play();

  update(mistakes, sessionMistakes);

  const el = document.getElementById('container');
  el.className = 'animate__animated animate__rubberBand animate__infinite';

  setTimeout(() => {
    el.className = '';
  }, 1000);
}

const socket = io.connect();
socket.on('newMistake', ({ mistakes, sessionMistakes }) => {
  console.log('new mistake', mistakes, sessionMistakes);
  animate(mistakes, sessionMistakes);
});

(function () {
  fetch('/mistakes')
    .then(res => res.json())
    .then(res => update(res.mistakes, res.sessionMistakes));
})();
