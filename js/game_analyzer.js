function GameAnalyzer(gameManager){
	this.gameManager = gameManager;

	this.gridAnalyzer = new GridAnalyzer(gameManager.grid);
}

GameAnalyzer.prototype.smoothestDirection = function() {
  var result = []
  
  var upGrid = this.gridAfterMoveInDirection(Ai2048.direction.up);
  result[Ai2048.direction.up] = upGrid.moved ? this.gridAnalyzer.CalculateSmoothness(upGrid) : Number.MAX_VALUE;
  
  var rightGrid = this.gridAfterMoveInDirection(Ai2048.direction.right);
  result[Ai2048.direction.right] = rightGrid.moved ? this.gridAnalyzer.CalculateSmoothness(rightGrid) : Number.MAX_VALUE;
  
  var downGrid = this.gridAfterMoveInDirection(Ai2048.direction.down)
  result[Ai2048.direction.down] = downGrid.moved ? this.gridAnalyzer.CalculateSmoothness(downGrid) : Number.MAX_VALUE;
  
  var leftGrid = this.gridAfterMoveInDirection(Ai2048.direction.left);
  result[Ai2048.direction.left] = leftGrid.moved ? this.gridAnalyzer.CalculateSmoothness(leftGrid) : Number.MAX_VALUE;
  
  var smoothestVal = result[0];
  var smoothestIndex = 0;
  for(var i = 0; i < result.length; i++){
    if(result[i] < smoothestVal){
      smoothestIndex = i;
    }
  }
  
  return smoothestIndex;
};

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
