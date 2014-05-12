function GridAnalyzer(grid){
  this.grid = grid;
}

GridAnalyzer.prototype.score = function()
{
  var score = 0;
  
  if(!this.grid.cellOccupied({x: 3, y: 0})){
    score += 100000;
  }
  
  score += (Math.pow(this.grid.size, 2) - this.grid.availableCells().length);
  
  score += this.DiagonalMatchCount();
  
  if(!this.ColumnFull(3))
  {
    score += 100;
  }
  
  return score;
}

GridAnalyzer.prototype.DiagonalMatchCount = function()
{
  var count = 0;
  var self = this;
  this.grid.eachCell(function(x, y, cell)
  {
    if(self.grid.cells[x+1])
    {
      if(cell && self.grid.cells[x+1][y-1] && self.grid.cells[x+1][y-1].value == cell.value)
      {
        count++;
      }
      
      if(cell && self.grid.cells[x+1][y+1] && self.grid.cells[x+1][y+1].value == cell.value)
      {
        count++;
      }
    }
  });
  
  return count;
}

GridAnalyzer.prototype.ColumnFull = function(columnIndex){
  for(var i = 0; i < this.grid.size; i++){
    if(!this.grid.cellOccupied({x:columnIndex, y:i})){
      return false;
    }
  }
  
  return true;
};

GridAnalyzer.prototype.ColumnHasVerticalMerges = function(columnIndex){
  
  for(var i = 0; i < this.grid.size-1; i++)
  {
    if(this.grid.cells[columnIndex])
    {
      if(this.grid.cells[columnIndex][i] && this.grid.cells[columnIndex][i+1])
      {
        if(this.grid.cells[columnIndex][i].value == this.grid.cells[columnIndex][i+1].value)
        {
          return true;
        }
      }
    }
  }

  return false;
};

GridAnalyzer.prototype.LogBaseTwo = function(value)
{
  return Math.log(value)/Math.log(2);
};