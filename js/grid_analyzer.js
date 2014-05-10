function GridAnalyzer(grid){
  this.grid = grid;
}

GridAnalyzer.prototype.CalculateSmoothness = function(grid){
  var self = this;
  var smoothness = 0;
  
  var difference = function(x, y, cell){
    if(grid.cells[x])
    {
      var otherCell = grid.cells[x][y];
      
      if(cell && otherCell && otherCell.value != cell.value){
        return Math.abs(otherCell.value - cell.value)*cell.value;
      }
      
      if(cell && otherCell && x != cell.x && y != cell.y && cell.value == otherCell.value)
      {
        return cell.value;
      }
      
      if(otherCell){
        return otherCell.value;
      }
    }
    
    /* if(cell && (x >= grid.size || x < 0 || y >= grid.size || y < 0))
    {
      return -1 * cell.value ;
    } */
    
    return 0;
  };
  
  grid.eachCell(function(x, y, cell)
  {
    //if(cell){
      smoothness += difference(x-1, y, cell);
      //smoothness += difference(x-1, y-1, cell);
      smoothness += difference(x, y-1, cell);
      //smoothness += difference(x+1, y-1, cell);
      smoothness += difference(x+1, y, cell);
      //smoothness += difference(x+1, y+1, cell);
      smoothness += difference(x, y+1, cell);
      //smoothness += difference(x-1, y+1, cell);
    //}
  });
  
  return smoothness;
}

GridAnalyzer.prototype.score = function()
{
  var score = 0;
  
  if(!this.grid.cellOccupied({x: 3, y: 0})){
    score += 100000;
  }
  
  if(this.grid.cells[3][0] && this.grid.cells[3][1] && this.grid.cells[3][0].value < this.grid.cells[3][1].value)
  {
    score += 10000
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

GridAnalyzer.prototype.LeftCellLessThanCount = function(columnIndex){
  var count = 0;
  for(var i = 0; i < this.grid.size; i++)
  {
    if(this.grid.cells[columnIndex] && this.grid.cells[columnIndex -1])
    {
      if(this.grid.cells[columnIndex][i] && this.grid.cells[columnIndex-1][i])
      {
        if(this.grid.cells[columnIndex][i].value < this.grid.cells[columnIndex-1][i].value)
        {
          count++;
        }
      }
    }
  }
  
  return count;
};

GridAnalyzer.prototype.ColumnMergesFromLeft = function(columnIndex){
  var merges = 0;
  for(var i = 0; i < this.grid.size; i++)
  {
    if(this.grid.cells[columnIndex] && this.grid.cells[columnIndex -1])
    {
      if(this.grid.cells[columnIndex][i] && this.grid.cells[columnIndex-1][i])
      {
        if(this.grid.cells[columnIndex][i].value == this.grid.cells[columnIndex-1][i].value)
        {
          merges++;
        }
      }
    }
  }
  
  return merges;
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