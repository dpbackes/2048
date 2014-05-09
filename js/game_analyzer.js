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

GameAnalyzer.prototype.smoothestDirectionWithDepth = function(depth) {
  var self = this;
  return this.minDirection(function(direction) {
      var grid = self.gridAfterMoveInDirection(direction);
      var smoothness = self.smoothnessWithDepth(grid, depth);
      return smoothness;
    });
};

GameAnalyzer.prototype.smoothestDirectionWithDepthMinusMergeScore = function(depth) {
  var self = this;
  return this.minDirection(function(direction) {
      var grid = self.gridAfterMoveInDirection(direction);
      var mergeScore = self.mergeScoreWithDepth(grid, depth) + self.scoreInDirection(direction);
      //return grid.moved ? self.smoothnessWithDepth(grid, depth) : Number.MAX_VALUE;
      var smoothness = self.smoothnessWithDepth(grid, depth)
      var moves = self.movesWithDepth(grid, depth);
      //return moves > 0 ? smoothness * moves / (grid.availableCells().length ? grid.availableCells().length*100 : 1) - mergeScore*100: Number.MAX_VALUE;
      console.log("dir "+direction+ " "+self.availableCellsWithDepth(grid, depth) + " "+moves/100);
      return self.availableCellsWithDepth(grid, depth) * -1;//smoothness - mergeScore + moves - grid.availableCells().length;
    });
};

GameAnalyzer.prototype.mostAvailableCellsWithDepth = function(depth) {
  var self = this;
  return this.minDirection(function(direction) {
      var grid = self.gridAfterMoveInDirection(direction);
      var availableCells = self.availableCellsWithDepth(grid, depth);
      console.log("dir " + direction+" Available "+availableCells);
      return availableCells;
    });
};

GameAnalyzer.prototype.availableCellsWithDepth = function(grid, depthToSearch) {
  var self = this;
  
  if(depthToSearch)
  {
    var newDepth = depthToSearch - 1;
    var result = this.eachDirection(function(direction){
      var newGrid = self.gridAfterMoveInDirection(direction, grid);
      return self.availableCellsWithDepth(newGrid, newDepth);
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

  return grid.availableCells().length;
};

GameAnalyzer.prototype.movesWithDepth = function(grid, depthToSearch) {
  var self = this;
  
  if(depthToSearch)
  {
    var newDepth = depthToSearch - 1;
    var result = this.eachDirection(function(direction){
      var newGrid = self.gridAfterMoveInDirection(direction, grid);
      return self.movesInDirection(direction, grid) + self.movesWithDepth(newGrid, newDepth);
    });
    
    var score = 0;
    for(var i = 0; i < result.length; i++)
    {
      score += result[i];
    }
    
    return score;
  }

  return 0;
};

GameAnalyzer.prototype.smoothnessWithDepth = function(grid, depthToSearch) {
  var self = this;
  
  if(depthToSearch)
  {
    var newDepth = depthToSearch - 1;
    var result = this.eachDirection(function(direction){
      var newGrid = self.gridAfterMoveInDirection(direction, grid);
      var result = self.smoothnessWithDepth(newGrid, newDepth);
      return result;
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

  return this.gridAnalyzer.CalculateSmoothness(grid);
};

GameAnalyzer.prototype.mergeScoreWithDepth = function(grid, depth)
{
  var self = this;
  
  var score = 0;

  if(depth)
  {
    var newDepth = depth - 1;
    var result = this.eachDirection(function(direction){
      var newGrid = self.gridAfterMoveInDirection(direction, grid);
      var myScore = 0;
      for(var i = 0; i < 4; i++)
      {
        if(i != direction)
        {
          myScore += self.scoreInDirection(i, grid) * depth * depth;
        }
        else
        {
          myScore -= self.scoreInDirection(i, grid) * depth;
        }
      }
      return myScore + self.mergeScoreWithDepth(newGrid, newDepth);
    });
    
    for(var i = 0; i < result.length; i++)
    {
      score += result[i];
    }
    
    return score;
  }

  return score;
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

GameAnalyzer.prototype.movesInDirection = function(direction, grid){
  var self = this;

  if(!grid)
  {
    grid = new Grid(this.gameManager.grid.size, this.gameManager.grid.serialize().cells);
  }

  var cell, tile;

  var vector     = this.gameManager.getVector(direction);
  var traversals = this.gameManager.buildTraversals(vector);

  var score = 0;

  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = grid.cellContent(cell);
      var mergeHappened = false;
      if (tile) {
        var positions = self.gameManager.findFarthestPosition(cell, vector, grid);
        var next      = grid.cellContent(positions.next);

        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];
          mergeHappened = true;
          grid.insertTile(merged);
          grid.removeTile(tile);

          tile.updatePosition(positions.next);
        } else {
          self.moveTile(grid, tile, positions.farthest);
        }

        if (!self.gameManager.positionsEqual(cell, tile) && !mergeHappened) {
          score += (Math.abs(cell.x - tile.x) + Math.abs(cell.y - tile.y)) * tile.value;
        }
      }
    });
  });

  return score;
};

GameAnalyzer.prototype.scoreInDirection = function(direction, grid){

  var self = this;

  if(!grid)
  {
    grid = new Grid(this.gameManager.grid.size, this.gameManager.grid.serialize().cells);
  }

  var cell, tile;

  var vector     = this.gameManager.getVector(direction);
  var traversals = this.gameManager.buildTraversals(vector);

  var moved = false;
  
  var score = 0;
  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = grid.cellContent(cell);

      if (tile) {
        var positions = self.gameManager.findFarthestPosition(cell, vector, grid);
        var next      = grid.cellContent(positions.next);

        if (next && next.value === tile.value && !next.mergedFrom) {
          score += tile.value * 2;
        }
      }
    });
  });

  return score;
};

GameAnalyzer.prototype.gridAfterMoveInDirection = function(direction, grid){

  var self = this;

  if(!grid)
  {
    grid = new Grid(this.gameManager.grid.size, this.gameManager.grid.serialize().cells);
  }

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
