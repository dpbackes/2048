function Play()
{
  setInterval(Press, 1000);
}

function AiPlayer(gameManager) {
  this.events = {};
  var self = this;
  var press = function()
  {
    if(gameManager.over && !gameManager.won)
    {
      gameManager.restart();
    }

    tryMove(gameManager);
  };

  setInterval(press, 100);
}

function ColumnFull(col, grid){
  for(var i = 0; i < grid.cells.length; i++)
  {
    if(!grid.cellOccupied({x:col, y:i})){
      return false;
    }

    return true;
  }
}

function RowFull(row, grid){
  for(var i = 0; i < grid.cells.length; i++)
  {
    if(!grid.cellOccupied({x:i, y:row})){
      return false;
    }

    return true;
  }
}

function RowContainsTile(row, grid){
  for(var i = 0; i < grid.cells.length; i++)
  {
    if(grid.cellOccupied({x:i, y:row})){
      return true;
    }

    return false;
  }
}

function ColumnHasDownwardMerge(col, gameManager)
{
  return FindScoreForDirection(0, gameManager) > 0;
}

function CanMoveDown(column, gameManager){
  return !ColumnFull(column, gameManager.grid) || ColumnHasDownwardMerge(column, gameManager);
}

function MoveDistance(cell, direction, gameManager){
  return EmptyCellsInDirection(cell, direction, gameManager) + MergesInDirection(cell, direction, gameManager);
}

function MergesInDirection(cell, direction, gameManager){
  var cells = 0;
  switch(direction){
  case 0:
    for(var i = 0; i < cell.y; i++){
      var current = gameManager.grid.cellContent({x: cell.x, y:i});
      var next = gameManager.grid.cellContent({x: cell.x, y:i+1});
      if(current !== null && next !== null && current.value == next.value){
        cells++
      }
    }
    break;
  case 1:
    for(var i = gameManager.grid.size-1; i > cell.x; i--){
      var current = gameManager.grid.cellContent({x: i, y:cell.y});
      var next = gameManager.grid.cellContent({x: i-1, y:cell.y});
      if(current !== null && next !== null && current.value == next.value){
        cells++
      }
    }
    break;
  case 2:
    for(var i = gameManager.grid.size-1; i > cell.y; i--){
      var current = gameManager.grid.cellContent({x: cell.x, y:i});
      var next = gameManager.grid.cellContent({x: cell.x, y:i-1});
      if(current !== null && next !== null && current.value == next.value){
        cells++
      }
    }
    break;
  case 3:
    for(var i = 0; i < cell.x; i++){
      var current = gameManager.grid.cellContent({x: i, y:cell.y});
      var next = gameManager.grid.cellContent({x: i+1, y:cell.y});
      if(current !== null && next !== null && current.value == next.value){
        cells++
      }
    }
    break;
  }
  return cells;
}

function EmptyCellsInDirection(cell, direction, gameManager){
  var cells = 0;
  switch(direction){
  case 0:
    for(var i = cell.y-1; i > 0; i--){
      if(!gameManager.grid.cellOccupied({x: cell.x, y: i})){
        cells++;
      }
    }
    break;
  case 1:
    for(var i = cell.x+1; i < gameManager.grid.size; i++){
      if(!gameManager.grid.cellOccupied({x: i, y: cell.y})){
        cells++;
      }
    }
    break;
  case 2:
    for(var i = cell.y+1; i < gameManager.grid.size; i++){
      if(!gameManager.grid.cellOccupied({x: cell.x, y: i})){
        cells++;
      }
    }
    break;
  case 3:
    for(var i = cell.x-1; i >0; i--){
      if(!gameManager.grid.cellOccupied({x: i, y: cell.y})){
        cells++;
      }
    }
    break;
  }
  return cells;
}

function HasDownRightMerge(cell, gameManager)
{
  if(cell.x == 3 || cell.y == 3){
    return false;
  }

  if(!ColumnFull(cell.x+1, gameManager.grid)){
    return false;
  }

  tileUpperLeft = gameManager.grid.cellContent(cell);
  tileLowerRight = gameManager.grid.cellContent({x:cell.x+1, y:cell.y+1});
  if(tileUpperLeft != null && tileLowerRight != null)
  {
    if(tileUpperLeft.value == tileLowerRight.value){
      var moveDist = MoveDistance(cell, 2, gameManager);
      var theirMoveDist = MoveDistance({x:cell.x+1, y:cell.y+1}, 2, gameManager);
      if(moveDist == 1 && theirMoveDist == 0){
        return true;
      }
    }
  }

  return false;
}

function CheckDownRightCombo(gameManager){
  for(var i = 3; i != 0; i--){
    if(ColumnFull(i, gameManager.grid) && HasDownRightMerge({x:i-1, y:0}, gameManager)){
      return true;
    }
  }

  return false;
}

function tryMove(gameManager)
{
  var previousState = new Grid(gameManager.grid.size, gameManager.grid.serialize().cells);

  // if(!gameManager.grid.cellOccupied({x:3, y:0})){
  //   gameManager.move(0);
  //   if(!gameManager.grid.equals(previousState)){
  //     return;
  //   }
  // }
  //
  //if there is no tile in the lower right corner, and there are tiles
  //in the bottom row, favor moving right
  if(!gameManager.grid.cellOccupied({x:3, y:3})){
    for(var i = 0; i < 3; i++){
      if(gameManager.grid.cellOccupied({x:i, y:3})){
        gameManager.move(1);
        if(!gameManager.grid.equals(previousState)){
          return;
        }
      }
    }
  }

  if(CheckDownRightCombo(gameManager)){
    gameManager.move(2);
    if(!gameManager.grid.equals(previousState)){
      if(!gameManager.grid.cellOccupied({x:0, y:0})
          && !gameManager.grid.cellOccupied({x:1, y:0})
          && !gameManager.grid.cellOccupied({x:2, y:0}))
          {
            gameManager.move(1);
          }
      return;
    }
  }

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

  var order = [1, 0, 2, 3];
  for(var i = 0; i< 4; i++){
    var score = FindScoreForDirection(order[i], gameManager);

    if(score > maxScore){
      maxScoreDirection = order[i];
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
