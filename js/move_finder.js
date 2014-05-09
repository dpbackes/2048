function MoveFinder(gameManager) {
	this.gameManager = gameManager;
	this.gameAnalyzer = new GameAnalyzer(gameManager);
	
};

MoveFinder.prototype.next = function(){
  var self = this;
  return this.noPriority(function() {
    var dir = self.gameAnalyzer.smoothestDirectionWithDepth(1);
    return dir;
  });
};

MoveFinder.prototype.noPriority = function(callback){
  var dir = callback();
  
  var dirs = [Ai2048.direction.up, Ai2048.direction.right, Ai2048.direction.down, Ai2048.direction.left];
  
  dirs.unshift(dir);
  
  return dirs;
  
};

MoveFinder.prototype.prioritizeDirections = function(callback){
  var dir = callback();
  
  if(dir == Ai2048.direction.up){
    return [Ai2048.direction.up, Ai2048.direction.right, Ai2048.direction.down, Ai2048.direction.left];
  }
  
  if(dir == Ai2048.direction.right){
    return [Ai2048.direction.right, Ai2048.direction.up, Ai2048.direction.down, Ai2048.direction.left];
  }
  
  if(dir == Ai2048.direction.down){

    if(new GridAnalyzer(this.gameManager.grid).ColumnFull(this.gameManager.grid.size-1)
      && !(new GridAnalyzer(this.gameManager.grid).ColumnHasVerticalMerges(this.gameManager.grid.size-1)))
    {
      return [Ai2048.direction.down, Ai2048.direction.up, Ai2048.direction.right, Ai2048.direction.left];
    }

    return [Ai2048.direction.right, Ai2048.direction.up, Ai2048.direction.down, Ai2048.direction.left];
  }
  
  return [Ai2048.direction.right, Ai2048.direction.up, Ai2048.direction.down, Ai2048.direction.left];
};