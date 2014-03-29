function Play()
{
  setInterval(Press, 1000);
}

function AiPlayer(gameManager) {
  this.events = {};
  var self = this;
  var press = function()
  {
    tryMove(gameManager);
  };

  setInterval(press, 100);
}

function tryMove(gameManager)
{
  var previousState = new Grid(gameManager.grid.size, gameManager.grid.serialize().cells);
  gameManager.move(0);
  if(!gameManager.grid.equals(previousState)){
    return;
  }

  gameManager.move(1);
  if(!gameManager.grid.equals(previousState)){
    return;
  }

  gameManager.move(2);
  if(!gameManager.grid.equals(previousState)){
    return;
  }

  gameManager.move(3);
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
