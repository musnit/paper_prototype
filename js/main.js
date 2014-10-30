
paper.install(window);
window.onload = function() {
    paper.setup('myCanvas');
    Game = {};
    Game.things = [];
    Game.obstacles = [];
    Game.timePlayed = 0;
    Game.mouseClicks = [];

    Game.moveThings = function(event){
        Game.things.forEach(function(thing){
            thing.move(event)
        });
    }

    Game.spawnThings = function(event){
        if (Game.spawnCooldown < 0) {
            obstacle = new Game.Obstacle();
            obstacle.placedSymbol = obstacle.symbol.place(obstacle.startingPosition);
            obstacle.placedSymbol2 = obstacle.symbol2.place(obstacle.startingPosition2);
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
    Game.player.path2 = new Path.Rectangle([0, 0], [40, 300]);
    Game.player.path.fillColor =  tinycolor("hsv(275, 100%, 100%)").toHexString()
    Game.player.path2.fillColor = tinycolor("hsv(275, 100%, 100%)").toHexString()
    Game.player.symbol = new Symbol(Game.player.path);
    Game.player.symbol2 = new Symbol(Game.player.path2);
    Game.player.move = function(event){
        if (Game.player.startJump){
            Game.player.startJump = false;
            Game.player.jumping = true;
            Game.player.jumpStartTime = event.time;
            Game.mouseClicks.push(event.time);
        }
        if (Game.player.jumping){
            var jumpingTime = event.time - this.jumpStartTime;
            this.newY = this.startingY - this.calculateJumpHeight(jumpingTime);
            this.placedSymbol.position = new Point(this.startingX, this.newY);
            this.newCol = this.colorize(this.calculateJumpHeight(jumpingTime));
            this.placedSymbol2.symbol._definition.fillColor = this.newCol;
        }
    };
    //0 < y < 50 < y < 78
    Game.player.calculateJumpHeight = function(t){
        var v0 = 370;
        var a = -780;
        var r = v0*t + a*t*t/2
        if(r < 0){
            this.jumping = false;
            return 0;
        }
        else{
            return (v0*t + a*t*t/2);
        }
    };
    // 250 < y < 300 < y < 328
    //TODO: Add blending/transparency to player and block so a miss is visualized nicer
    Game.player.colorize = function(height){
        var newCol;
        if (height<50){
            newCol = height+250;
        }
        else{
            newCol = 328;
        }
        return tinycolor("hsv(" + newCol + ", 100%, 100%)").toHexString()
    };

    Game.Obstacle = function(){};
    Game.Obstacle.prototype.path = new Path.Rectangle([0, 0], [40, 50]);
    Game.Obstacle.prototype.path2 = new Path.Rectangle([0, 0], [40, 300]);
    Game.Obstacle.prototype.path.fillColor =  tinycolor("hsv(325, 100%, 100%)").toHexString()
    Game.Obstacle.prototype.path2.fillColor =  tinycolor("hsv(325, 100%, 100%)").toHexString()
    Game.Obstacle.prototype.symbol = new Symbol(Game.Obstacle.prototype.path);
    Game.Obstacle.prototype.symbol2 = new Symbol(Game.Obstacle.prototype.path2);
    Game.Obstacle.prototype.startingX = 600; 
    Game.Obstacle.prototype.startingY = 200; 
    Game.Obstacle.prototype.startingY2 = 400; 
    Game.Obstacle.prototype.startingPosition = new Point(Game.Obstacle.prototype.startingX, Game.Obstacle.prototype.startingY); 
    Game.Obstacle.prototype.startingPosition2 = new Point(Game.Obstacle.prototype.startingX, Game.Obstacle.prototype.startingY2); 
    Game.Obstacle.prototype.move = function(event){
        var aliveTime = event.time - this.spawnTime;
        this.newX = this.startingX - aliveTime*200;
        this.placedSymbol.position = new Point(this.newX, this.startingY);
        this.placedSymbol2.position = new Point(this.newX, this.startingY2);
    };

    Game.spawnCooldown = 0.5;

    Game.player.jumping = false;
    Game.player.startingX = 100; 
    Game.player.startingY = 200; 
    Game.player.startingPosition = new Point(Game.player.startingX, Game.player.startingY); 
    Game.player.placedSymbol = Game.player.symbol.place(Game.player.startingPosition);
    Game.player.startingX2 = 100; 
    Game.player.startingY2 = 400; 
    Game.player.startingPosition2 = new Point(Game.player.startingX2, Game.player.startingY2); 
    Game.player.placedSymbol2 = Game.player.symbol2.place(Game.player.startingPosition2);
    Game.things.push(Game.player);

    view.onFrame = function(event) {
        Game.timePlayed = event.time;
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