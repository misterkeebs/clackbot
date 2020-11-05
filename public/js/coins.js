window.showCoins = el => {
  var exists = document.getElementById('coins');
  if (exists) {
    exists.parentNode.removeChild(exists);
    return false;
  }

  var element = document.querySelector(el);
  var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d'),
    focused = false;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.id = 'coins';

  var coin = new Image();
  coin.src = '/img/coin.png';
  // 440 wide, 40 high, 10 states
  coin.onload = function () {
    element.appendChild(canvas);
    focused = true;
    drawloop();
  };
  var coins = [];

  function drawloop() {
    if (focused) {
      requestAnimationFrame(drawloop);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < .3) {
      coins.push({
        x: Math.random() * canvas.width | 0,
        y: -50,
        dy: 3,
        s: 0.5 + Math.random(),
        state: Math.random() * 10 | 0,
      });
    }
    var i = coins.length;
    while (i--) {
      var {x} = coins[i];
      var {y} = coins[i];
      var {s} = coins[i];
      var {state} = coins[i];
      coins[i].state = (state > 9) ? 0 : state + 0.1;
      coins[i].dy += 0.3;
      coins[i].y += coins[i].dy;

      ctx.drawImage(coin, 44 * Math.floor(state), 0, 44, 40, x, y, 44 * s, 40 * s);

      if (y > canvas.height) {
        coins.splice(i, 1);
      }
    }
  }
};


window.hideCoins = () => {
  const exists = document.getElementById('coins');
  if (exists) {
    exists.parentNode.removeChild(exists);
  }
};
