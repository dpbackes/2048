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
    
    if(cell && (x >= grid.size || x < 0 || y >= grid.size || y < 0))
    {
      return -1 * cell.value ;
    }
    
    return 0;
  };
  
  grid.eachCell(function(x, y, cell)
  {
    //if(cell){
      smoothness += difference(x-1, y, cell);
      smoothness += difference(x-1, y-1, cell);
      smoothness += difference(x, y-1, cell);
      smoothness += difference(x+1, y-1, cell);
      smoothness += difference(x+1, y, cell);
      smoothness += difference(x+1, y+1, cell);
      smoothness += difference(x, y+1, cell);
      smoothness += difference(x-1, y+1, cell);
    //}
  });
  
  return smoothness;
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
    if(this.grid.cells[columnIndex] && this.grid.cells[columnIndex])
    {
      if(this.grid.cells[columnIndex][i] && this.grid.cells[columnIndex][i+1])
      {
        if(this.grid.cells[columnIndex][i].value == this.grid.cells[columnIndex][i+1])
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