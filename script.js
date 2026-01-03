const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const xc = Math.floor(canvas.width/2) - 0.5;
const yc = Math.floor(canvas.height/2) -0.5;

let goal = false;
let score1 = 0;
let score2 = 0;
let speedinc = 0.2;



function drawBoard() {

    ctx.font = "24px serif";
    ctx.fillStyle = "#717070ff";
    ctx.fillText(score1, 120, 30);
    ctx.font = "24px serif";
    ctx.fillText(score2, 165, 30);

    ctx.rect(0, 0, canvas.width,canvas.height); 
    ctx.lineWidth =4;
    ctx.strokeStyle = "#ffffff"; 
    ctx.stroke();

    
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(xc,canvas.height);
    ctx.lineTo(xc,0);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(xc,yc,4,0,2*Math.PI);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fill();
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    mult(n) {
        return new Vector(this.x * n, this.y * n);
    }

    div(n) {
        return new Vector(this.x / n, this.y / n);
    }
    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    unit() {
        let m = this.mag();
        if (m == 0) {
            return new Vector(0, 0);
        }
        else return this.div(m);
    }

    normal() {
        return new Vector(-this.y, this.x);
    }

    static dot(v1, v2) {
        return (v1.x * v2.x) + (v1.y * v2.y);
    }

    static angle(v1, v2) {
        return Math.acos(Vector.dot(v1, v2) / (v1.mag() * v2.mag()));
    }

    zero() {
        this.x=0;
        this.y=0;
    }
}


class Ball {
    constructor(x,y,r) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.position = new Vector(x,y);
        this.vel = new Vector(-1.5+speedinc,1.5+speedinc);
    }
    //draw ball
    drawBall() {
        ctx.beginPath();
        ctx.arc(this.position.x,this.position.y,this.r,0,2*Math.PI);
        ctx.stroke();
        ctx.fillStyle = "#ffffffff"
        ctx.fill();
    }
    //movement of ball
    moveBall() {
        //position
        this.position =this.position.add(this.vel);
        // console.log("posx " +this.position.x)
        // console.log("posy "+ this.position.y)

    }
    // boundary collisions
    boundColl() {
        //collision
        if (this.position.y - this.r < 4) {
            //console.log("collision detected")
            //stop at boundary
            this.position.y  = 4 + this.r;
            //flip velocity
            this.vel.y = -this.vel.y;
            // console.log("velx " +this.vel.x);
            // console.log("vely " +this.vel.y);

            
        }
        else if (this.position.y + this.r > canvas.height-4) {
            //console.log("collision detected");
            this.position.y =  canvas.height - this.r -4;
            this.vel.y = -this.vel.y;
            // console.log("velx " +this.vel.x);
            // console.log("vely " +this.vel.y);
        }
    }
    // slider collision
    sliderColl(p1,p2) {
        const maxBounceAngle = Math.PI / 3;

        //inner surface of p1(left) slider
        if(this.vel.x < 0 &&
            this.position.x - this.r <= p1.position.x + 2 &&
            this.position.x - this.r >= p1.position.x &&
            this.position.y >= p1.position.y &&
            this.position.y <= p1.position.y + 20
        ) {
            this.position.x = p1.position.x + 2 + this.r;

            let center = p1.position.y + 20 / 2;
            let offset = (this.position.y - center) / (20 / 2);
            offset = Math.max(-1, Math.min(1, offset));

            let angle = offset * maxBounceAngle;
            let speed = this.vel.mag();

            this.vel.x = speed * Math.cos(angle)+speedinc;
            this.vel.y = speed * Math.sin(angle)+speedinc;
            
        }
        // inner surface of p2(right) slider
        if( this.vel.x>0 &&
            this.position.x +this.r >= p2.position.x && 
            this.position.x +this.r <= p2.position.x+2 && 
            this.position.y>=p2.position.y && 
            this.position.y<=p2.position.y+20
        ) {
            this.position.x = p2.position.x - this.r;

            let center = p2.position.y + 20 / 2;
            let offset = (this.position.y - center) / (20 / 2);
            offset = Math.max(-1, Math.min(1, offset));

            let angle = offset * maxBounceAngle;
            let speed = this.vel.mag();

            this.vel.x = -speed * Math.cos(angle)+speedinc;
            this.vel.y = speed * Math.sin(angle)+speedinc;
            
        }
    }
    //when goal is scored
    goalColl() {
        if(this.position.x - this.r<4) {
            this.position.x = 4 + this.r;
            this.vel.zero();
            score2++;
            goal = true;

        }
        if(this.position.x+this.r>canvas.width-4) {
            this.position.x =  canvas.width - this.r -4;
            this.vel.zero();
            score1++;
            goal = true;
        }

    }
    
}

class KeyState {
    constructor() {
        this.keys = {};

        globalThis.addEventListener("keydown", (e) => {
            this.keys[e.key] = true;
        });

        globalThis.addEventListener("keyup", (e) => {
            this.keys[e.key] = false;
        });
    }

    isDown(key) {
        return this.keys[key] === true;
    }
}

class Slider1 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.position = new Vector(x,y);
        this.vel = new Vector(0,4);
    }
    drawSlider() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x,this.position.y,2,20);
    }
    moveSlider() {
        if (this.position.y>4 && keyState.isDown("w")) this.position.y -= this.vel.y;
        
        if (this.position.y+24<canvas.height && keyState.isDown("s")) this.position.y += this.vel.y;
    } 
    
}
class Slider2 {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.position = new Vector(x,y);
        this.vel = new Vector(0,4);
    }
    drawSlider() {
        ctx.fillStyle = "white";
        ctx.fillRect(this.position.x,this.position.y,2,20);
    }
    moveSlider() {
        if (this.position.y>4 && keyState.isDown("ArrowUp")) this.position.y -= this.vel.y;
        if (this.position.y+24<canvas.height && keyState.isDown("ArrowDown")) this.position.y += this.vel.y;
    }
    
}

let p1_x = 9;
let p1_y = canvas.height/2-20;
let p2_x = canvas.width-10;
let p2_y = canvas.height/2-20


const p1 = new Slider1(p1_x,p1_y);
const p2 = new Slider2(p2_x,p2_y);
let ball = new Ball(xc,yc,1);
const keyState = new KeyState();


function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    ball.moveBall();
    ball.boundColl();
    ball.sliderColl(p1,p2);
    ball.goalColl();
    if(goal) {
        setTimeout(function() {
            ball = new Ball(xc,yc,1);
        },300)
        goal = false;
    };
    ball.drawBall();
    p1.moveSlider();
    p2.moveSlider();
    p1.drawSlider();
    p2.drawSlider();
    requestAnimationFrame(mainLoop); //repeat
}
requestAnimationFrame(mainLoop);
