function GridAnalyzer(grid){
  this.grid = grid;
}

GridAnalyzer.prototype.score = function()
{
  var score = 0;

  if(!this.UpperRightIsLargestInColumn()){
    score += 100010;
  }

  if(!this.grid.cellOccupied({x: 3, y: 0})){
    score += 100000;
  }

  if(!this.RightColumnInDescendingOrder()){
    score += 1000;
  }

  score += (Math.pow(this.grid.size, 2) - this.grid.availableCells().length);

  score += this.DiagonalMatchCount();

  if(!this.ColumnFull(3))
  {
    score += 100;
  }
  else
  {
    if(this.grid.cells[2][3] && this.grid.cells[2][3].value > this.grid.cells[3][3].value)
    {
      score += 10;
    }
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

GridAnalyzer.prototype.RightColumnInDescendingOrder = function(){
  var largestScore = 0;
  for(var i = 1; i < this.grid.size-1; i++)
  {
    if(this.grid.cells[3][i] && this.grid.cells[3][i+1] && this.grid.cells[3][i+1].value > this.grid.cells[3][i].value){
      return false;
    }
  }

  return true;
};

GridAnalyzer.prototype.UpperRightIsLargestInColumn = function(){
  var largestScore = 0;
  for(var i = 1; i < this.grid.size; i++)
  {
    if(this.grid.cells[3][0] && this.grid.cells[3][i] && this.grid.cells[3][i].value > this.grid.cells[3][0].value){
      return false;
    }

    if(!(this.grid.cells[3][0]) && this.grid.cells[3][i]){
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
