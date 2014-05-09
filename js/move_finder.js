function MoveFinder(gameManager) {
	this.gameManager = gameManager;
	this.gameAnalyzer = new GameAnalyzer(gameManager);
	
};

MoveFinder.prototype.next = function(){
  return this.gameAnalyzer.smoothestDirection();
};