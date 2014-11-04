function Game(sketch){
    this.sketch = sketch;
    this.things = [];
    this.obstacles = [];
    this.timePlayed = 0;
    this.mouseClicks = [];

    this.spawnCooldown = 1000;
    this.trailCooldown = 0;
    this.lastSpawnTime = 0;
    this.lastTrailTime = 0;

    this.player = new Player(this);
    this.things.push(this.player);
    this.startTime = new Date();
}

Game.prototype = {
    constructor: Game,
    draw: function(timePassed){
        this.things.forEach(function(thing){
            thing.draw(timePassed)
        });
    },
    update: function(timePassed){
        this.spawnObstacles();
        this.spawnTrail();
    },
    spawnObstacles: function(){
        if (this.spawnCooldown > 1500) {
            this.spawnObstacle();
        }
        else {
            this.spawnCooldown = timePassed - this.lastSpawnTime;
        }
    },
    spawnTrail: function(){
        if (this.trailCooldown > 10) {
            var y, jumpingTime;
            if (this.player.jumping){
                jumpingTime = timePassed - this.player.jumpStartTime;
                y = this.player.startingY - this.player.calculateJumpHeight(jumpingTime);
            }
            else{
                y = this.player.startingY;
            }

            obstacle = new Obstacle(this);
            obstacle.spawnTime = timePassed;
            obstacle.startingY = y;
            obstacle.startingX = this.player.startingX;
            this.lastTrailTime = timePassed;
            this.obstacles.push(obstacle);
            this.things.push(obstacle);
            this.trailCooldown = 0;
        }
        else {
            this.trailCooldown = timePassed - this.lastTrailTime;
        }
    },
    spawnObstacle: function(){
        obstacle = new Obstacle(this);
        obstacle.spawnTime = timePassed;
        this.lastSpawnTime = timePassed;
        this.obstacles.push(obstacle);
        this.things.push(obstacle);
        this.spawnCooldown = 0;
    }
}

function Player(game){
    this.fill =  tinycolor("hsv(275, 100%, 100%)").toHsv()
    this.fill2 = tinycolor("hsv(275, 100%, 100%)").toHsv()
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
        this.draw1(this.game.sketch, timePassed);
        this.draw2(this.game.sketch, timePassed);
    },
    draw1: function(sketch, timePassed){
        var y, jumpingTime;
        if (this.jumping){
            jumpingTime = timePassed - this.jumpStartTime;
            y = this.startingY - this.calculateJumpHeight(jumpingTime);
        }
        else{
            y = this.startingY;
        }
        
        sketch.setFill(this.fill);
        sketch.rect(this.startingX, y, 40, 50);
    },
    draw2: function(sketch, timePassed){
        var color, jumpingTime;
        if (this.jumping){
            jumpingTime = timePassed - this.jumpStartTime;
            color = this.colorize(this.calculateJumpHeight(jumpingTime));
        }
        else{
            color = this.fill2;
        }
        sketch.setFill(color);
        sketch.rect(this.startingX,this.startingY2,40,300);
    },
    //0 < y < 50 < y < 78
    calculateJumpHeight: function(t){
        var v0 = 370;
        var a = -780;
        t = t/1000;
        var r = v0*t + a*t*t/2
        if(r < 0){
            this.jumping = false;
            return 0;
        }
        else{
            return r;
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
        return tinycolor("hsv(" + newCol + ", 100%, 100%)").toHsv()
    }
}

function Obstacle(game){
    this.fill = tinycolor("hsv(325, 100%, 100%)").toHsv();
    this.fill2 = tinycolor("hsv(325, 100%, 100%)").toHsv();
    this.startingX = 600;
    this.startingY = 200;
    this.startingY2 = 400;
    this.game = game;
}

Obstacle.prototype = {
    draw: function(timePassed){
        this.game.sketch.noStroke();
        this.draw1(this.game.sketch, timePassed);
        this.draw2(this.game.sketch, timePassed);
    },
    draw1: function(sketch, timePassed){
        sketch.setFill(this.fill);
        sketch.rect(this.calculateX(timePassed),this.startingY,40,50);
    },
    draw2: function(sketch, timePassed){
        sketch.setFill(this.fill2);
        sketch.rect(this.calculateX(timePassed),this.startingY2,40,300);
    },
    calculateX: function(timePassed){
        var aliveTime = timePassed - this.spawnTime;
        var x = this.startingX - aliveTime/5;
        return x;
    }
}

window.onload = function() {
    var game = new Game();

    var setupSketch = function(sketch){
        game.sketch = sketch;
        sketch.setup = function(){
            var myCanvas = sketch.createCanvas(1912, 1200);
            myCanvas.parent('canvas-container');
            sketch.colorMode(sketch.HSB,360,1,1)
            //Monkeypatch to allow for hash parameter instead of tuple parameters to fill method
            sketch.setFill = function(hsvHash){
                this.fill(hsvHash.h,hsvHash.s,hsvHash.v)
            }
        }

        sketch.draw = function(){
            sketch.background(255);
            timePassed = new Date() - game.startTime;
            game.update(timePassed);
            game.draw(timePassed);
        }

        sketch.mousePressed = function(){
            if(!game.player.jumping){
                game.player.jumping = true;
                timePressed = new Date() - game.startTime;
                game.player.jumpStartTime = timePressed;
                game.mouseClicks.push(timePressed);
            }
        }
    };

    var myp5 = new p5(setupSketch, 'canvas-container');
}