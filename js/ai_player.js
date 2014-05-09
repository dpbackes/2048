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
      if(!self.move(moveFinder.next()))
      {
        for(var i = 0; i < 4; i++){
          if(self.move(i)){
            return;
          }
        }
      };
    }
  };

  setInterval(run, 100);
}

AiPlayer.prototype.emit = function (event, data) {
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
