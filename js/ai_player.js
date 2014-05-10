function AiPlayer(gameManager, moveFinder) {
  this.events = {};
  this.gameManager = gameManager;
  
  var self = this;
  var run = function()
  {
    if(self.gameManager.over && !self.gameManager.won)
    {
      self.gameManager.restart();
    }
    if(!gameManager.won){
    
      var moves = moveFinder.next();
      for(var i = 0; i < moves.length; i++){
        if(self.move(moves[i])){
          return;
        }
      }
    }
  };

  setInterval(run, 200);
  $(document).click(function(e) { 
    // Check for left button
    if (e.button == 0) {
        run(); 
    }
});
}

AiPlayer.prototype.emit = function (event, data) {sc
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

AiPlayer.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

AiPlayer.prototype.move = function Move(dir){
  var previousState = new Grid(this.gameManager.grid.size, this.gameManager.grid.serialize().cells);
  this.gameManager.move(dir);
  if(!this.gameManager.grid.equals(previousState)){
    return true;
  }

  return false;
}
