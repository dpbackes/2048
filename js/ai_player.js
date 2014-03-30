function AiPlayer(gameManager) {
  this.events = {};
  var self = this;
  var press = function()
  {
    if(gameManager.over && !gameManager.won)
    {
      gameManager.restart();
    }
    if(!gameManager.won){
      tryMove(gameManager);
    }
  };

  setInterval(press, 100);
}

function ColumnFull(col, grid){
  for(var i = 0; i < grid.cells.length; i++)
  {
    if(!grid.cellOccupied({x:col, y:i})){
      return false;
    }
  }

  return true;
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
    for(var i = cell.y-1; i >= 0; i--){
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
    for(var i = cell.x-1; i >= 0; i--){
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
  if(!gameManager.grid.cellOccupied(cell)){
    return false;
  }

  tileUpperLeft = gameManager.grid.cellContent(cell);

  for(var i = cell.y-1; i >=0; i--){
    var cellAbove = {x:cell.x, y:i};
    if(gameManager.grid.cellOccupied(cellAbove)){
      if(gameManager.grid.cellContent(cellAbove).value == tileUpperLeft.value){
        return false;
      }
    }
  }

  if(MergesInDirection(cell, 2, gameManager)){
    return false;
  }
  var moveDist = MoveDistance(cell, 2, gameManager);

  if(moveDist == 0 || moveDist > 1){
    return false;
  }
  tileLowerRight = gameManager.grid.cellContent({x:cell.x+1, y:cell.y+moveDist});
  if(tileUpperLeft != null && tileLowerRight != null)
  {
    if(tileUpperLeft.value == tileLowerRight.value){
      var theirMoveDist = MoveDistance({x:cell.x+1, y:cell.y+moveDist}, 2, gameManager);
      for(var i = cell.y+moveDist-1; i >= 0; i--){
        if(MergesInDirection({x:cell.x+1, y:i}, 2, gameManager)){
          return false;
        }
      }
      if(theirMoveDist == 0){
        return true;
      }
    }
  }

  return false;
}

function HasUpRightMerge(cell, gameManager){
  if(!gameManager.grid.cellOccupied(cell)){
    return false;
  }

  if(MergesInDirection(cell, 0, gameManager)){
    return false;
  }

  me = gameManager.grid.cellContent(cell);

  for(var i = cell.y+1; i < gameManager.grid.size; i++){
    var cellBelow = {x:cell.x, y:i};
    if(gameManager.grid.cellOccupied(cellBelow)){
      if(gameManager.grid.cellContent(cellBelow).value == me.value){
        if(gameManager.grid.cellOccupied({x:cell.x+1, y:i}) && gameManager.grid.cellContent({x:cell.x+1, y:i}).value == me.value*me.value){
          return true;
        }
        return false;
      }
      else
      {
        return false;
      }
    }
  }

  var moveDist = MoveDistance(cell, 0, gameManager);

  if(moveDist == 0){
    return false;
  }

  upperRight = gameManager.grid.cellContent({x:cell.x+1, y:cell.y-moveDist});
  if(me != null && upperRight != null)
  {
    if(me.value == upperRight.value){
      var theirMoveDist = MoveDistance({x:cell.x+1, y:cell.y-moveDist}, 0, gameManager);
      for(var i = cell.y-moveDist+1; i < gameManager.grid.size; i++){
        if(MergesInDirection({x:cell.x+1, y:i}, 0, gameManager)){
          return false;
        }
      }
      if(theirMoveDist == 0){
        return true;
      }
    }
  }

  return false;
}

function CheckDownRightCombo(gameManager){
  for(var i = 3; i != 0; i--){
    if(ColumnFull(i, gameManager.grid)){
      for(var j = 0; j < gameManager.grid.size-1; j++){
        if(HasDownRightMerge({x:i-1, y:j}, gameManager)){
          if(gameManager.grid.cellContent({x:i-1, y:j}).value > 16)
          return true;
        }
      }
    }
    else
    {
      return false;
    }
  }

  return false;
}

function CheckUpRightCombo(gameManager){
   for(var i = 3; i != 0; i--){
     if(ColumnFull(i, gameManager.grid)){
       for(var j = 0; j < gameManager.grid.size-1; j++){
         if(HasUpRightMerge({x:i-1, y:j}, gameManager)){
           return true;
         }
       }
     }
     else
     {
       return false;
     }
   }

   return false;
}

function ColumnInDescendingOrder(column, gameManager){
  var lastValue = -1;
  for(var i = 0; i < gameManager.grid.size; i++){
    var currentCell = {x: column, y:i};
    if(gameManager.grid.cellOccupied(currentCell)){
      var cellValue = gameManager.grid.cellContent(currentCell).value;
      if(cellValue > lastValue){
        if(lastValue != -1){
          return false;
        }
      }
      lastValue = cellValue;
    }
  }

  return true;
}

var downRightCombo = false;
var upRightCombo = false;
var moveUp = false;
function tryMove(gameManager)
{
  var previousState = new Grid(gameManager.grid.size, gameManager.grid.serialize().cells);

  if(!downRightCombo && !gameManager.grid.cellOccupied({x:3, y:0})){
    moveUp = false;
    gameManager.move(0);
    if(!gameManager.grid.equals(previousState)){
      return;
    }
  }

  if(downRightCombo || upRightCombo)
  {
    gameManager.move(1);
    if(!gameManager.grid.equals(previousState)){
      downRightCombo = false;
      upRightCombo = false;
      return;
    }
  }

  downRightCombo = false;
  upRightCombo = false;
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

  if(CheckUpRightCombo(gameManager) && ColumnInDescendingOrder(3, gameManager)){
    gameManager.move(0);
    if(!gameManager.grid.equals(previousState)){
      upRightCombo = true;
      return;
    }
  }

  if(CheckDownRightCombo(gameManager)){
    gameManager.move(2);
    if(!gameManager.grid.equals(previousState)){
      downRightCombo = true;
      return;
    }
  }

  var order = [0, 1, 2];

  if(ColumnFull(3, gameManager.grid) && ColumnInDescendingOrder(3, gameManager)){
    order = [2, 1, 0];

    if(ColumnFull(2, gameManager.grid)){
      order = [1, 2, 0];
    }
  }



  var maxMove = FindHighestScoreMove(gameManager, order);

  if(maxMove == 0 || maxMove == 1){
    gameManager.move(maxMove);
    if(!gameManager.grid.equals(previousState)){
      return;
    }
  }

  if(maxMove == 2 && ColumnFull(3, gameManager.grid) && MoveDistance({x:3, y:0}, 2, gameManager) == 0){
    gameManager.move(maxMove);
    if(!gameManager.grid.equals(previousState)){
      return;
    }
  }

  maxMove = FindHighestScoreMove(gameManager, [0, 1]);

  if(maxMove >= 0)
  {
    gameManager.move(maxMove);
    if(!gameManager.grid.equals(previousState)){
      return;
    }
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
          score += merged.value < 16 ? 1 : merged.value;

        }
      }
    });
  });

  return score;
}

function FindHighestScoreMove(gameManager, directions) {
  // 0: up, 1: right, 2: down, 3: left
  var maxScoreDirection = -1000000;
  var maxScore = 0;

  var order = [1, 0, 2, 3];
  if(directions){
    order = directions;
  }

  for(var i = 0; i< order.length; i++){
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
