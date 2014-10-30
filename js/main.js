function Game(sketch){
    this.sketch = sketch;
    this.things = [];
    this.obstacles = [];
    this.timePlayed = 0;
    this.mouseClicks = [];

    this.spawnCooldown = 0.5;

    this.player = new Player(this);
    this.things.push(this.player);
    this.startTime = new Date();
}

Game.prototype = {
    constructor: Game,
    moveThings: function(event){
        this.things.forEach(function(thing){
            thing.move(event)
        });
    },
    drawThings: function(timePassed){
        this.things.forEach(function(thing){
            thing.draw(timePassed)
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
    this.fillColor =  tinycolor("hsv(275, 100%, 100%)").toHsv()
    this.fillColor2 = tinycolor("hsv(275, 100%, 100%)").toHsv()
    this.jumping = false;
    this.startingX = 100; 
    this.startingY = 200; 
    this.startingY2 = 400; 
    this.game = game;
}

Player.prototype = {
    constructor: Player,
    draw: function(timePassed){
        this.game.sketch.noStroke();
        this.game.sketch.setFill(this.fillColor);
        this.draw1(this.game.sketch);
        this.game.sketch.setFill(this.fillColor2);
        this.draw2(this.game.sketch);
    },
    draw1: function(sketch){
        sketch.rect(this.startingX,this.startingY,40,50);
    },
    draw2: function(sketch){
        sketch.rect(this.startingX,this.startingY2,40,300);
    },
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
    this.fillColor = tinycolor("hsv(325, 100%, 100%)").toHexString();
    this.fillColor2 = tinycolor("hsv(325, 100%, 100%)").toHexString();
    this.startingX = 600;
    this.startingY = 200;
    this.startingY2 = 400;
}

Obstacle.prototype = {
    draw1: function(sketch){
        sketch.fill(12);
        sketch.rect(this.startingX,this.startingY,40,50);
    },
    draw2: function(sketch){
        sketch.fill(12);
        sketch.rect(this.startingX,this.startingY2,40,300);
    },
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
    var game = new Game();

    var setupSketch = function(sketch){
        game.sketch = sketch;
        sketch.setup = function(){
            var myCanvas = sketch.createCanvas(600, 1200);
            myCanvas.parent('canvas-container');
            sketch.colorMode(sketch.HSB,360,1,1)
            sketch.setFill = function(hsvHash){
                this.fill(hsvHash.h,hsvHash.s,hsvHash.v)
            }
        }

        sketch.draw = function(){
            sketch.background(255);
            timePassed = new Date() - game.startTime;
            game.drawThings(timePassed);
            game.spawnThings(timePassed);
        }
    };

    var myp5 = new p5(setupSketch, 'canvas-container');
}