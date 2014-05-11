function GameAnalyzer(gameManager){
  this.gameManager = gameManager;
  this.gridAnalyzer = new GridAnalyzer(gameManager.grid);
}

GameAnalyzer.prototype.bestGridScoreAtDepth = function(depth) {
  var self = this;
  return this.minDirection(function(direction) {
      var grid = self.gridAfterMoveInDirection(direction);
      var score = self.gridScoreWithDepth(grid, depth-1);
      return score;
    });
};

GameAnalyzer.prototype.gridScoreWithDepth = function(grid, depthToSearch) {
  var self = this;
  
  if(depthToSearch)
  {
    var newDepth = depthToSearch - 1;
    var result = this.eachDirection(function(direction){
      var newGrid = self.gridAfterMoveInDirection(direction, grid);
      return new GridAnalyzer(grid).score() + self.gridScoreWithDepth(newGrid, newDepth);
    });
    
    var score = result[0];
    for(var i = 0; i < result.length; i++)
    {
      if(score > result[i])
      {
        score = result[i];
      }
    }
    
    return score;
  }

  return new GridAnalyzer(grid).score();
};

GameAnalyzer.prototype.maxDirection = function(callback)
{
  var result = this.eachDirection(callback);
  
  var val = result[0];
  var index = 0;
  for(var i = 0; i < result.length; i++){
    if(result[i] > val){
      val = result[i];
      index = i;
    }
  }

  return index;
};

GameAnalyzer.prototype.minDirection = function(callback)
{
  var result = this.eachDirection(callback);
  
  var val = result[0];
  var index = 0;
  for(var i = 0; i < result.length; i++){
    if(result[i] < val){
      val = result[i];
      index = i;
    }
  }

  return index;
};

GameAnalyzer.prototype.eachDirection = function(callback){
  var result = [];
  for(var i = 0; i < Ai2048.direction.length; i++){
    result[i] = callback(i);
  }
  
  return result;
};

GameAnalyzer.prototype.gridAfterMoveInDirection = function(direction, grid){

  var self = this;

  var returnGrid;
  
  if(!grid)
  {
    returnGrid = new Grid(this.gameManager.grid.size, this.gameManager.grid.serialize().cells);
  }
  else
  {
    returnGrid = new Grid(grid.size, grid.serialize().cells);
  }
  
  
  var cell, tile;

  var vector     = this.gameManager.getVector(direction);
  var traversals = this.gameManager.buildTraversals(vector);

  var moved = false;

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = returnGrid.cellContent(cell);

      if (tile) {
        var positions = self.gameManager.findFarthestPosition(cell, vector, returnGrid);
        var next      = returnGrid.cellContent(positions.next);

        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          returnGrid.insertTile(merged);
          returnGrid.removeTile(tile);

          tile.updatePosition(positions.next);
        } else {
          self.moveTile(returnGrid, tile, positions.farthest);
        }

        if (!self.gameManager.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  returnGrid.moved = moved;

  return returnGrid;
};

GameAnalyzer.prototype.moveTile = function (grid, tile, cell) {
  grid.cells[tile.x][tile.y] = null;
  grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};
