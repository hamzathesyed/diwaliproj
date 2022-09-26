$(function(){

var Fireworks = function(){
var self = this;
var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};
window.requestAnimFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(a){window.setTimeout(a,1E3/60)}}();

self.init = function(){	
self.canvas = document.createElement('canvas');				
self.canvas.width = self.cw = $(window).innerWidth();
self.canvas.height = self.ch = $(window).innerHeight();			
self.particles = [];	
self.partCount = 150;
self.fireworks = [];	
self.mx = self.cw/2;
self.my = self.ch/2;
self.currentHue = 30;
self.partSpeed = 5;
self.partSpeedVariance = 10;
self.partWind = 50;
self.partFriction = 5;
self.partGravity = 1;
self.hueMin = 0;
self.hueMax = 360;
self.fworkSpeed = 4;
self.fworkAccel = 10;
self.hueVariance = 30;
self.flickerDensity = 25;
self.showShockwave = true;
self.showTarget = false;
self.clearAlpha = 25;

$(document.body).append(self.canvas);
self.ctx = self.canvas.getContext('2d');
self.ctx.lineCap = 'round';
self.ctx.lineJoin = 'round';
self.lineWidth = 1;
self.bindEvents();			
self.canvasLoop();

self.canvas.onselectstart = function() {
return false;
};
};		

self.createParticles = function(x,y, hue){
var countdown = self.partCount;
while(countdown--){
var newParticle = {
	x: x,
	y: y,
	coordLast: [
		{x: x, y: y},
		{x: x, y: y},
		{x: x, y: y}
	],
	angle: rand(0, 360),
	speed: rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance)),
	friction: 1 - self.partFriction/100,
	gravity: self.partGravity/2,
	hue: rand(hue-self.hueVariance, hue+self.hueVariance),
	brightness: rand(50, 80),
	alpha: rand(40,100)/100,
	decay: rand(10, 50)/1000,
	wind: (rand(0, self.partWind) - (self.partWind/2))/25,
	lineWidth: self.lineWidth
};				
self.particles.push(newParticle);
}
};


self.updateParticles = function(){
var i = self.particles.length;
while(i--){
var p = self.particles[i];
var radians = p.angle * Math.PI / 180;
var vx = Math.cos(radians) * p.speed;
var vy = Math.sin(radians) * p.speed;
p.speed *= p.friction;
				
p.coordLast[2].x = p.coordLast[1].x;
p.coordLast[2].y = p.coordLast[1].y;
p.coordLast[1].x = p.coordLast[0].x;
p.coordLast[1].y = p.coordLast[0].y;
p.coordLast[0].x = p.x;
p.coordLast[0].y = p.y;

p.x += vx;
p.y += vy;
p.y += p.gravity;

p.angle += p.wind;				
p.alpha -= p.decay;

if(!hitTest(0,0,self.cw,self.ch,p.x-p.radius, p.y-p.radius, p.radius*2, p.radius*2) || p.alpha < .05){					
	self.particles.splice(i, 1);	
}
};
};

self.drawParticles = function(){
var i = self.particles.length;
while(i--){
var p = self.particles[i];							

var coordRand = (rand(1,3)-1);
self.ctx.beginPath();								
self.ctx.moveTo(Math.round(p.coordLast[coordRand].x), Math.round(p.coordLast[coordRand].y));
self.ctx.lineTo(Math.round(p.x), Math.round(p.y));
self.ctx.closePath();				
self.ctx.strokeStyle = 'hsla('+p.hue+', 100%, '+p.brightness+'%, '+p.alpha+')';
self.ctx.stroke();				

if(self.flickerDensity > 0){
	var inverseDensity = 50 - self.flickerDensity;					
	if(rand(0, inverseDensity) === inverseDensity){
		self.ctx.beginPath();
		self.ctx.arc(Math.round(p.x), Math.round(p.y), rand(p.lineWidth,p.lineWidth+3)/2, 0, Math.PI*2, false)
		self.ctx.closePath();
		var randAlpha = rand(50,100)/100;
		self.ctx.fillStyle = 'hsla('+p.hue+', 100%, '+p.brightness+'%, '+randAlpha+')';
		self.ctx.fill();
	}	
}
};
};


self.createFireworks = function(startX, startY, targetX, targetY){
var newFirework = {
x: startX,
y: startY,
startX: startX,
startY: startY,
hitX: false,
hitY: false,
coordLast: [
	{x: startX, y: startY},
	{x: startX, y: startY},
	{x: startX, y: startY}
],
targetX: targetX,
targetY: targetY,
speed: self.fworkSpeed,
angle: Math.atan2(targetY - startY, targetX - startX),
shockwaveAngle: Math.atan2(targetY - startY, targetX - startX)+(90*(Math.PI/180)),
acceleration: self.fworkAccel/100,
hue: self.currentHue,
brightness: rand(50, 80),
alpha: rand(50,100)/100,
lineWidth: self.lineWidth
};			
self.fireworks.push(newFirework);

};


self.updateFireworks = function(){
var i = self.fireworks.length;

while(i--){
var f = self.fireworks[i];
self.ctx.lineWidth = f.lineWidth;

vx = Math.cos(f.angle) * f.speed,
vy = Math.sin(f.angle) * f.speed;
f.speed *= 1 + f.acceleration;				
f.coordLast[2].x = f.coordLast[1].x;
f.coordLast[2].y = f.coordLast[1].y;
f.coordLast[1].x = f.coordLast[0].x;
f.coordLast[1].y = f.coordLast[0].y;
f.coordLast[0].x = f.x;
f.coordLast[0].y = f.y;

if(f.startX >= f.targetX){
	if(f.x + vx <= f.targetX){
		f.x = f.targetX;
		f.hitX = true;
	} else {
		f.x += vx;
	}
} else {
	if(f.x + vx >= f.targetX){
		f.x = f.targetX;
		f.hitX = true;
	} else {
		f.x += vx;
	}
}

if(f.startY >= f.targetY){
	if(f.y + vy <= f.targetY){
		f.y = f.targetY;
		f.hitY = true;
	} else {
		f.y += vy;
	}
} else {
	if(f.y + vy >= f.targetY){
		f.y = f.targetY;
		f.hitY = true;
	} else {
		f.y += vy;
	}
}				

if(f.hitX && f.hitY){
	self.createParticles(f.targetX, f.targetY, f.hue);
	self.fireworks.splice(i, 1);
	
}
};
};

self.drawFireworks = function(){
var i = self.fireworks.length;
self.ctx.globalCompositeOperation = 'lighter';
while(i--){
var f = self.fireworks[i];		
self.ctx.lineWidth = f.lineWidth;

var coordRand = (rand(1,3)-1);					
self.ctx.beginPath();							
self.ctx.moveTo(Math.round(f.coordLast[coordRand].x), Math.round(f.coordLast[coordRand].y));
self.ctx.lineTo(Math.round(f.x), Math.round(f.y));
self.ctx.closePath();
self.ctx.strokeStyle = 'hsla('+f.hue+', 100%, '+f.brightness+'%, '+f.alpha+')';
self.ctx.stroke();	

if(self.showTarget){
	self.ctx.save();
	self.ctx.beginPath();
	self.ctx.arc(Math.round(f.targetX), Math.round(f.targetY), rand(1,8), 0, Math.PI*2, false)
	self.ctx.closePath();
	self.ctx.lineWidth = 1;
	self.ctx.stroke();
	self.ctx.restore();
}
	
if(self.showShockwave){
	self.ctx.save();
	self.ctx.translate(Math.round(f.x), Math.round(f.y));
	self.ctx.rotate(f.shockwaveAngle);
	self.ctx.beginPath();
	self.ctx.arc(0, 0, 1*(f.speed/5), 0, Math.PI, true);
	self.ctx.strokeStyle = 'hsla('+f.hue+', 100%, '+f.brightness+'%, '+rand(25, 60)/100+')';
	self.ctx.lineWidth = f.lineWidth;
	self.ctx.stroke();
	self.ctx.restore();
}
};
};

self.bindEvents = function(){
$(window).on('resize', function(){			
clearTimeout(self.timeout);
self.timeout = setTimeout(function() {
	self.canvas.width = self.cw = $(window).innerWidth();
	self.canvas.height = self.ch = $(window).innerHeight();
	self.ctx.lineCap = 'round';
	self.ctx.lineJoin = 'round';
}, 100);
});

$(self.canvas).on('mousedown', function(e){
self.mx = e.pageX - self.canvas.offsetLeft;
self.my = e.pageY - self.canvas.offsetTop;
self.currentHue = rand(self.hueMin, self.hueMax);
self.createFireworks(self.cw/2, self.ch, self.mx, self.my);	

$(self.canvas).on('mousemove.fireworks', function(e){
	self.mx = e.pageX - self.canvas.offsetLeft;
	self.my = e.pageY - self.canvas.offsetTop;
	self.currentHue = rand(self.hueMin, self.hueMax);
	self.createFireworks(self.cw/2, self.ch, self.mx, self.my);									
});				
});

$(self.canvas).on('mouseup', function(e){
$(self.canvas).off('mousemove.fireworks');									
});
		
}

self.clear = function(){
self.particles = [];
self.fireworks = [];
self.ctx.clearRect(0, 0, self.cw, self.ch);
};


self.canvasLoop = function(){
requestAnimFrame(self.canvasLoop, self.canvas);			
self.ctx.globalCompositeOperation = 'destination-out';
self.ctx.fillStyle = 'rgba(0,0,0,'+self.clearAlpha/100+')';
self.ctx.fillRect(0,0,self.cw,self.ch);
self.updateFireworks();
self.updateParticles();
self.drawFireworks();			
self.drawParticles();

};

self.init();		

}



var fworks = new Fireworks();

$('#info-toggle').on('click', function(e){
$('#info-inner').stop(false, true).slideToggle(100);
e.preventDefault();
});	

});


requestAnimFrame = (function() {
return window.requestAnimationFrame ||
window.webkitRequestAnimationFrame ||
window.mozRequestAnimationFrame ||
window.oRequestAnimationFrame ||
window.msRequestAnimationFrame ||
function(callback) {
window.setTimeout(callback, 1000/60);
};
})();

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var width = 0;
var height = 0;

window.onresize = function onresize() {
	width = canvas.width = window.innerWidth;
	height = canvas.height = window.innerHeight;
}

window.onresize();

var mouse = {
	X : 0,
	Y : 0
}

window.onmousemove = function onmousemove(event) {
	mouse.X = event.clientX;
	mouse.Y = event.clientY;
}

var particules = [];
var gouttes = [];
var nombrebase = 5;
var nombreb = 2;

var controls = {
	rain : 2,
	Object : "Nothing",
	alpha : 1,
	color : 200,
	auto : false,
	opacity : 1,
	saturation : 100,
	lightness : 50,
	back : 100,
	red : 0,
	green : 0,
	blue : 0,
	multi : false,
	speed : 2
};

function Rain(X, Y, nombre) {
	if (!nombre) {
		nombre = nombreb;
	}
	while (nombre--) {
		particules.push( 
		{
			vitesseX : (Math.random() * 0.25),
			vitesseY : (Math.random() * 9) + 1,
			X : X,
			Y : Y,
			alpha : 1,
			couleur : "hsla(" + controls.color + "," + controls.saturation + "%, " + controls.lightness + "%," + controls.opacity + ")",
		})
	}
}

function explosion(X, Y, couleur, nombre) {
	if (!nombre) {
		nombre = nombrebase;
	}
	while (nombre--) {
		gouttes.push( 
		{
			vitesseX : (Math.random() * 4-2	),
			vitesseY : (Math.random() * -4 ),
			X : X,
			Y : Y,
			radius : 0.65 + Math.floor(Math.random() *1.6),
			alpha : 1,
			couleur : couleur
		})
	}
}

function rendu(ctx) {

	if (controls.multi == true) {
		controls.color = Math.random()*360;
	}

	ctx.save();
	ctx.fillStyle = 'rgba('+controls.red+','+controls.green+','+controls.blue+',' + controls.alpha + ')';
	ctx.fillRect(0, 0, width, height);
	
	var particuleslocales = particules;
	var goutteslocales = gouttes;
	var tau = Math.PI * 2;

	for (var i = 0, particulesactives; particulesactives = particuleslocales[i]; i++) {
			
		ctx.globalAlpha = particulesactives.alpha;
		ctx.fillStyle = particulesactives.couleur;
		ctx.fillRect(particulesactives.X, particulesactives.Y, particulesactives.vitesseY/4, particulesactives.vitesseY);
	}

	for (var i = 0, gouttesactives; gouttesactives = goutteslocales[i]; i++) {
			
		ctx.globalAlpha = gouttesactives.alpha;
		ctx.fillStyle = gouttesactives.couleur;
		
		ctx.beginPath();
		ctx.arc(gouttesactives.X, gouttesactives.Y, gouttesactives.radius, 0, tau);
		ctx.fill();
	}
		ctx.strokeStyle = "white";
		ctx.lineWidth   = 2;

		if (controls.Object == "Umbrella") {
			ctx.beginPath();
			ctx.arc(mouse.X, mouse.Y+10, 138, 1 * Math.PI, 2 * Math.PI, false);
			ctx.lineWidth = 3;
			ctx.strokeStyle = "hsla(0,100%,100%,1)";
			ctx.stroke();
		}
		if (controls.Object == "Cup") {
			ctx.beginPath();
			ctx.arc(mouse.X, mouse.Y+10, 143, 1 * Math.PI, 2 * Math.PI, true);
			ctx.lineWidth = 3;
			ctx.strokeStyle = "hsla(0,100%,100%,1)";
			ctx.stroke();
		}
		if (controls.Object == "Circle") {
			ctx.beginPath();
			ctx.arc(mouse.X, mouse.Y+10, 138, 1 * Math.PI, 3 * Math.PI, false);
			ctx.lineWidth = 3;
			ctx.strokeStyle = "hsla(0,100%,100%,1)";
			ctx.stroke();
		}
	ctx.restore();
	
	if (controls.auto) {
		controls.color += controls.speed;
		if (controls.color >=360) {
			controls.color = 0;
		}
	}
}

function update() {

	var particuleslocales = particules;
	var goutteslocales = gouttes;
	
	for (var i = 0, particulesactives; particulesactives = particuleslocales[i]; i++) {
		particulesactives.X += particulesactives.vitesseX;
		particulesactives.Y += particulesactives.vitesseY+5;
		if (particulesactives.Y > height-15) {
			particuleslocales.splice(i--, 1);
			explosion(particulesactives.X, particulesactives.Y, particulesactives.couleur);
		}
		var umbrella = (particulesactives.X - mouse.X)*(particulesactives.X - mouse.X) + (particulesactives.Y - mouse.Y)*(particulesactives.Y - mouse.Y);
			if (controls.Object == "Umbrella") {
				if (umbrella < 20000 && umbrella > 10000 && particulesactives.Y < mouse.Y) {
					explosion(particulesactives.X, particulesactives.Y, particulesactives.couleur);
					particuleslocales.splice(i--, 1);
				}
			}
			if (controls.Object == "Cup") {
				if (umbrella > 20000 && umbrella < 30000 && particulesactives.X+138 > mouse.X && particulesactives.X-138 < mouse.X && particulesactives.Y > mouse.Y) {
					explosion(particulesactives.X, particulesactives.Y, particulesactives.couleur);
					particuleslocales.splice(i--, 1);
				}
			}
			if (controls.Object == "Circle") {
				if (umbrella < 20000) {
					explosion(particulesactives.X, particulesactives.Y, particulesactives.couleur);
					particuleslocales.splice(i--, 1);
				}
			}
	}

	for (var i = 0, gouttesactives; gouttesactives = goutteslocales[i]; i++) {
		gouttesactives.X += gouttesactives.vitesseX;
		gouttesactives.Y += gouttesactives.vitesseY;
		gouttesactives.radius -= 0.075;
		if (gouttesactives.alpha > 0) {
			gouttesactives.alpha -= 0.005;
		} else {
			gouttesactives.alpha = 0;
		}
		if (gouttesactives.radius < 0) {
			goutteslocales.splice(i--, 1);
		}
	}

	var i = controls.rain;
	while (i--) {
		Rain(Math.floor((Math.random()*width)), -15);
	}
}

function Screenshot() {
	window.open(canvas.toDataURL());
}

window.onload = function() {
	var gui = new dat.GUI();
	gui.add(controls, 'rain', 1, 10).name("Rain intensity").step(1);
	gui.add(controls, 'alpha', 0.1, 1).name("Alpha").step(0.1);
	gui.add(controls, 'color', 0, 360).name("Color").step(1).listen();
	gui.add(controls, 'auto').name("Automatic color");
	gui.add(controls, 'speed', 1, 10).name("Speed color").step(1);
	gui.add(controls, 'multi').name("Multicolor");
	gui.add(controls, 'saturation', 0, 100).name("Saturation").step(1);
	gui.add(controls, 'lightness', 0, 100).name("Lightness").step(1);
	gui.add(controls, 'opacity', 0.0, 1).name("Opacity").step(0.1);
	gui.add(controls, 'Object', ['Nothing','Circle','Umbrella', 'Cup']);
	gui.add(window, 'Screenshot');
	var Background = gui.addFolder('Background color');
	Background.add(controls, 'red', 0, 255).step(1);
	Background.add(controls, 'green', 0, 255).step(1);
	Background.add(controls, 'blue', 0, 255).step(1);
};

(function boucle() {
	requestAnimFrame(boucle);
	update();
	rendu(ctx);
})();