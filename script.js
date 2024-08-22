'use strict'

export class Wiper
{
    constructor(pos, len, bottomRad, topRad)
    {
        this.pos = pos;
        this.len = len/2;
        this.bottomRad = bottomRad;
        this.topRad = topRad;

        this.base = new Vector2(0, 0);
        this.tip = new Vector2(0, -len/2);

        this.update();
    }

    update(rot = 0.0)
    {
        let cos = Math.cos(rot);
        let sin = Math.sin(rot);

        this.tPosBase = new Vector2(cos * this.base.x - sin * this.base.y, sin * this.base.x + cos * this.base.y);
        this.tPosTip = new Vector2(cos * this.tip.x - sin * this.tip.y, sin * this.tip.x + cos * this.tip.y);

        this.tPosBase = this.tPosBase.addV(this.pos);
        this.tPosTip = this.tPosTip.addV(this.pos);

        this.dir = this.tPosTip.subV(this.tPosBase).normalized();
        this.nor = new Vector2(-this.dir.y, this.dir.x);
    }

    render(ctx)
    {
        ctx.beginPath();
        ctx.fillStyle = "#452B1F";
        ctx.moveTo(this.tPosBase.subV(this.nor.mulS(this.bottomRad)).x, this.tPosBase.subV(this.nor.mulS(this.bottomRad)).y);
        ctx.lineTo(this.tPosTip.subV(this.nor.mulS(this.topRad)).x, this.tPosTip.subV(this.nor.mulS(this.topRad)).y);
        ctx.lineTo(this.tPosTip.addV(this.nor.mulS(this.topRad)).x, this.tPosTip.addV(this.nor.mulS(this.topRad)).y);
        ctx.lineTo(this.tPosBase.addV(this.nor.mulS(this.bottomRad)).x, this.tPosBase.addV(this.nor.mulS(this.bottomRad)).y);
        ctx.lineTo(this.tPosBase.subV(this.nor.mulS(this.bottomRad)).x, this.tPosBase.subV(this.nor.mulS(this.bottomRad)).y);
        ctx.fill();
    }
}

export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    addS(s) {
        return new Vector2(this.x + s, this.y + s);
    }

    subS(s) {
        return new Vector2(this.x - s, this.y - s);
    }

    mulS(s) {
        return new Vector2(this.x * s, this.y * s);
    }

    divS(s) {
        return new Vector2(this.x / s, this.y / s);
    }

    addV(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subV(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mulV(v) {
        return new Vector2(this.x * v.x, this.y * v.y);
    }

    divV(v) {
        return new Vector2(this.x / v.x, this.y / v.y);
    }

    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalized() {
        const len = this.len();

        return new Vector2(this.x / len, this.y / len);
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
}

const images = [
    'b_43.png', 'b_44.png', 'b_45.png', 'b_46.png', 
    // 'b_47.png', 'b_48.png',
     'b_49.png', 'b_50.png'
];

export class Ball {
    constructor(pos, r) {
        this.pos = pos;
        this.r = r;
        this.mass = r;
        this.v = new Vector2(0, 0);
        this.image = new Image();
        this.image.src = getRandomImage();
        this.angle = 0; // new property to store the rotation angle
        this.angularVelocity = 0.01; // new property to store the angular velocity
    }

    addForce(f) {
        this.v = this.v.addV(f.divS(this.mass));
    }

    update(stepDivision) {
        this.pos = this.pos.addV(this.v.divS(stepDivision));
        this.angle += this.angularVelocity; // update the rotation angle
    }

    updateFriction(friction) {
        this.v = this.v.mulS(friction);
    }

    render(ctx) {
       
        ctx.save(); // save the current transformation matrix
        ctx.translate(this.pos.x, this.pos.y); // translate to the ball's position
        ctx.rotate(this.angle); // rotate by the ball's angle
        ctx.drawImage(this.image, -this.r, -this.r, this.r * 2, this.r * 2);
        ctx.restore(); // restore the original transformation matrix
    }

    // New methods for physical effects
    applyGravity(gravity) {
        this.addForce(new Vector2(0, gravity));
    }

    checkCollision(ball) {
        const distance = this.pos.distance(ball.pos);
        if (distance < this.r + ball.r) {
            this.resolveCollision(ball);
        }
    }

    resolveCollision(ball) {
        const normal = this.pos.subV(ball.pos).normalize();
        const impulse = this.v.subV(ball.v);
        const j = impulse.dotV(normal);
        j = j / (1 / this.mass + 1 / ball.mass);
        const impulseVector = normal.mulS(j);
        this.v = this.v.subV(impulseVector.mulS(1 / this.mass));
        ball.v = ball.v.addV(impulseVector.mulS(1 / ball.mass));
    }
}

function getRandomImage() {
    return images[Math.floor(Math.random() * images.length)];
}

// Example usage:
const balls = [];
for (let i = 0; i < 10; i++) {
    balls.push(new Ball(new Vector2(Math.random() * 400, Math.random() * 400), 20));
    balls[i].angularVelocity = Math.random() * 0.1 - 0.05; // random angular velocity
}

function update() {
    for (const ball of balls) {
        ball.applyGravity(0.1);
        ball.update(1);
        ball.updateFriction(0.99);
    }

    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            balls[i].checkCollision(balls[j]);
        }
    }
}


export class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.cvs = document.getElementById("cvs");
        this.cvs.setAttribute("width", width);
        this.cvs.setAttribute("height", height);
        this.ctx = this.cvs.getContext("2d");

        this.times = [];
    }

    start() {
        this.init();
        this.run();
    }

    init() {
        this.friction = 0.995;
        this.gravity = 0.15;
        this.screenBounds = false;
        this.maxBalls = 300;
        this.balls = [];
        this.spread = 0.8;
        this.wiperForce = 150.0;
        this.wiperSpeed = 1.5;
        this.stepDivision = 3 * this.wiperSpeed;
        this.wiper = new Wiper(new Vector2(this.width / 2.0, this.height / 2.0), this.height * 0.8, 5, 3);

        for (let i = 0; i < this.maxBalls - this.balls.length; i++) {
            let b = new Ball(new Vector2(
                (Math.random() - 0.5) * this.width * this.spread + this.width / 2.0,
                (Math.random() - 0.5) * this.height * this.spread + this.height / 2.0 - this.height), Math.random() * 10 + 12);

            b.addForce(new Vector2((Math.random() - 0.5), (Math.random() - 0.5)).mulV(new Vector2(100, 200)));
            this.balls.push(b);
        }

        let b = new Ball(new Vector2(500, 100), 10);
        b.addForce(new Vector2(0, 0));

        this.balls.push(b);

        b = new Ball(new Vector2(200, 110), 10);
        b.addForce(new Vector2(-10, 0));

        this.balls.push(b);
    }

    run() {
        const now = performance.now();

        this.times.push(now);

        if (now - this.times[0] > 1000)
            this.times.shift();

        this.update((now - this.times[this.times.length - 2]) / 1000);
        this.render();

        requestAnimationFrame(this.run.bind(this));
    }

    update(delta) {
        this.balls.forEach(b => {
            b.addForce(new Vector2(0, this.gravity * (144.0 / this.times.length)));
            b.updateFriction(this.friction);
        });

        for (let i = 0; i < this.stepDivision; i++) {
            this.balls.forEach(b => {
                b.update(this.stepDivision);
            });

            let colliders = [];

            const angleDifferential = Math.abs(Math.cos(performance.now() * this.wiperSpeed / 1000.0));

            // this.wiper.update(0.8);
            this.wiper.update(Math.PI * 2 * (performance.now() % 1000) / 1000); // rotate the wiper

            this.balls.forEach(b => {
                this.balls.forEach(t => {
                    if (b === t) return;

                    let dir = t.pos.subV(b.pos);
                    const dist = dir.len();

                    if (dist < b.r + t.r) {
                        colliders.push([b, t]);
                        dir = dir.normalized();

                        const gap = b.r + t.r - dist;

                        b.pos = b.pos.addV(dir.mulS(-gap / 2.0));
                        t.pos = t.pos.addV(dir.mulS(gap / 2.0));
                    }
                })
            });

            this.balls.forEach(b => {
                const mid = this.wiper.tPosBase.addV(this.wiper.tPosTip).divS(2.0);

                if (this.wiper.len / 2.0 + this.wiper.bottomRad + this.wiper.topRad < b.pos.subV(mid).len() + b.r)
                    return;

                const baseToBall = b.pos.subV(this.wiper.tPosBase);
                const bound = this.wiper.dir.dot(baseToBall);

                if (bound < 0) {
                    let dir = b.pos.subV(this.wiper.tPosBase);
                    const dist = dir.len();

                    if (dist < b.r + this.wiper.bottomRad) {
                        dir = dir.normalized();
                        const gap = this.wiper.bottomRad + b.r - dist;
                        b.pos = b.pos.addV(dir.mulS(gap));
                    }
                }

                if (bound >= this.wiper.len) {
                    let dir = b.pos.subV(this.wiper.tPosTip);
                    const dist = dir.len();

                    if (dist < b.r + this.wiper.topRad) {
                        dir = dir.normalized();
                        const gap = this.wiper.topRad + b.r - dist;
                        b.pos = b.pos.addV(dir.mulS(gap));
                    }
                }

                if (bound > 0 && bound <= this.wiper.len) {
                    const nor = this.wiper.nor.mulS(this.wiper.nor.dot(baseToBall));
                    const dist = nor.len();

                    const boundsPercentage = bound / this.wiper.len;
                    const lerpedR = boundsPercentage * this.wiper.topRad + (1 - boundsPercentage) * this.wiper.bottomRad;

                    if (dist < lerpedR + b.r) {
                        const topOrBott = this.wiper.nor.dot(baseToBall) > 0 ? 1 : -1;
                        const gap = lerpedR + b.r - dist;
                        b.pos = b.pos.addV(this.wiper.nor.mulS(gap * topOrBott));

                        b.v = b.v.addV(this.wiper.nor.mulS(this.wiper.nor.dot(b.v) * -2));
                        b.addForce(nor.normalized().mulS(boundsPercentage * this.wiperForce * angleDifferential));
                    }
                }
            });

            colliders.forEach(pair => {
                const b = pair[0];
                const t = pair[1];

                const dir = t.pos.subV(b.pos).normalized();
                const nor = new Vector2(-dir.y, dir.x);

                const u1 = dir.dot(b.v);
                const u2 = dir.dot(t.v);

                const vn1 = nor.dot(b.v);
                const vn2 = nor.dot(t.v);

                const vd1 = (((b.mass - t.mass) * u1) + (2 * t.mass * u2)) / (b.mass + t.mass);
                const vd2 = (((t.mass - b.mass) * u2) + (2 * b.mass * u1)) / (b.mass + t.mass);

                b.v = dir.mulS(vd1).addV(nor.mulS(vn1));
                t.v = dir.mulS(vd2).addV(nor.mulS(vn2));
            });

            for (let i = 0; i < this.maxBalls - this.balls.length; i++) {
                let b = new Ball(new Vector2(
                    (Math.random() - 0.5) * this.width * this.spread + this.width / 2.0,
                    (Math.random() - 0.5) * this.height * this.spread + this.height / 2.0 - this.height), Math.random() * 10 + 12);

                b.addForce(new Vector2((Math.random() - 0.5), (Math.random() - 0.5)).mulV(new Vector2(100, 200)));
                this.balls.push(b);
            }

            for (let i = 0; i < this.balls.length; i++) {
                const b = this.balls[i];

                if (this.screenBounds) {
                    if (b.pos.x - b.r < 0) {
                        b.pos.x = b.r;
                        b.v.x = b.v.x * -1;
                    }
                    if (b.pos.y - b.r < 0) {
                        b.pos.y = b.r;
                        b.v.y = b.v.y * -1;
                    }
                    if (b.pos.x + b.r >= this.width) {
                        b.pos.x = this.width - b.r;
                        b.v.x = b.v.x * -1;
                    }
                    if (b.pos.y + b.r >= this.height) {
                        b.pos.y = this.height - b.r;
                        b.v.y = b.v.y * -1;
                    }
                }
                else {
                    if (b.pos.x + b.r < 0) {
                        this.balls.splice(i, 1);
                    }
                    if (b.pos.x - b.r >= this.width) {
                        this.balls.splice(i, 1);
                    }
                    if (b.pos.y - b.r >= this.height) {
                        this.balls.splice(i, 1);
                    }
                }
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.balls.forEach(b => {
            b.render(this.ctx);
        });
        this.wiper.render(this.ctx);
    }
}

var game;

window.onload = () => {
    game = new Game(1280, 720);
    game.start();
}