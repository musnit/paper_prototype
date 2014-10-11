
paper.install(window);
window.onload = function() {
    paper.setup('myCanvas');
    Game = {};
    Game.things = [];
    Game.obstacles = [];
    
    Game.moveThings = function(event){
        Game.things.forEach(function(thing){
            thing.move(event)
        });
    }

    Game.spawnThings = function(event){
        if (Game.spawnCooldown < 0) {
            obstacle = new Game.Obstacle();
            obstacle.placedSymbol = obstacle.symbol.place(obstacle.startingPosition);
            obstacle.spawnTime = event.time;
            Game.obstacles.push(obstacle);
            Game.things.push(obstacle);
            Game.spawnCooldown = 1.5;
        }
        else {
            Game.spawnCooldown = Game.spawnCooldown - event.delta;
        }
    }

    Game.player = {};
    Game.player.path = new Path.Rectangle([0, 0], [40, 50]);
    Game.player.path.fillColor = 'blue'
    Game.player.symbol = new Symbol(Game.player.path);
    Game.player.move = function(event){
        if (Game.player.startJump){
            Game.player.startJump = false;
            Game.player.jumping = true;
            Game.player.jumpStartTime = event.time;
        }
        if (Game.player.jumping){
            var jumpingTime = event.time - this.jumpStartTime;
            this.newY = this.calculateJumpHeight(jumpingTime);
            this.placedSymbol.position = new Point(this.startingX, this.newY);
        }
    };
    Game.player.calculateJumpHeight = function(t){
        var v0 = 370;
        var a = -780;
        var r = v0*t + a*t*t/2
        if(r < 0){
            this.jumping = false;
            return this.startingY;
        }
        else{
            return this.startingY-(v0*t + a*t*t/2);
        }
    };

    Game.Obstacle = function(){};
    Game.Obstacle.prototype.path = new Path.Rectangle([0, 0], [40, 50]);
    Game.Obstacle.prototype.path.fillColor = 'red'
    Game.Obstacle.prototype.symbol = new Symbol(Game.Obstacle.prototype.path);
    Game.Obstacle.prototype.startingX = 600; 
    Game.Obstacle.prototype.startingY = 400; 
    Game.Obstacle.prototype.startingPosition = new Point(Game.Obstacle.prototype.startingX, Game.Obstacle.prototype.startingY); 
    Game.Obstacle.prototype.move = function(event){
        var aliveTime = event.time - this.spawnTime;
        this.newX = this.startingX - aliveTime*200;
        this.placedSymbol.position = new Point(this.newX, this.startingY);
    };

    Game.PlayerTrail = Game.Obstacle;
    
    Game.spawnCooldown = 0.5;

    Game.player.jumping = false;
    Game.player.startingX = 100; 
    Game.player.startingY = 400; 
    Game.player.startingPosition = new Point(Game.player.startingX, Game.player.startingY); 
    Game.player.placedSymbol = Game.player.symbol.place(Game.player.startingPosition);
    Game.things.push(Game.player);

    view.onFrame = function(event) {
        Game.moveThings(event);
        Game.spawnThings(event);
    }

    function onMouseDown(event) {
        if(!Game.player.jumping){
            Game.player.startJump = true;
        }
    }
    clicker = new Tool();
    clicker.onMouseDown = onMouseDown;

}