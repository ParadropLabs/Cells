var socket = require('socket.io-client')('http://localhost:3000', {query:"type=player"});

var game = null;
var player = null;

socket.on('connect', function() {
  console.log('Bot connected.');
  socket.emit('respawn');
});

socket.on('welcome', function(playerSettings) {
  /*
   * Example player data:
   *
   * { id: 'Hm53hPIRkspYnUvSAAAA',
   *   x: 1173.9736659610103,
   *   y: 1033.9736659610103,
   *   w: 10,
   *   h: 10,
   *   cells:
   *     [ { mass: 10,
   *         x: 1173.9736659610103,
   *         y: 1033.9736659610103,
   *         radius: 22.973665961010276 } ],
   *   massTotal: 10,
   *   hue: 302,
   *   type: 'player',
   *   lastHeartbeat: 1488493376114,
   *   target: { x: 0, y: 0 } }
   */

  player = playerSettings;

  player.name = 'Bot';
  player.screenWidth = 640;
  player.screenHeight = 480;
  player.target = {
    x: 0,
    y: 0
  };

  socket.emit('gotit', player);
});

socket.on('gameSetup', function(data) {
  /*
   * Example game data:
   * { gameWidth: 2000, gameHeight: 2000 }
   */
  game = data;
});

function getPlayer(visibleCells) {
  for(var i=0; i<visibleCells.length; i++) {
    if(typeof(visibleCells[i].id) == "undefined") {
      return visibleCells[i];
    }
  }
  return null;
}

// Eject mass, which makes the player smaller and faster.
function eject() {
  socket.emit('1');
}

// Split your cells in half, which can be a useful tactic.
function split() {
  socket.emit('2');
}

socket.on('serverTellPlayerMove', function(visibleCells, visibleFood, visibleMass, visibleVirus) {
  /*
   * Example player data:
   * { x: 1254.3948265132833,
   *   y: 1978.7647796997421,
   *   cells:
   *     [ { mass: 12,
   *         x: 1254.3948265132833,
   *         y: 1978.7647796997421,
   *         radius: 24.784609690826528,
   *         speed: 6.25 } ],
   *   massTotal: 12,
   *   hue: 340 }
   *
   * Example food data:
   * { id: 2868079025,
   *   x: 1330.4852813742386,
   *   y: 1899.4852813742386,
   *   radius: 12.485281374238571,
   *   mass: 2.349243988749289,
   *   hue: 191 }
   */
  var player = getPlayer(visibleCells);

  // Set target.x and target.y and send to the server.  It is relative to
  // the player's current position, so zero means no movement.
  var target = {
    x: 0,
    y: 0
  };

  if (visibleFood.length > 0) {
    // Pick the first piece of visible food and chase it.
    target.x = visibleFood[0].x - player.x;
    target.y = visibleFood[0].y - player.y;
  } else {
    // Else pick a random target.
    target.x = Math.random() * game.gameWidth - player.x;
    target.y = Math.random() * game.gameHeight - player.y;
  }

  socket.emit('0', target);
});

socket.on('RIP', function() {
  console.log('Bot was eaten.');
  socket.emit('respawn');
});
