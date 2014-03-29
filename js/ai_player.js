function Play()
{
  setInterval(Press, 1000);
}

function AiPlayer(gameManager) {
  this.events = {};
  var self = this;
  var press = function()
  {
    tryMove(gameManager);
  };

  setInterval(press, 100);
}

function tryMove(gameManager)
{
  var previousState = new Grid(gameManager.grid.size, gameManager.grid.serialize().cells);

  var maxMove = FindHighestScoreMove(gameManager);

  if(maxMove >= 0){
    gameManager.move(maxMove);
    return;
  }

  gameManager.move(0);
  if(!gameManager.grid.equals(previousState)){
    return;
  }

  gameManager.move(1);
  if(!gameManager.grid.equals(previousState)){
    return;
  }

  gameManager.move(2);
  if(!gameManager.grid.equals(previousState)){
    return;
  }

  gameManager.move(3);
}

function FindScoreForDirection(direction, gameManager){
  var vector     = gameManager.getVector(direction);
  var traversals = gameManager.buildTraversals(vector);

  // Save the current tile positions and remove merger information
  gameManager.prepareTiles();

  var score = 0;
  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = gameManager.grid.cellContent(cell);

      if (tile) {
        var positions = gameManager.findFarthestPosition(cell, vector);
        var next      = gameManager.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);

          // Update the score
          score += merged.value;

        }
      }
    });
  });

  return score;
}

function FindHighestScoreMove(gameManager) {
  // 0: up, 1: right, 2: down, 3: left
  var maxScoreDirection = -1;
  var maxScore = 0;
  for(var i = 0; i< 4; i++){
    var score = FindScoreForDirection(i, gameManager);

    if(score > maxScore){
      maxScoreDirection = i;
      maxScore = score;
    }
  }

  return maxScoreDirection;
};

AiPlayer.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

AiPlayer.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};
