function Game(sketch){
    this.sketch = sketch;
    this.things = [];
    this.obstacles = [];
    this.timePlayed = 0;
    this.mouseClicks = [];

    this.spawnCooldown = 1000;
    this.lastSpawnTime = 0;

    this.player = new Player(this);
    this.things.push(this.player);
    this.startTime = new Date();
}

Game.prototype = {
    constructor: Game,
    draw: function(){
        this.things.forEach(function(thing){
            thing.draw()
        });
    },
    update: function(timePassed){
        this.things.forEach(function(thing){
            thing.update(timePassed)
        });
        this.spawnObstacles();
    },
    spawnObstacles: function(){
        if (this.spawnCooldown > 1500) {
            this.spawnObstacle();
        }
        else {
            this.spawnCooldown = timePassed - this.lastSpawnTime;
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
    this.currentY = this.startingY;
    this.startingY2 = this.startingY + 200; 
    this.game = game;
}

Player.prototype = {
    constructor: Player,
    update: function(timePassed){
        if (this.jumping){
            jumpingTime = timePassed - this.jumpStartTime;
            this.currentY = this.startingY - this.calculateJumpHeight(jumpingTime);
            if(this.currentY === this.startingY){
                this.jumping = false;
            }
        }
        else{
            this.currentY = this.startingY;
        }
    },
    draw: function(){
        this.game.sketch.noStroke();
        this.draw1(this.game.sketch);
        this.draw2(this.game.sketch, timePassed);
        //this.drawTrajectory(this.game.sketch);
    },
    draw1: function(sketch){
        sketch.setFill(this.fill);
        sketch.rect(this.startingX, this.currentY, 40, 50);
    },
    drawTrajectory: function(){
        var trajectoryTimePassed, y, jumpingTime;
        var trajectoryTimePassed = this.jumpStartTime + 100;
        if (this.jumping) {
            console.log(trajectoryTimePassed)
            console.log(this.calculateJumpHeight(trajectoryTimePassed))
            while (this.calculateJumpHeight(trajectoryTimePassed) != 0){
                console.log("T: " + trajectoryTimePassed + "H: " + this.calculateJumpHeight(trajectoryTimePassed))
               // y = this.startingY - this.calculateJumpHeight(trajectoryTimePassed);

                /*obstacle = new Obstacle(this.game);
                obstacle.spawnTime = trajectoryTimePassed;
                obstacle.startingY = y;
                obstacle.startingX = this.startingX;
                this.game.obstacles.push(obstacle);
                this.game.things.push(obstacle);
*/
                trajectoryTimePassed = trajectoryTimePassed + 1000;
            }
        }
    },
    draw2: function(sketch){
        var color;
        if (this.jumping){
            color = this.colorize(this.startingY - this.currentY);
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
    draw: function(){
        this.game.sketch.noStroke();
        this.draw1(this.game.sketch);
        this.draw2(this.game.sketch);
    },
    draw1: function(sketch){
        sketch.setFill(this.fill);
        sketch.rect(this.calculateX(this.timePassed),this.startingY,40,50);
    },
    draw2: function(sketch){
        sketch.setFill(this.fill2);
        sketch.rect(this.calculateX(this.timePassed),this.startingY2,40,300);
    },
    update: function(timePassed){
        this.timePassed = timePassed;
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
            game.draw();
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