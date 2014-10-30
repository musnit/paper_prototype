paper.install(window);

function Game(sketch){
    this.sketch = sketch;
    this.things = [];
    this.obstacles = [];
    this.timePlayed = 0;
    this.mouseClicks = [];

    this.spawnCooldown = 0.5;

    this.player = new Player(this);
    this.player.jumping = false;
    this.player.startingX = 100; 
    this.player.startingY = 200; 
    this.player.startingPosition = new Point(this.player.startingX, this.player.startingY); 
    this.player.placedSymbol = this.player.symbol.place(this.player.startingPosition);
    this.player.startingX2 = 100; 
    this.player.startingY2 = 400; 
    this.player.startingPosition2 = new Point(this.player.startingX2, this.player.startingY2); 
    this.player.placedSymbol2 = this.player.symbol2.place(this.player.startingPosition2);
    this.things.push(this.player);
}

Game.prototype = {
    constructor: Game,
    setupSketch: function(sketch){
        this.sketch = sketch;
    },
    moveThings: function(event){
        this.things.forEach(function(thing){
            thing.move(event)
        });
    },
    spawnThings: function(event){
        if (this.spawnCooldown < 0) {
            obstacle = new Obstacle();
            obstacle.placedSymbol = obstacle.symbol.place(obstacle.startingPosition);
            obstacle.placedSymbol2 = obstacle.symbol2.place(obstacle.startingPosition2);
            obstacle.spawnTime = event.time;
            this.obstacles.push(obstacle);
            this.things.push(obstacle);
            this.spawnCooldown = 1.5;
        }
        else {
            this.spawnCooldown = this.spawnCooldown - event.delta;
        }    
    }
}

function Player(game){
    this.path = new Path.Rectangle([0, 0], [40, 50]);
    this.path2 = new Path.Rectangle([0, 0], [40, 300]);
    this.path.fillColor =  tinycolor("hsv(275, 100%, 100%)").toHexString()
    this.path2.fillColor = tinycolor("hsv(275, 100%, 100%)").toHexString()
    this.symbol = new Symbol(this.path);
    this.symbol2 = new Symbol(this.path2);
    this.game = game;
}

Player.prototype = {
    constructor: Player,
    move: function(event){
        if (this.startJump){
            this.startJump = false;
            this.jumping = true;
            this.jumpStartTime = event.time;
            this.game.mouseClicks.push(event.time);
        }
        if (this.jumping){
            var jumpingTime = event.time - this.jumpStartTime;
            this.newY = this.startingY - this.calculateJumpHeight(jumpingTime);
            this.placedSymbol.position = new Point(this.startingX, this.newY);
            this.newCol = this.colorize(this.calculateJumpHeight(jumpingTime));
            this.placedSymbol2.symbol._definition.fillColor = this.newCol;
        }
    },
    //0 < y < 50 < y < 78
    calculateJumpHeight: function(t){
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
    },
    // 250 < y < 300 < y < 328
    //TODO: Add blending/transparency to player and block so a miss is visualized nicer
    colorize: function(height){
        var newCol;
        if (height<50){
            newCol = height+250;
        }
        else{
            newCol = 328;
        }
        return tinycolor("hsv(" + newCol + ", 100%, 100%)").toHexString()
    }
}

function Obstacle(){
    this.path = new Path.Rectangle([0, 0], [40, 50]),
    this.path2 = new Path.Rectangle([0, 0], [40, 300]),
    this.path.fillColor = tinycolor("hsv(325, 100%, 100%)").toHexString();
    this.path2.fillColor = tinycolor("hsv(325, 100%, 100%)").toHexString();
    this.symbol = new Symbol(this.path),
    this.symbol2 = new Symbol(this.path2),
    this.startingX = 600,
    this.startingY = 200,
    this.startingY2 = 400,
    this.startingPosition = new Point(this.startingX, this.startingY),
    this.startingPosition2 = new Point(this.startingX, this.startingY2)
}

Obstacle.prototype = {
    move: function(event){
        var aliveTime = event.time - this.spawnTime;
        this.newX = this.startingX - aliveTime*200;
        this.placedSymbol.position = new Point(this.newX, this.startingY);
        this.placedSymbol2.position = new Point(this.newX, this.startingY2);
    }
}

function onMouseDown(event) {
    if(!game.player.jumping){
        game.player.startJump = true;
    }
}

window.onload = function() {
    paper.setup('myCanvas');
    clicker = new Tool();
    clicker.onMouseDown = onMouseDown;
    game = new Game();

    view.onFrame = function(event) {
        game.timePlayed = event.time;
        game.moveThings(event);
        game.spawnThings(event);
    }
}

