function GridAnalyzer(grid){
  this.grid = grid;
}

GridAnalyzer.prototype.CalculateSmoothness = function(grid){
  var smoothness = 0;
  
  var difference = function(x, y, cell){
    if(grid.cells[x])
    {
      var otherCell = grid.cells[x][y];
      
      if(otherCell){
        return Math.log(Math.abs(otherCell.value - cell.value))/Math.log(2);
      }
    }

    return 0;
  };
  
  grid.eachCell(function(x, y, cell)
  {
    if(cell){
      smoothness += difference(x-1, y, cell);
      smoothness += difference(x+1, y, cell);
      smoothness += difference(x, y-1, cell);
      smoothness += difference(x, y+1, cell);
    }
  });
  
  return smoothness;
}