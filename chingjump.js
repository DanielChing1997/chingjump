//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context; 

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img : null,
    x : doodlerX,
    y : doodlerY,
    width : doodlerWidth,
    height : doodlerHeight
}

//This are the game physics
let velocityX = 0;
let velocityY = 0; //doodler jump speed
let initialVelocityY = -8; //starting velocity Y
let gravity = 0.4;

let score = 0; 
let maxScore = 0;
let gameOver = false;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;



window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //This line is used to draw on the board

    //draw doodler
    //context.fillStyle = "green";
    //In order to draw a rectangle, you need x,y,width, and height
    //context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./doodler-right.png";
    doodler.img = doodlerRightImg;
    //This will draw the rectangle when the game starts up
    doodlerRightImg.onload = function(){
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./doodler-left.png";

    platformImg = new Image();
    platformImg.src = "./platform.png";

    velocityY = initialVelocityY;
    //this will place our initial platforms onto the canvas
    placePlatforms();

    requestAnimationFrame(update);
    //everytime you press a key it will call the function moveDoodler
    document.addEventListener("keydown", moveDoodler);
}
//This function is the game loop
function update(){
    requestAnimationFrame(update);
    if (gameOver){
        return;
    }
    //this will clear the previous frame each time you move, fixing the frames overlapping
    context.clearRect(0, 0 ,board.width, board.height);
    //it draws the doodle jump over and over again
    doodler.x += velocityX;
    //as soon as the X position passes the right side of the canvas, it will set doodle.x to 0
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    //we want to make sure the right side of the doodle falls off the left side of the canvas
    else if (doodler.x + doodler.width < 0){
        doodler.x = boardWidth;
    }
    //this line adds gravity, making it so you just don't fly away
    velocityY += gravity;
    //this line makes the doodle go up
    doodler.y += velocityY;
    if (doodler.y > board.height){
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        //velocity 0 means the player is falling down
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= initialVelocityY; //slides the platform down
        }
        //this makes it so if you hit a platform, you simply jump off the platform 
        //Going through all the platforms to see if they detect a platform, if they touch a platform, it increases the velocity and jumps up again
        if (detectCollision(doodler, platform) && velocityY >= 0){
            velocityY = initialVelocityY; //jump off platform
        
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    //clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes the first element from the array
        newPlatform();//replaces the platform with a new platform
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over : Press 'Space' to Restart", boardWidth/7, boardHeight*7/8)
    }
}

function moveDoodler(e){
    //If you press the right arrow or the D key, you will move to the right
    if (e.code == "ArrowRight" || e.code == "KeyD"){
        //by setting velocity to 4 we are moving 4 pixels to the right
        velocityX = 4;
        doodler.img = doodlerRightImg;
    }
    //if you press the left arrow or the A key, you will move to the left
    else if (e.code == "Arrowleft" || e.code == "KeyA"){
        //by setting velocity to -4 we are moving 4 pixels to the left
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver){
        //reset
         doodler = {
            img : doodlerRightImg,
            x : doodlerX,
            y : doodlerY,
            width : doodlerWidth,
            height : doodlerHeight
        }

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms(){
    platformArray = [];

    //starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight,
    }

    platformArray.push(platform);

    //  platform = {
    //     img : platformImg,
    //     x : boardWidth/2,
    //     y : boardHeight - 150,
    //     width : platformWidth,
    //     height : platformHeight,
    // }

    // platformArray.push(platform);

    //this loop gives us randomized platforms
     for (let i = 0; i < 6; i++) {
        //math.random gives us a random number between 0 and 1 and then multiplies it by 3/4 of the board width
        //math.floor rounds it down to the nearest whole number
        //gives us a random spot for each platform 
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            //the i is from 0-6 and it creates an additional 75 pixels of space for each platform
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight,
        }
        platformArray.push(platform);
     }
}

//this function generates a new platform right above the canvas so when it slides down there are new platforms ready to jump on
function newPlatform () {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight
    }

    platformArray.push(platform);
}

//this function will detect the collision on the platforms
//detects the intersection between 2 rectangles a and b
function detectCollision(a, b) {
    return a.x < b.x + b.width && //A's top left corner does not reach b's top right corner
           a.x + a.width > b.x && //A's top right corner passes B's top left corner
           a.y < b.y + b.height && //A's top left corner doesnt reach b's bottom left corner
           a.y + a.height > b.y; //A's bottom left corner passes B's top left corner

}

function updateScore() {
    let points = Math.floor(50*Math.random()); //(0-1) * 50 will give you a random number between 0 and 50
    //This makes it so your points only go up for going up the platforms
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    //You do not get points for going down, only going up
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}