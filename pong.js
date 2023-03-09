let canvas = document.createElement('canvas');
let music = document.createElement('audio');
let ping1 = document.createElement('audio');
let ping2 = document.createElement('audio');
let doot = document.createElement('audio');
let lose = document.createElement('audio');
let win = document.createElement('audio');
music.setAttribute('src', 'sounds/sleepy_sunflower.mp3');
music.volume = 0.5;
ping1.setAttribute('src', 'sounds/ping1.wav');
ping2.setAttribute('src', 'sounds/ping2.wav');
doot.setAttribute('src', 'sounds/doot.wav');
win.setAttribute('src', 'sounds/win.wav');
lose.setAttribute('src', 'sounds/lose.wav');

canvas.width = window.innerWidth < 900 ? window.innerWidth - 15 : 800;
canvas.height = window.innerHeight < 500 ? window.innerHeight -15 : 500;
let fs = false;
var elem = document.documentElement;

canvas.setAttribute('style', 'display:block; position:fixed; top:0; bottom:0; left:50%; margin: auto; transform:translateX(-50%); border:none; box-shadow:5px 5px 5px rgba(0,0,0,0.5)')
let ctx = canvas.getContext('2d');
document.body.append(canvas);
const pi = Math.PI;
let mouseX;
let mouseY;
let mouseClicked = false;
let mouseDown = false;
let gameState = 'menu';
let optionsbg = document.createElement('img');
optionsbg.setAttribute('src', 'pong.jpg');
var animationRequest;
let defaultFont = {size:'30px', name:'Helvetica, Arial, Sans-Serif', color:'#9bf'};
let ping = 0;

//menu variables/////////////
let instructions = 'Move the paddle by moving your mouse or finger across the screen. ';
instructions += 'The ball will move faster after each bounce off of a paddle.';
instructions += ' You can pause the game by clicking the pause button or pressing the spacebar.';
let credits = 'This is the classic Pong video game recreated by David Kazaryan using JavaScript and the HTML canvas element.';
let menufont = '15px Century Gothic, Helvetica, Arial, Sans-Serif';
let margin = 100;
let textY = 80;
if(canvas.width < 700){
    textY = 40;
    margin = 60;
}
_instructions = canvasTextWrap(instructions, margin, menufont);
_credits = canvasTextWrap(credits, margin, '12px Century Gothic, Helvetica, Arial, Sans-Serif');

//functions ///////////////////

function openFullscreen() {
    canvas.width = window.innerWidth < 900 ? window.innerWidth - 15 : 800;
    canvas.height = window.innerHeight < 500 ? window.innerHeight -15 : 500;
    fs = true;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
}

function closeFullscreen() {
    canvas.width = window.innerWidth < 900 ? window.innerWidth - 15 : 800;
    canvas.height = window.innerHeight < 500 ? window.innerHeight -15 : 500;
    fs = false;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
}
let musicDisabled = false;
function toggleMusic(){
    if(musicDisabled === false){
        musicDisabled = true;
        music.pause();
        music.currentTime = 0;
        musicButton.text = 'Music:Off'
    }else{
        musicDisabled = false;
        music.play();
        musicButton.text = 'Music:On'
    }
}
let soundDisabled = false;
function toggleSound(){
    if(soundDisabled === false){
        soundDisabled = true;
        soundButton.text = 'Sound:off';
    }else{
        soundDisabled = false;
        soundButton.text = 'Sound:On';
    }
}

function canvasTextWrap(text, margin = 40, font) {
    const w = canvas.width - margin*2;
    let _text = '';
    let lines = [];
    let i = 0;
    ctx.font = font;
    while(_text.length < text.length) {
        if(text[i] == undefined){
            break;
        }
        _text += text[i];
        if(ctx.measureText(_text).width > w) {
            lines.push(_text.slice(0, _text.lastIndexOf(' ')));
            _text = _text.slice(_text.lastIndexOf(' '), i+1);
            if(ctx.measureText(text.slice(i, text.length)).width < w) {
                lines.push(text.slice(i - _text.length + 1, text.length));
                break;
            }
        }else if(ctx.measureText(text).width < w){
            lines.push(text);
            break;
        }
        i++;
    }
    return lines;
}

let defaultfunc = () => {
    alert('default button alert');
}
const collisionDetect = (player, ball) => {
    if(player.pos.x + player.size.x > ball.pos.x - ball.size.x/2 && player.pos.x < ball.pos.x + ball.size.x/2 &&
       player.pos.y < ball.pos.y + ball.size.y/2 && player.pos.y + player.size.y > ball.pos.y - ball.size.y/2){
        return true;
    }else{
        return false;
    }
}

//classes /////////////////////
class Vec {
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
}
class Button {
    constructor(x,y,w=20,h=10,text = 'text', font = defaultFont, color=[100,100,100,1]) {
        this.pos = new Vec(x,y);
        this.size = new Vec(w,h);
        this.text = text;
        this.font = font;
        this.color = color;
        this.outColor = [100,100,100,1];
    }
    get textWidth() {
        return ctx.measureText(this.text);
    }
    draw() {
        ctx.fillStyle = `rgba(${this.outColor[0]},${this.outColor[1]},${this.outColor[2]},${this.outColor[3]})`;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        ctx.fillStyle = this.font.color;
        ctx.font = this.font.size + ' ' + this.font.name;
        ctx.fillText(this.text, this.pos.x + (this.size.x / 2 - this.textWidth.width / 2), this.pos.y + this.size.y / 1.5);
    }
    update = () => {
        this.draw();
        // if(gameState == 'menu'){
            if(mouseX > this.pos.x && mouseX < this.pos.x + this.size.x && mouseY > this.pos.y && mouseY < this.pos.y + this.size.y){
                if(mouseDown == true){
                    for(let i = 0; i <= this.color.length; i++){
                        if(this.color[i] > 170) {
                            this.outColor[i] = this.color[i] - 40;
                        }else{
                            this.outColor[i] = this.color[i] + 40;
                        }
                    }
                }
                else{
                    for(let i = 0; i <= 2; i++){
                        if(this.color[i] > 170) {
                            this.outColor[i] = this.color[i] + 20;
                        }else{
                            this.outColor[i] = this.color[i] - 20;
                        }
                    }
                }
            }else{
                this.outColor[0] = this.color[0];
                this.outColor[1] = this.color[1];
                this.outColor[2] = this.color[2];
                this.outColor[3] = this.color[3];
            }
        // }
    }
}
class Ball {
    constructor() {
        this.vel = new Vec(-1,1);
        this.vel.x = (Math.random() > 0.5) ? Math.cos((pi / 4) * Math.random()) : Math.cos((pi / 4) * Math.random()) * -1;
        this.vel.y = (Math.random() > 0.5) ? Math.sin((pi / 4) * Math.random()) : Math.sin((pi / 4) * Math.random()) * -1 ;
        this.speed = 300;
        this.hypotenuse = this.speed;
        this.radius = 10;
        this.size = new Vec(this.radius*2, this.radius*2);
        this.pos = new Vec(canvas.width/2 - this.radius,canvas.height/2 - this.radius);
    }
    get hypotenuse(){
        return Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
    }
    set hypotenuse(speed){
        this.speed = speed;
        let fact = speed / this.hypotenuse;
        this.vel.x *= fact;
        this.vel.y *= fact;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*pi);
        ctx.fillStyle = 'rgba(150, 180, 250, 1)';
        ctx.fill();
        ctx.closePath();
    }
    update(dt) {
        if(this.pos.x + this.radius > canvas.width || this.pos.x - this.radius < 0){
            if(this.pos.x > canvas.width/2){
                player1.score++;
                if(soundDisabled == false) win.play();
            }else{
                player2.score++;
                if(soundDisabled == false) lose.play();
            }
            this.reset();
            gameState = 'point';
        }
        if(this.pos.y + this.radius > canvas.height || this.pos.y - this.radius < 0){
            if(this.pos.y + this.radius > canvas.height){
                this.offset = this.pos.y + this.radius - canvas.height;
                this.pos.y -= this.offset;
            }
            if(this.pos.y - this.radius < 0){
                this.offset = this.pos.y - this.radius;
                this.pos.y -= this.offset;
            }
            this.vel.y *= -1;
            doot.currentTime = 0;
            if(soundDisabled == false) doot.play();
        }
        let player;
        if(this.vel.x < 0){
            player = player1;
        }else{
            player = player2;
        }
        if(collisionDetect(player, this)){
            let collisionPoint = (this.pos.y - (player.pos.y + player.size.y/2)) / (player.size.y/2);
            let angle = (pi / 4) * collisionPoint;
            this.vel.x = Math.cos(angle);
            this.vel.y = Math.sin(angle);
            this.hypotenuse = this.speed;
            if(this.pos.x < player.pos.x) this.vel.x = -this.vel.x;
            if(this.speed <= 3000) this.speed *= 1.05;
            if(ping % 2 == 0){
                ping1.currentTime = 0;
                if(soundDisabled == false) ping1.play();
            }else{
                ping2.currentTime = 0;
                if(soundDisabled == false) ping2.play();
            }
            ping++;
        }
        if(gameState === 'game'){
            this.pos.x += this.vel.x * dt;
            this.pos.y += this.vel.y * dt;
        }
    }
    reset(){
        this.speed = 300;
        this.pos.x = canvas.width/2 - this.radius
        this.pos.y = canvas.height/2 - this.radius;
        this.vel.x = (Math.random() > 0.5) ? Math.cos((pi / 4) * Math.random()) : Math.cos((pi / 4) * Math.random()) * -1 ;
        this.vel.y = (Math.random() > 0.5) ? Math.sin((pi / 4 ) * Math.random()) : Math.sin((pi / 4) * Math.random() * -1 );
        this.hypotenuse = this.speed;
    }
}
class BallTail extends Ball{
    constructor(ball){
        super();
        this.pos.x = ball.pos.x;
        this.pos.y = ball.pos.y;
    }
    draw(color) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2*pi);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
}
class Player1 {
    constructor(x){
        this.size = new Vec(25, 100);
        this.pos = new Vec(x, canvas.height/2 - this.size.y);
        this.score = 0;
    }
    draw() {
        ctx.save();
        ctx.fillStyle = 'rgba(10, 180, 50)';
        ctx.fillRect(this.pos.x, this.pos.y,this.size.x, this.size.y)
        ctx.restore();
    }
    update(){
        this.pos.y = mouseY - this.size.y/2;
    }
    // update(){
    //     if(ballTail[19]){
    //         this.pos.y = ballTail[19].pos.y - this.size.y/2;
    //     }
    // }
}
class Player2 extends Player1{
    constructor(x){
        super(x);
    }
    draw() {
        ctx.save();
        ctx.fillStyle = 'rgba(180, 10, 50)';
        ctx.fillRect(this.pos.x, this.pos.y,this.size.x, this.size.y)
        ctx.restore();
    }
    update(){
        if(ballTail[16]){
            this.pos.y = ballTail[16].pos.y - this.size.y/2;
        }
    }
}

class ScoreBoard{
    constructor(){
        this.CHAR_PIXEL = 10;
        this.CHARS = [
        '111101101101111',
        '010010010010010',
        '111001111100111',
        '111001111001111',
        '101101111001001',
        '111100111001111',
        '111100111101111',
        '111001001001001',
        '111101111101111',
        '111101111001111']
        .map((numStr) => {
            const can = document.createElement('canvas');
            can.width = this.CHAR_PIXEL*3;
            can.height = this.CHAR_PIXEL*5;
            const c = can.getContext('2d');
            c.fillStyle = '#fff';
            numStr.split('').forEach((char, i) => {
                if(char === '1'){
                    c.fillRect((i % 3) * this.CHAR_PIXEL, (i / 3 | 0)* this.CHAR_PIXEL, this.CHAR_PIXEL, this.CHAR_PIXEL)
                }
            })
            return can;
        })
    }
    drawScore(){
        let players = [player1, player2];
        const align = canvas.width / 3; //middle of canvas |(|)| |
        const CHAR_W = this.CHAR_PIXEL * 4; //1 block of space extra
        players.forEach((player, index) => {
            const chars = player.score.toString().split(''); //separate score digits into array. ex: 12 -> ['1','2']
            const offset = align * (index + 1) - // ex 500 width canvas: 500 * 1
            (CHAR_W * chars.length / 2) + // 40 * 2 / 2 = 40
            this.CHAR_PIXEL / 2; // 10/2 = 5 ,total: 500 - 40 + 5 = 545
            chars.forEach((char, pos) => {
                ctx.drawImage(this.CHARS[char|0], //draw the canvas object returned from CHARS at 545 + index*10 | if nan, then 0;
                    offset + pos * CHAR_W, 20);
            });
        })
        
    }
}

let ball = new Ball;
let ballTail = [];
let player1 = new Player1(20);
let player2 = new Player2(canvas.width - 40);
let scoreBoard = new ScoreBoard();

//button params: x,y,w,h, text, font{size:size, name:name}, color
let startButton = new Button(canvas.width / 2 - 60, canvas.height / 2 - 50, 120, 50,'Start', {size:'30px', name:'Century Gothic, Helvetica, Arial, Sans-Serif', color:'#222'}, [80,140,255, 1]);
let optionsButton = new Button(startButton.pos.x, startButton.pos.y + startButton.size.y*2, 120, 50,'Options', {size:'25px', name:'Century Gothic, Helvetica, Arial, Sans-Serif', color:'#222'}, [80, 140, 255, 1]);
let pauseButton = new Button(canvas.width / 2 - 70, 10, 140, 20, 'pause(spacebar)', {size:'15px', name:'Century Gothic, Helvetica, Arial, Sans-Serif', color:'rgba(0,0,0,0.7)'}, [80, 140, 255, 1]);
let backButton = new Button(optionsButton.pos.x, optionsButton.pos.y, 120, 50, 'Back', {size:'30px', name:'Century Gothic, Helvetica, Arial, Sans-Serif', color:'rgba(0,0,0,0.7)'}, [80, 140, 255, 1]);
let resetButton = new Button(optionsButton.pos.x, optionsButton.pos.y + optionsButton.size.y, 120, 50, 'Reset', {size:'30px', name:'Century Gothic, Helvetica, Arial, Sans-Serif', color:'rgba(0,0,0,0.7)'}, [80, 140, 255, 1]);
let fullscreenButton = new Button(canvas.width / 2 - 90, canvas.height - 40, 180, 24, '[toggle fullscreen]', {size:'22px', name:'Century Gothic Bold, Helvetica, Arial, Sans-Serif', color:'rgba(100,200,255,1)'}, [0, 0, 0, 0.6]);
let musicButton = new Button(canvas.width / 2 + 50, canvas.height/2, 100, 30, 'music:on', {size:'22px', name:'Century Gothic Bold, Helvetica, Arial, Sans-Serif', color:'rgba(255,255,255,0.7)'}, [80, 140, 255, 1]);
let soundButton = new Button(canvas.width / 2 - 150, canvas.height/2, 100, 30, 'sound:on', {size:'22px', name:'Century Gothic Bold, Helvetica, Arial, Sans-Serif', color:'rgba(255,255,255,0.7)'}, [80, 140, 255, 1]);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth < 900 ? window.innerWidth - 15 : 800;
    canvas.height = window.innerHeight < 500 ? window.innerHeight -15 : 500;

    startButton.pos.x = canvas.width / 2 - 60;
    startButton.pos.y = canvas.height / 2 - 50, 120;

    optionsButton.pos.x = canvas.width / 2 - 60;
    optionsButton.pos.y = startButton.pos.y + startButton.size.y*2;

    backButton.pos.x = optionsButton.pos.x;
    backButton.pos.y = optionsButton.pos.y;

    resetButton.pos.x = optionsButton.pos.x;
    resetButton.pos.y = optionsButton.pos.y + optionsButton.size.y;

    fullscreenButton.pos.x = canvas.width / 2 - 90;
    fullscreenButton.pos.y = canvas.height - 40;

    musicButton.pos.x = canvas.width / 2 + 50;
    musicButton.pos.y = canvas.height / 2;

    soundButton.pos.x = canvas.width / 2 - 150;
    soundButton.pos.y = canvas.height / 2;

    pauseButton.pos.x = canvas.width / 2 - 70;

    player2.pos.x = canvas.width - 40;

    if(canvas.width < 700){
        textY = 40;
        margin = 60;
    }
    _instructions = canvasTextWrap(instructions, margin, menufont);
    _credits = canvasTextWrap(credits, margin, '12px Century Gothic, Helvetica, Arial, Sans-Serif');
})

//gameStates and loops /////////////

function startMenuLoop() {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(optionsbg, 0, 0);
    startButton.update();
    optionsButton.update();
    fullscreenButton.update();
    animationRequest = requestAnimationFrame(startMenuLoop);
    ctx.restore();
}
function menuLoop() {
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(optionsbg, 0, 0);
    ballTail.forEach(function(tail, i){
        tail.draw(`rgba(120, 150, 230, ${i*0.1})`);
    });
    ball.draw();
    startButton.update();
    optionsButton.update();
    resetButton.update();
    fullscreenButton.update();
    ctx.restore();
    animationRequest = requestAnimationFrame(menuLoop);
}

function optionsLoop() {
    ctx.save();
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.drawImage(optionsbg, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.font = menufont;
    _instructions.forEach((line, i) => {
        ctx.fillText(line.trim(), margin, textY + 20*(i+1));
    })
    ctx.font = '12px Century Gothic, Arial, Sans-Serif ';
    _credits.forEach((line, i) => {
        ctx.fillText(line.trim(), margin, canvas.height - 60 + 20*(i+1));
    })
    backButton.update();
    musicButton.update();
    soundButton.update();
    ctx.restore();
    animationRequest = requestAnimationFrame(optionsLoop);
}
let lastTime;
let accumulator = 0;
let step = 1/300;
function gameLoop(millis) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pauseButton.update();
    ballTail.push(new BallTail(ball));
    ballTail.forEach(function(tail, i){
        tail.radius = tail.radius + (i*0.01);
        tail.draw(`rgba(120, 150, 230, ${i*0.01})`);
    });
    if(ballTail.length > 20){
        ballTail.shift();
    }
    if(lastTime) {
        accumulator += (millis - lastTime) / 1000;
        while(accumulator > step){
            ball.update(step);
            accumulator-=step;
        }
    }
    lastTime = millis;
    ball.draw();
    player1.draw();
    player1.update();
    player2.draw();
    player2.update();
    scoreBoard.drawScore();
    animationRequest = requestAnimationFrame(gameLoop);
    ctx.restore();
}
function menu() {
    accumulator = 0;
    lastTime = 0;
    cancelAnimationFrame(animationRequest);
    gameState = 'menu';
    menuLoop();
}

function startMenu() {
    cancelAnimationFrame(animationRequest);
    gameState = 'startMenu';
    startMenuLoop();
}
function options() {
    cancelAnimationFrame(animationRequest);
    gameState = 'options';
    optionsLoop();
}
function game() {
    cancelAnimationFrame(animationRequest);
    for(i = 0; i <= 10000; i++){
        cancelAnimationFrame(i);
    }
    gameState = 'game';
    animationRequest = requestAnimationFrame(gameLoop);
}
function pause() {
    accumulator = 0;
    lastTime = 0;
    if(gameState === 'game'){
        gameState = 'pause';
        menu();
    }else if(gameState === 'pause') {
        game();
        gameState = 'game';
    }
}
function reset() {
    cancelAnimationFrame(animationRequest);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ball.reset();
    startMenu();
}
//mouse events ///////////////////////
canvas.addEventListener('mousemove', function(e){
    mouseX = e.offsetX;
    mouseY = e.offsetY;
})
canvas.addEventListener('click', function() {
    if(musicDisabled == false) music.play();
    if(gameState === 'menu' || gameState === 'startMenu' || gameState === 'pause'){
        if(mouseX > startButton.pos.x && mouseX < startButton.pos.x + startButton.size.x && mouseY > startButton.pos.y && mouseY < startButton.pos.y + startButton.size.y){
            game();
        }
        if(mouseX > optionsButton.pos.x && mouseX < optionsButton.pos.x + optionsButton.size.x && mouseY > optionsButton.pos.y && mouseY < optionsButton.pos.y + optionsButton.size.y){
            options();
        }
        if(mouseX > resetButton.pos.x && mouseX < resetButton.pos.x + resetButton.size.x && mouseY > resetButton.pos.y && mouseY < resetButton.pos.y + resetButton.size.y){
            reset();
            player1.score = 0;
            player2.score = 0;
        }
        if(mouseX > fullscreenButton.pos.x && mouseX < fullscreenButton.pos.x + fullscreenButton.size.x && mouseY > fullscreenButton.pos.y && mouseY < fullscreenButton.pos.y + fullscreenButton.size.y){
            if(fs == false) openFullscreen();
            else closeFullscreen();
        }
    }else if(gameState === 'options'){
        if(mouseX > backButton.pos.x && mouseX < backButton.pos.x + backButton.size.x && mouseY > backButton.pos.y && mouseY < backButton.pos.y + backButton.size.y){
            if(mouseDown === false){
                menu();
            }
        }
        if(mouseX > musicButton.pos.x && mouseX < musicButton.pos.x + musicButton.size.x && mouseY > musicButton.pos.y && mouseY < musicButton.pos.y + musicButton.size.y){
            toggleMusic();
        }
        if(mouseX > soundButton.pos.x && mouseX < soundButton.pos.x + soundButton.size.x && mouseY > soundButton.pos.y && mouseY < soundButton.pos.y + soundButton.size.y){
            toggleSound();
        }
    }else if(gameState !== 'menu' && gameState !== 'options' && gameState !== 'point' && gameState !== 'pause' && gameState !== 'startMenu'){
        if(mouseX > pauseButton.pos.x && mouseX < pauseButton.pos.x + pauseButton.size.x && mouseY > pauseButton.pos.y && mouseY < pauseButton.pos.y + pauseButton.size.y){
            menu();
            gameState = 'menu';
            startButton.pos.x = canvas.width / 2 - 70
            startButton.size.x = 140;
            startButton.text = "continue";

        }
    }else if(gameState === 'point'){
        gameState = 'game';
        ball.reset();
    }
});
// keyboard events
document.addEventListener('keydown', function(e){
    if(e.keyCode === 32){
        if(gameState === 'pause' || gameState === 'menu' || gameState === 'startMenu'){
            game();
        }else{
            pause();
            startButton.size.x = 140;
            startButton.pos.x = canvas.width / 2 - 70;
            startButton.text = "continue";
        }
    }
    if(e.keyCode === 13){
        game();
    }
})
//touch events
function touchHandler(e) {
    if(e.touches) {
        mouseY = e.touches[0].pageY;
    }
}

document.addEventListener("touchstart", touchHandler);
document.addEventListener("touchmove", touchHandler);

startMenu();