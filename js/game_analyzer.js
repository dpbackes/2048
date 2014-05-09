function GameAnalyzer(gameManager){
  this.gameManager = gameManager;

  this.gridAnalyzer = new GridAnalyzer(gameManager.grid);
}

GameAnalyzer.prototype.mostMerges = function() {
};

GameAnalyzer.prototype.smoothestDirection = function() {
  var self = this;
  return this.minDirection(function(direction) {
      var grid = self.gridAfterMoveInDirection(direction);
      return grid.moved ? self.gridAnalyzer.CalculateSmoothness(grid) : Number.MAX_VALUE;
    });
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
}

GameAnalyzer.prototype.gridAfterMoveInDirection = function(direction){

  var self = this;

  var grid = new Grid(this.gameManager.grid.size, this.gameManager.grid.serialize().cells);

  var cell, tile;

  var vector     = this.gameManager.getVector(direction);
  var traversals = this.gameManager.buildTraversals(vector);

  var moved = false;

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = grid.cellContent(cell);

      if (tile) {
        var positions = self.gameManager.findFarthestPosition(cell, vector);
        var next      = grid.cellContent(positions.next);

        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          grid.insertTile(merged);
          grid.removeTile(tile);

          tile.updatePosition(positions.next);
        } else {
          self.moveTile(grid, tile, positions.farthest);
        }

        if (!self.gameManager.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  grid.moved = moved;

  return grid;
};

GameAnalyzer.prototype.moveTile = function (grid, tile, cell) {
  grid.cells[tile.x][tile.y] = null;
  grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};
