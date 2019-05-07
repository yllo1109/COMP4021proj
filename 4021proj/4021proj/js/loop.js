var FPS = 50;
var backgroundX = 0;
var player = makeplayerPlane();
var score = 0;
var playerBullets = new Array();
var updatesTillNextEnemy = 60;
var canvas = null;
var context2D = null;
var keys = new Array();
var enemyPlanes = new Array();
var paused = true;
var started = false;
var life = 3;
var name="";
//get background image
var bgImg = new Image();
bgImg.src = "img/bg.svg";
//get background image
var bg2Img = new Image();
bg2Img.src = "img/bg2.svg";
//get background image
var bg3Img = new Image();
bg3Img.src = "img/bg3.svg";
//get plane image
var playerImg = new Image();
playerImg.src = "img/planes.png";
//get life image
var lifeImg = new Image();
lifeImg.src = "img/life.svg";
//get frame image
var frameImg = new Image();
frameImg.src = "img/frame.svg";
//get cloud image
var cloudImg = new Image();
cloudImg.src = "img/cloud.svg";
//get sound effect 
var shootSound = new Audio("sounds/8bit_gunloop_explosion.wav");
var gameOverSound = new Audio("sounds/smb_bowserfalls.wav");

window.onload = init;

window.addEventListener('click', click, true);

function click(evt) {
	if(!started) {
		started = true;
		paused = false;
	}
}

function keyDown(evt) {
	keys[evt.keyCode] = true;
	evt.preventDefault();
	if(player.alive) {
		if(evt.keyCode == 32) {
			fireplayerBullet();
			playShootSound();
		}
	}
}

function keyUp(evt) {
	keys[evt.keyCode] = false;
	evt.preventDefault();
	if(player.alive) {
		if(evt.keyCode == 80 || evt.keyCode == 112) {
			togglePaused();
		}
	}
}

function init() {
	//setup
	canvas = document.getElementById('canvas');
	context2D = canvas.getContext('2d');
	checkCookie();
	alert("Your highest score: " + getCookie("H_score"));
	setInterval(draw, 1000 / FPS);
	//check input
	canvas.addEventListener('keydown', keyDown, true);
	canvas.addEventListener('keyup', keyUp, true);
}

function isKeyPressed(code) {
	return (code in keys && keys[code]);
}

function draw() {
	update();
	paint();
}

function update() {
	if(!paused && player.alive) {
		if(score==1000)
			{
				updatesTillNextEnemy -= 15;
			}
		if(score==1500)
			{
				updatesTillNextEnemy -= 10;
			}
		if(score>=3000)
			{
				updatesTillNextEnemy -= 5;
			}	
		updateplayer();
		updateBullets();
		updateEnemyPlanes();
		detectCollisions();
	}
}

function paint() {
	if(started) {
		paintScene();
	} else {
		paintStartScreen();
	}
}

function paintScene() {
	context2D.clearRect(0, 0, canvas.width, canvas.height);
	paintBackground();
	paintplayer();
	paintplayerBullet();
	paintEnemyPlanes();
	paintMessages();
	paintHeart();
}

function paintStartScreen() {
	context2D.clearRect(0, 0, canvas.width, canvas.height);
	paintBackground();
	paintMessages();
}

function updateplayer() {
	if(isKeyPressed(37)) {
		moveplayerLeft();
	}
	if(isKeyPressed(38)) {
		moveplayerUp();
	}
	if(isKeyPressed(39)) {
		moveplayerRight();
	}
	if(isKeyPressed(40)) {
		moveplayerDown();
	}
}
//update player coordinate
function moveplayerLeft() {
	if(player.x > 0) {
		player.x -= 2;
	}
}

function moveplayerUp() {
	if(player.y > 0) {
		player.y -= 2;
	}
}

function moveplayerRight() {
	if(player.x < 1000 - 32) {
		player.x += 2;
	}
}

function moveplayerDown() {
	if(player.y < 500 - 40) {
		player.y += 2;
	}
}
//update coordinate


function updateBullets() {
	for(var i = 0; i < playerBullets.length; i++) {
		playerBullets[i].x += 3;
		if(playerBullets[i].x > 1000) {
			playerBullets[i].alive = false;
		}
	}
}

function updateEnemyPlanes() {
	if(updatesTillNextEnemy-- <= 0) {
		dispatchEnemyPlane();
		updatesTillNextEnemy = 50 + randomInt(20);
	}
	for(var i = 0; i < enemyPlanes.length; i++) {
		enemyPlanes[i].x -= 2;
		if(enemyPlanes[i].x < -32) {
			enemyPlanes[i].alive = false;		
		}
	}
}


//paint img
function paintBackground() {
	if(score < 1000){
		context2D.drawImage(bgImg, backgroundX, 0);
		context2D.drawImage(bgImg, backgroundX + 1000, 0);
	}
	else if(score>=1000 && score < 2000){
		context2D.drawImage(bg2Img, backgroundX, 0);
		context2D.drawImage(bg2Img, backgroundX + 1000, 0);
	}
	else if(score>=2000){
		context2D.drawImage(bg3Img, backgroundX, 0);
		context2D.drawImage(bg3Img, backgroundX + 1000, 0);
	}
}

function paintplayer() {
	if(player.alive) {
		context2D.drawImage(playerImg, 0, 0, 32, 40, player.x, player.y, player.w, player.h);
	}
}

function paintplayerBullet() {
	for(var i = 0; i < playerBullets.length; i++) {
		bullet = playerBullets[i];
		if(bullet.alive) {
			context2D.drawImage(playerImg, 96, 0, 8, 8, bullet.x, bullet.y, bullet.w, bullet.h);
		}
	}
}

function paintEnemyPlanes() {
	for(var i = 0; i < enemyPlanes.length; i++) {
		plane = enemyPlanes[i];
		if(plane.alive) {
			var srcX = 32 * (plane.imgIndex + 1);
			context2D.drawImage(playerImg, srcX, 0, 32, 40, plane.x, plane.y, plane.w, plane.h);
		}
	}
}

function paintMessages() {
	paintStart();
	paintScore();
	paintGameOver();
}

function paintStart() {
	if(!started) {
		context2D.fillStyle = "black";
		context2D.font = 'bold 26px sans-serif';
		context2D.drawImage(frameImg, 0, 0, 1000, 500, 0, 0, 1000, 500);
		context2D.fillText(name +", your mission is to destroy the enemy to protect our airspace!", 20, 400);
		context2D.font = 'bold 18px sans-serif';
		context2D.fillText("< - Click to start - >", 820, 480);
	}
}

function paintScore() {
	context2D.fillStyle = "white";
	context2D.font = 'bold 24px sans-serif';
	context2D.fillText("Score:"+score, 0, 20);
}

function paintGameOver() {
	if(!player.alive) {
		var gradient = context2D.createLinearGradient(0, 0, 1000, 0);
		gradient.addColorStop("0", "Red");
		gradient.addColorStop("0.1", "DarkRed");
		context2D.fillStyle = gradient;
		context2D.font = 'bold 40px sans-serif';
		context2D.fillText("Game Over", 400, 250);
	}
}

function playShootSound() {
	shootSound.currentTime = 0;
	shootSound.play();
}

function playgameOverSound() {
	gameOverSound.currentTime = 0;
	gameOverSound.play();
}

function fireplayerBullet() {
	var bullet = makeplayerBullet();
	playerBullets.push(bullet);
}

function makeplayerBullet() {
	var bullet = new Object();
	bullet.x = player.x + 50;
	bullet.y = player.y + 12;
	bullet.w = 8;
	bullet.h = 8;
	bullet.alive = true;
	return bullet;
}

function np() {
	document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	document.cookie = "H_score=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	window.location.reload();
}

function dispatchEnemyPlane() {
	var enemyPlane = makeEnemyPlane();
	enemyPlanes.push(enemyPlane);
}

function makeplayerPlane() {
	var plane = new Object();
	plane.x = 0;
	plane.y = (500 - 40) / 2;
	plane.w = 32;
	plane.h = 40;
	plane.alive = true;
	return plane;
}

function paintHeart(){
	if(life==3){
	context2D.drawImage(lifeImg, 0, 0, 80, 40, 935, 0, 80, 40);
	}
	if(life==2){
	context2D.drawImage(lifeImg, 0, 0, 80, 40, 957, 0, 80, 40);
	}
	if(life==1){
	context2D.drawImage(lifeImg, 0, 0, 60, 40, 976, 0, 60, 40);
	}
}

function makeEnemyPlane() {
	var maxPossibleY = 500 - 40;
	var plane = new Object();
	plane.x = 1000;
	plane.y = randomInt(maxPossibleY);
	plane.w = 32;
	plane.h = 40;
	plane.imgIndex = randomInt(2);
	plane.alive = true;
	return plane;
}

function detectCollisions() {
	detectplayerBulletEnemyPlaneCollisions();
	detectplayerEnemyPlaneCollisions();
}

function detectplayerBulletEnemyPlaneCollisions() {
	for(var i = 0; i < playerBullets.length; i++) {
		var bullet = playerBullets[i];
		if(!bullet.alive) {
			continue;
		}
		for(var j = 0; j < enemyPlanes.length; j++) {
			var plane = enemyPlanes[j];
			if(!plane.alive) {
				continue;
			}
			if(rectangles_collide(bullet, plane)) {
				bullet.alive = false;
				plane.alive = false;
				score += 100;
			}
		}
	}
}

function detectplayerEnemyPlaneCollisions() {
	for(var i = 0; i < enemyPlanes.length; i++) {
		var plane = enemyPlanes[i];	

		if(!plane.alive) {
			continue;		
		}
		else{
			if(plane.x==0)
			{
				if(life)
				{
					life-=1;
				}	
			}
		}

		if(rectangles_collide(player, plane)) {
			player.alive = false;
			plane.alive = false;
			var s=getCookie("H_score");
		    if(score>s)
		    {
		    	setCookie("H_score", score, 30);
		    }
			playgameOverSound();
			leaderBroad();
		}

		if(!life)
		{
			player.alive = false;
			plane.alive = false;
			playgameOverSound();
			var s=getCookie("H_score");
		    if(score>s)
		    {
		    	setCookie("H_score", score, 30);
		    }
			leaderBroad();
		}
	}
}

function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  var user=getCookie("username");
  var s=getCookie("H_score");
  if (user != "") {
    name = user;
  } else {
     user = prompt("Please enter your name:","Soilder");
     if (user != "" && user != null) {
       name=user;
       setCookie("username", user, 30);
     }
  }
  if(s == "")
  	{setCookie("H_score", 0, 30);}
}

function checkCookie_s() {
  var s=getCookie("H_score");
  	if(score!=""){
	    if(score>s)
	    {
	    	setCookie("H_score", score, 30);
	    }
	}
}

// function leaderBroad(){
// 	console.log("hi");
// 	var html = "<div class='row'>";
//         $.get("leaderbroad.php",function(data) {
//         	console.log(data);
//             $(data.childNodes).find("player").each(function(i,player){
// 						html += "<h3>"
//                         html += $(player).find("name").text();
//                         html += "</h3>"
//                         html += "<h3>"
//                         html += $(player).find("score").text();
//                         html += "</h3>"
//                     });
//                 });
//             console.log(html);
//             $("#leaderBroad").html(html);
// }

function rectangles_collide(rect1, rect2) {
	return rectangles_collide_distance(rect1, rect2, 0);
}

function rectangles_touch(rect1, rect2) {
	return rectangles_collide_distance(rect1, rect2, 1);
}

function rectangles_collide_distance(rect1, rect2, minDistance) {
	// First rectangle
	bottom1 = rect1.y + rect1.h;
	top1 = rect1.y;
	right1 = rect1.x + rect1.w;
	left1 = rect1.x;
	// Second rectangle
	bottom2 = rect2.y + rect2.h;
	top2 = rect2.y;
	right2 = rect2.x + rect2.w;
	left2 = rect2.x;
	// If any of the sides from this are outside of other
	if(bottom1 + minDistance < top2) {
		return false;
	}
	if(top1 - minDistance > bottom2) {
		return false;
	}
	if(right1 + minDistance < left2) {
		return false;
	}
	if(left1 - minDistance > right2) {
		return false;
	}
	// If none of the sides from this are outside other
	return true;
}

function randomInt(maxInt) {
	return Math.floor(Math.random() * maxInt);
}

