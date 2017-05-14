/*
Ver: 0.1;

To do:
- octo-directional events
- additional controlls
- score and stats display
- tanks head-to-head shooting
*/

//current game
var game={},
	lastGame=null,
	changeGame=function (selectedGame) {
		var fn;
		if (game.unload) {
			$k(window).on('brickUnload', function () {
				game.unload=null;
				changeGame(selectedGame);
			});
			game.unload();
		}
		else {
			if (game.functions) {
				for (fn in game.functions) {
					console.removeFunction(fn);
				}
			}
			effects.clear();
			lastGame=game;
			game=(typeof selectedGame==='string') ? games[selectedGame] : selectedGame;
			if (selectedGame.functions) {
				for (fn in selectedGame.functions) {
					console.addFunction(fn, selectedGame.functions[fn]);
				}
			}
			game.start();
		}
	},
	games={},
	Game=function (gm, name) {
		games[name]=gm;
		return games[name];
	},
	
	//screen size in game pixels
	width=15,
	height=25,
	_nativeWidth=15,
	_nativeHeight=25,
	_makeScreen=function () {
		var _canvas=window._canvas=$k('#screen')[0];
		if (!_canvas) {
			_canvas=document.createElement('canvas');
			_canvas.id='screen';
			_canvas.height=251;
			_canvas.width=151;
			$k('body')[0].appendChild(_canvas);
			window._canvas=_canvas;
		}
		window._screen=_canvas.getContext('2d');
	},
	setSize=function (width, height) {
		width=window.width=(!isNaN(width) && isFinite(width)) ? width : _nativeWidth;
		height=window.height=(!isNaN(height) && isFinite(height)) ? height : _nativeHeight;
		_canvas.width=width*10+1;
		_canvas.height=height*10+1;
		_screen.fillStyle=color;
		_screen.strokeStyle=color;
		makeScreen();
	},
	
	//grid of pixels
	grid=[],
	get=function (array, ar2) {
		if (typeof array==='number' && typeof ar2==='number') {
			return grid[array][ar2];
		}
		else {
			return grid[array[0]][array[1]];
		}
	},
	pixel=function (x, y) {
		this.x=x;
		this.y=y;
		this.state=0;
		this.id=x.leadingZeroes(3)+y.leadingZeroes(3);
	},
	pixelPrototype={
		on: function () {
			this.state=1;
			this.update();
		},
		off: function () {
			this.state=0;
			this.update();
		},
		semi: function () {
			this.state=2;
			this.update();
		},
		toggle: function () {
			if (this.state==1) {
				this.state=0;
			}
			else {
				this.state=1;
			}
			this.update();
		},
		semiToggle: function () {
			if (this.state==2) {
				this.state=1;
			}
			else {
				this.state=2;
			}
			this.update();
		},
		update: function () {
			if (this.state===0) {
				_screen.clearRect(10*this.x+1, 10*this.y+1, 9, 9);
			}
			else if (this.state===1) {
				_screen.strokeRect(10*this.x+1.5, 10*this.y+1.5, 8, 8);
				_screen.fillRect(10*this.x+3, 10*this.y+3, 5, 5);
			}
			else {
				_screen.clearRect(10*this.x+1, 10*this.y+1, 9, 9);
				_screen.strokeRect(10*this.x+1.5, 10*this.y+1.5, 8, 8);
			}
		}
	},
	color='#5f5f5f',
	
	//timings for keys
	pressTimeout=15,
	holdInterval=50,
	holdTimeout=15,
	noPressed=0,
	keys=[],
	actionPressed=function () {
		return keys.find('action');
	},
	leftPressed=function () {
		return keys.find('left');
	},
	upPressed=function () {
		return keys.find('up');
	},
	rightPressed=function () {
		return keys.find('right');
	},
	downPressed=function () {
		return keys.find('down');
	},
	
	//pure efects
	effects={
	
		//fill top-down with black
		fill: function () {
			if (effects.fillJ===height) {
				clearInterval(effects.fillRef);
			}
			else {
				grid[effects.fillI][effects.fillJ].on();
				effects.fillI++;
				effects.fillJ=(effects.fillI===width) ? ++effects.fillJ : effects.fillJ;
				effects.fillI=(effects.fillI===width) ? 0 : effects.fillI;
				effects.fillRef=effects.fillRan ? null : setInterval(effects.fill, 2);
				effects.fillRan=true;
			}
		},
		fillRan: false,
		fillI: 0,
		fillJ: 0,
		fillRef: null,
		
		//negative
		negate: function (times) {
			var _i, _j;
			if (times) {
				effects.negateI=times;
			}
			if (effects.negateI) {
				for (_i=0; _i<width; _i++) {
					for (_j=0; _j<height; _j++) {
						grid[_i][_j].toggle();
					}
				}
				setTimeout(effects.negate, 250);
				effects.negateI--;
			}
		},
		negateI: 0,
		
		//instantly empty
		clear: function () {
			var i, j;
			for (i=0; i<width; i++) {
				for (j=0; j<height; j++) {
					get(i, j).off();
				}
			}
		},
	},
	
	//create screen canvas and pixels
	makeScreen=function () {
		var i, j;
		for (i=0; i<width; i++) {
			grid[i]=[];
			for (j=0; j<height; j++) {
				grid[i][j]=new pixel(i, j);
			}
		}
	},
	
	//register custom events
	registerEvents=function () {
		
		//on key pressing, do corresponding action
		$k(window).on('keydown', function (event) {
			if (event.keyCode===192) {
				console.toggle();
			}
			else {
			
				//trigger key pressed
				$k(window).trigger('brickKey');
				if (event.keyCode==32) {
					
					//check to see if not pressed yet
					if (!keys.find('action')) {
						
						//flags
						keys.push('action');
						
						//timeout untill event fires
						setTimeout(function () {
							$k(window).trigger('brickControlKey');
							$k(window).trigger('brickAction');
						}, pressTimeout);
						
						//timeout untill hold event fires
						actionTimeout=setTimeout(function () {
							actionInterval=setInterval(function () {
								$k(window).trigger('brickActionHold');
							}, holdInterval);
						}, holdTimeout);
					}
				}
				else if (event.keyCode===37) {
					if (!keys.find('left')) {
						keys.push('left');
						setTimeout(function () {
							$k(window).trigger('brickControlKey');
							$k(window).trigger('brickLeft');
						}, pressTimeout);
						leftTimeout=setTimeout(function () {
							leftInterval=setInterval(function () {
								$k(window).trigger('brickLeftHold');
							}, holdInterval);
						}, holdTimeout);
					}
				}
				else if (event.keyCode===38) {
					if (!keys.find('up')) {
						keys.push('up');
						setTimeout(function () {
							$k(window).trigger('brickControlKey');
							$k(window).trigger('brickUp');
						}, pressTimeout);
						upTimeout=setTimeout(function () {
							upInterval=setInterval(function () {
								$k(window).trigger('brickUpHold');
							}, holdInterval);
						}, holdTimeout);
					}
				}
				else if (event.keyCode===39) {
					if (!keys.find('right')) {
						keys.push('right');
						setTimeout(function () {
							$k(window).trigger('brickControlKey');
							$k(window).trigger('brickRight');
						}, pressTimeout);
						rightTimeout=setTimeout(function () {
							rightInterval=setInterval(function () {
								$k(window).trigger('brickRightHold');
							}, holdInterval);
						}, holdTimeout);
					}
				}
				else if (event.keyCode===40) {
					if (!keys.find('down')) {
						keys.push('down');
						setTimeout(function () {
							$k(window).trigger('brickControlKey');
							$k(window).trigger('brickDown');
						}, pressTimeout);
						downTimeout=setTimeout(function () {
							downInterval=setInterval(function () {
								$k(window).trigger('brickDownHold');
							}, holdInterval);
						}, holdTimeout);
					}
				}
			}
		}, false);
		
		//clear flags on key release
		$k(window).on('keyup', function (event) {
			if (event.keyCode==32) {
				
				//clear flags and timings
				keys.remove('action');
				clearTimeout(actionTimeout);
				clearInterval(actionInterval);
			}
			else if (event.keyCode===37) {
				keys.remove('left');
				clearTimeout(leftTimeout);
				clearInterval(leftInterval);
			}
			else if (event.keyCode===38) {
				keys.remove('up');
				clearTimeout(upTimeout);
				clearInterval(upInterval);
			}
			else if (event.keyCode===39) {
				keys.remove('right');
				clearTimeout(rightTimeout);
				clearInterval(rightInterval);
			}
			else if (event.keyCode===40) {
				keys.remove('down');
				clearTimeout(downTimeout);
				clearInterval(downInterval);
			}
		}, false);
	},
	actionTimeout=null,
	actionInterval=null,
	leftTimeout=null,
	leftInterval=null,
	upTimeout=null,
	upInterval=null,
	rightTimeout=null,
	rightInterval=null,
	downTimeout=null,
	downInterval=null,
	
	//console
	console={
		
		//dom
		body: null,
		cmdBody: null,
		cmdOutpud: null,
		cmdInput: null,
		outputBody: null,
		outputScreen: null,
		_make: function () {
			console.body=$k('#consoleBody')[0];
			if (!console.body) {
				console.body=document.createElement('div');
				console.body.id='consoleBody';
				$k('body')[0].appendChild(console.body);
			}
			console.cmdBody=$k('#cmdBody')[0];
			if (!console.cmdBody) {
				console.cmdBody=document.createElement('div');
				console.cmdBody.id='cmdBody';
				$k(console.body)[0].appendChild(console.cmdBody);
			}
			console.cmdOutput=$k('#cmdOutput')[0];
			if (!console.cmdOutput) {
				console.cmdOutput=document.createElement('div');
				console.cmdOutput.id='cmdOutput';
				$k(console.cmdBody)[0].appendChild(console.cmdOutput);
			}
			console.cmdInput=$k('#cmdInput')[0];
			if (!console.cmdInput) {
				console.cmdInput=document.createElement('input');
				console.cmdInput.type='text';
				console.cmdInput.id='cmdInput';
				$k(console.cmdBody)[0].appendChild(console.cmdInput);
			}
			console.outputBody=$k('#outputBody')[0];
			if (!console.outputBody) {
				console.outputBody=document.createElement('pre');
				console.outputBody.id='outputBody';
				$k(console.body)[0].appendChild(console.outputBody);
			}
			console.outputScreen=$k('#outputScreen')[0];
			if (!console.outputScreen) {
				console.outputScreen=document.createElement('div');
				console.outputScreen.id='outputScreen';
				$k(console.outputBody)[0].appendChild(console.outputScreen);
			}
			$k(window).on('keydown', function (event) {
				if (event.keyCode===13) {
					console.interpret();
				}
			}, false);
		},
		
		//state
		state: 'closed',
		open: function () {
			console.body.style.display='block';
			console.state='open';
		},
		close: function () {
			console.body.style.display='none';
			console.state='closed';
		},
		toggle: function () {
			if (console.state==='closed') {
				console.open();
			}
			else {
				console.close();
			}
		},
		
		//interpretation
		interpret: function (command) {
			var returnValue;
			command=(command) ? command : console.cmdInput.value;
			console.print('>>> '+command);
			console.cmdInput.value='';
			if (console.functions[command]) {
				try {
					returnValue=console.functions[command]();
				}
				catch (error) {
					returnValue=error;
				}
			}
			else if (console.jsOn) {
				try {
					returnValue=eval(command);
				}
				catch (error) {
					returnValue=error;
				}
			}
			else {
				returnValue='Error: No such function was found';
			}
			returnValue=(returnValue===undefined) ? '>> <<\n' : '>>'+returnValue+'<<\n';
			console.print(returnValue);
		},
		jsOn: false,
		print: function (text) {
			console.cmdOutput.innerText+=text+'\n';
			while (console.cmdRowCount()>50) {
				console.cmdOutput.innerText=console.cmdOutput.innerText.replace(/^.*\n/, '');
			}
			console.cmdOutput.scrollTop=10000;
		},
		output: function (text, overwrite) {
			while (console.outputRowCount()>100) {
				console.outputScreen.innerText=console.outputScreen.innerText.replace(/^.*\n/, '');
			}
			if (overwrite) {
				console.outputScreen.innerText=text+'\n';
			}
			else {
				console.outputScreen.innerText+=text+'\n';
			}
			console.outputScreen.scrollTop=10000;
		},
		outputRowCount: function () {
			return console.outputScreen.innerText.count('\n');
		},
		cmdRowCount: function () {
			return console.cmdOutput.innerText.count('\n');
		},
		
		//functions
		functions: {
			js: function () {
				console.jsOn=!console.jsOn;
				return 'JavaScript is '+((console.jsOn) ? 'on' : 'off');
			},
			clear: function () {
				console.cmdOutput.innerText='';
			},
			consoleTest: function () {
				alert('Success!');
				return false;
			}
		},
		addFunction: function (name, code) {
			console.functions[name]=code;
		},
		removeFunction: function (name) {
			delete console.functions[name];
		},
	},
	
	init=function () {
		_makeScreen();
		console._make();
		pixel.prototype=pixelPrototype;
		$k('#screen').css('border-color', color);
		setSize();
		makeScreen();
		registerEvents();
	};
init();

//move game
move={
	start: function () {
		grid[Math.floor(height/2)][Math.floor(width/2)].on();
		$k(window).on('brickLeft', game.moveLeft, false);
		$k(window).on('brickLeftHold', game.moveLeft, false);
		$k(window).on('brickRight', game.moveRight, false);
		$k(window).on('brickRightHold', game.moveRight, false);
		$k(window).on('brickUp', game.moveUp, false);
		$k(window).on('brickUpHold', game.moveUp, false);
		$k(window).on('brickDown', game.moveDown, false);
		$k(window).on('brickDownHold', game.moveDown, false);
	},
	currentI: Math.floor(height/2),
	currentJ: Math.floor(width/2),
	moveLeft: function () {
		game.currentJ=game.currentJ ? --game.currentJ : 0;
		game.updatePosition();
	},
	moveRight: function () {
		game.currentJ=(game.currentJ==width-1) ? width-1 : ++game.currentJ;
		game.updatePosition();
	},
	moveUp: function () {
		game.currentI=game.currentI ? --game.currentI : 0;
		game.updatePosition();
	},
	moveDown: function () {
		game.currentI=(game.currentI==height-1) ? height-1 : ++game.currentI;
		game.updatePosition();
	},
	updatePosition: function () {
		effects.clear();
		grid[game.currentI][game.currentJ].on();
	},
	unload: function () {
	}
}

snake=new Game({
	start: function () {
		$k(window).on('brickControlKey', game.startMovement, false);
		$k(window).on('brickLeft', game.changeDirection, false);
		$k(window).on('brickUp', game.changeDirection, false);
		$k(window).on('brickRight', game.changeDirection, false);
		$k(window).on('brickDown', game.changeDirection, false);
		game.loadLevel(game.levels.level3);
	},
	
	//functions for the console
	functions: {
		edit: function () {
			var prop;
			if (game.editMode) {
				for (prop in game.editorFunctions) {
					console.removeFunction(prop);
				}
				$k(window).off('mousedown', game._listenToMD, false);
				$k(window).off('mouseup', game._listenToMU, false);
				$k(window).off('mousemove', game._listenToMM, false);
				game.editMode=false;
				changeGame(snake);
				return 'Exited Level Editor';
			}
			else {
				clearTimeout(game.foodRef);
				clearTimeout(game.tRef);
				$k(window).on('mousedown', game._listenToMD, false);
				$k(window).on('mouseup', game._listenToMU, false);
				$k(window).on('mousemove', game._listenToMM, false);
				effects.clear();
				for (prop in game.editorFunctions) {
					console.addFunction(prop, game.editorFunctions[prop]);
				}
				game.editMode=true;
				return 'Entered Level Editor';
			}
		}		
	},
	
	//level editor
	editorFunctions: {
		output: function () {
			var i, j, txt='\t\t\twalls: [\n\t\t\t\t', k=0;
			for (i=0; i<width; i++) {
				for (j=0; j<height; j++) {
					if (get([i, j]).state===1) {
						txt+='['+i+', '+j+'],'+(k===9 ? '' : ' ');
						if (k===9) {
							k=0;
							txt+='\n\t\t\t\t';
						}
						else {
							k++;
						}
					}
				}
			}
			txt=txt.substr(0, txt.length-2);
			txt+='\n\t\t\t],';
			console.output(txt);
		}
	},
	_listenToMD: function (ev) {
		game.clicked=ev.button;
	},
	_listenToMU: function (ev) {
		game.clicked=false;
	},
	_listenToMM: function (ev) {
		if (ev.pageX>_canvas.offsetLeft && ev.pageX<_canvas.offsetLeft+_canvas.width && ev.pageY>_canvas.offsetTop && ev.pageY<_canvas.offsetTop+_canvas.height) {
			cell=get([((ev.pageX-_canvas.offsetLeft)-(ev.pageX-_canvas.offsetLeft)%10)/10, ((ev.pageY-_canvas.offsetTop)-(ev.pageY-_canvas.offsetTop)%10)/10]);
			if (game.clicked===0) {
				cell.on();
			}
			else if (game.clicked===2) {
				cell.off();
			}
		}
	},
	clicked: false,
	editMode: false,
	
	food: [],
	eaten: false,
	eatenNo: null,
	setFood: function () {
		var food;
		food=[Math.floor(Math.random()*width), Math.floor(Math.random()*height)];
		if (!game.isEmptyCell(food)) {
			game.setFood();
		}
		else {
			game.food=food;
		}
	},
	flashFood: function (restart) {
		if (!game.lost) {
			if (restart) {
				clearTimeout(game.foodRef);
			}
			get(game.food).toggle();
			game.foodRef=setTimeout(game.flashFood, game.speed);
		}
	},
	foodRef: null,
	changeDirection: function (event) {
		var newDirection=event.type.replace(/brick/, '').toLowerCase(), oldDirection=game.direction;
		if (newDirection==='left' && oldDirection!=='right' || newDirection==='up' && oldDirection!=='down' || newDirection==='right' && oldDirection!=='left' || newDirection==='down' && oldDirection!=='up') {
			game.nextDirection=newDirection;
		}
	},
	snakeDefault: function () {
		return [[Math.floor(width/2), Math.floor(height/2-1)],
			[Math.floor(width/2), Math.floor(height/2)],
			[Math.floor(width/2), Math.floor(height/2+1)]
		]
	},
	snake: null,
	head: function () {
		return game.snake[game.snake.length-1];
	},
	tail: null,
	nextDirection: 'down',
	direction: 'down',
	nextTile: function () {
		var head=game.head();
		switch (game.direction) {
			case 'left':
				return [(head[0]===0) ? width-1 : head[0]-1, head[1]];
			case 'up':
				return [head[0], (head[1]===0) ? height-1 : head[1]-1];
			case 'right':
				return [(head[0]===width-1) ? 0 : head[0]+1, head[1]];
			case 'down':
				return [head[0], (head[1]===height-1) ? 0 : head[1]+1];
		}
	},
	collided: function () {
		var _i, _len, _snake=game.snake, _next=game.nextTile(), _food=game.food;
		if (game.eaten) {
			game.eaten=false;
			game.snake.unshift(game.tail);
		}
		if (_next[0]===_food[0] && _next[1]===_food[1]) {
			game.eaten=true;
			game.eatenNo++;
			game.setFood();
		}
		if (game.isUsedCell(_next)) {
			return true;
		}
		else {
			return false;
		}
	},
	lose: function () {
		effects.negate(6);
		game.lost=true;
		setTimeout(function () {changeGame('Menu');}, 1500);
	},
	lost: false,
	moveSnake: function () {
		game.direction=game.nextDirection;
		game.tail=game.snake[0];
		if (game.collided()) {
			game.lose();
		}
		else {
			game.snake.push(game.nextTile());
			game.snake.shift();
			game.updateSnake();
			game.speed=game.speedFunction();
			game.tRef=setTimeout(game.moveSnake, game.speed);
		}
	},
	updateSnake: function (full) {
		var _i, _len, _snake;
		get(game.tail).off();
		if (full) {
			for (_i=0, _len=game.snake.length, _snake=game.snake; _i<_len; _i++) {
				get(_snake[_i]).on();
			}
		}
		else {
			get(game.head()).on();
		}
	},
	speedFunction: function () {
		return game.defaultSpeed;
	},
	defaultSpeedFunction: function () {
		return game.defaultSpeed;
	},
	defaultSpeed: 150,
	speed: null,
	tRef: null,
	started: false,
	startMovement: function () {
		cWrite('ce');
		if (!game.started) {
			game.speed=game.speedFunction();
			game.tRef=setTimeout(game.moveSnake, game.speed);
		}
		game.started=true;
	},
	isSnakeCell: function (cell) {
		var _i, _len;
		for (_i=0, _len=game.snake.length; _i<_len; _i++) {
			if (cell[0]===game.snake[_i][0] && cell[1]===game.snake[_i][1]) {
				return true;
			}
		}
		return false;
	},
	isWallCell: function (cell) {
		var _i, _len;
		for (_i=0, _len=game.walls.length; _i<_len; _i++) {
			if (cell[0]===game.walls[_i][0] && cell[1]===game.walls[_i][1]) {
				return true;
			}
		}
		return false;
	},
	isUsedCell: function (cell) {
		return (game.isSnakeCell(cell) || game.isWallCell(cell));
	},
	isEmptyCell: function (cell) {
		return !(game.isSnakeCell(cell) || game.isWallCell(cell) || (cell[0]===game.food[0] && cell[1]===game.food[1]));
	},
	walls: [],
	drawWalls: function () {
		var _i;
		for (_i=0; _i<game.walls.length; _i++) {
			get(game.walls[_i]).on();
		}
	},
	levels: {
		level0: {
			walls: []
		},
		level1: {
			walls: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], 
				[0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], [0, 16], [0, 17], [0, 18], [0, 19], 
				[0, 20], [0, 21], [0, 22], [0, 23], [0, 24], [14, 0], [14, 1], [14, 2], [14, 3], [14, 4], 
				[14, 5], [14, 6], [14, 7], [14, 8], [14, 9], [14, 10], [14, 11], [14, 12], [14, 13], [14, 14], 
				[14, 15], [14, 16], [14, 17], [14, 18], [14, 19], [14, 20], [14, 21], [14, 22], [14, 23], [14, 24], 
				[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], 
				[11, 0], [12, 0], [13, 0], [1, 24], [2, 24], [3, 24], [4, 24], [5, 24], [6, 24], [7, 24], 
				[8, 24], [9, 24], [10, 24], [11, 24], [12, 24], [13, 24]
			],
			semiWalls: [{
					timeOn: 2000,
					timeOff: 1000,
					cells: [[5, 5], [5, 6], [5, 7]],
				}
			],
			width: 15,
			height: 25
		},
		level2: {
			walls: [[6, 5], [7, 5], [8, 5], [6, 6], [7, 6], [8, 6], [6, 7], [7, 7], [8, 7], [6, 8],
				[7, 8], [8, 8], [6, 9], [7, 9], [8, 9], [6, 10], [7, 10], [8, 10], [3, 11], [4, 11],
				[5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [3, 12], [4, 12], [5, 12],
				[6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [11, 12], [3, 13], [4, 13], [5, 13], [6, 13],
				[7, 13], [8, 13], [9, 13], [10, 13], [11, 13], [6, 14], [7, 14], [8, 14], [6, 15], [7, 15],
				[8, 15], [6, 16], [7, 16], [8, 16], [6, 17], [7, 17], [8, 17], [6, 18], [7, 18], [8, 18],
				[6, 19], [7, 19], [8, 19]
			],
			semiWalls: [{
					timeOn: 2000,
					timeOff: 1000,
					cells: [[5, 5], [5, 6], [5, 7]],
				}
			],
			snake: [
				[2, 5], [2, 6], [2, 7]
			],
			width: 15,
			height: 25,
			speedFunction: function () {
				return 1000/(game.eatenNo+1);
			}
		},
		level3: {
			walls:[[3, 6],[3, 7],[3, 8],[3, 9],[3, 10],[3, 11],[3, 12],[3, 13],[3, 14],[3, 15],
				[3, 16],[3, 17],[3, 18],[4, 6],[4, 7],[4, 8],[4, 9],[4, 10],[4, 11],[4, 12],
				[4, 13],[4, 14],[4, 15],[4, 16],[4, 17],[4, 18],[5, 6],[5, 7],[5, 8],[5, 9],
				[5, 10],[5, 11],[5, 12],[5, 13],[5, 14],[5, 15],[5, 16],[5, 17],[5, 18],[6, 11],
				[6, 12],[6, 13],[7, 11],[7, 12],[7, 13],[8, 11],[8, 12],[8, 13],[9, 6],[9, 7],
				[9, 8],[9, 9],[9, 10],[9, 11],[9, 12],[9, 13],[9, 14],[9, 15],[9, 16],[9, 17],
				[9, 18],[10, 6],[10, 7],[10, 8],[10, 9],[10, 10],[10, 11],[10, 12],[10, 13],[10, 14],
				[10, 15],[10, 16],[10, 17],[10, 18],[11, 6],[11, 7],[11, 8],[11, 9],[11, 10],[11, 11],
				[11, 12],[11, 13],[11, 14],[11, 15],[11, 16],[11, 17],[11, 18]
			],
			snake: [
				[1, 3], [1, 4], [1, 5]
			]
		}
	},
	loadLevel: function (level) {
		setSize(level.width, level.height);
		game.walls=level.walls;
		game.drawWalls();
		game.snake=(level.snake) ? level.snake : game.snakeDefault();
		game.tail=game.snake[0];
		game.updateSnake(true);
		game.setFood();
		game.eatenNo=0;
		game.speedFunction=(level.speedFunction) ? level.speedFunction : game.defaultSpeedFunction;
		game.speed=game.speedFunction();
		game.foodRef=setTimeout(function () {
			game.flashFood(true);
		}, game.speed);
	},
	unload: function () {
		clearTimeout(game.foodRef);
		clearTimeout(game.tRef);
		$k(window).off('brickControlKey', game.startMovement, false);
		$k(window).off('brickLeft', game.changeDirection, false);
		$k(window).off('brickUp', game.changeDirection, false);
		$k(window).off('brickRight', game.changeDirection, false);
		$k(window).off('brickDown', game.changeDirection, false);
		if (game.editMode) {
			game.functions.edit();
		}
		$k(window).trigger('brickUnload');
	},
	loadScreen: [
		[3, 4], [3, 5], [3, 6], [3, 7], [3, 10], [3, 11], [3, 12], [3, 15], [4, 4], [4, 7],
		[4, 10], [5, 4], [5, 7], [5, 10], [6, 4], [6, 7], [6, 8], [6, 9], [6, 10], [10, 6],
		[10, 7], [10, 8], [10, 9], [11, 6], [11, 7], [11, 8], [11, 9], [12, 6], [12, 7], [12, 8],
		[12, 9]
	]
}, 'Snake');

tanks=new Game({
	start: function () {
		$k(window).on('brickLeft', game.addKey, false);
		$k(window).on('brickRight', game.addKey, false);
		$k(window).on('brickDown', game.addKey, false);
		$k(window).on('brickUp', game.addKey, false);
		$k(window).on('brickAction', game.addKey, false);
		game.loadLevel(game.levels.level0);
	},
	loadLevel: function (level) {
		var i;
		game.level=level;
		clearInterval(game.updateInterval);
		game.tanks=[];
		game.projectiles=[];
		game.tanks.unshift(new game.tank(level.userTank, true));
		for (i=0; i<level.tanks.length; i++) {
			game.tanks.unshift(new game.tank(level.tanks[i]));
		}
		game.userTank=game.tanks[game.tanks.length-1];
		game.walls=level.walls;
		game.update();
		game.updateInterval=setInterval(game.update, level.speedFunction());
	},
	keys: [],
	addKey: function (event) {
		key=event.type.replace('brick', '').toLowerCase();
		game.keys.push(key);
	},
	handleControlls: function () {
		var i, dir=game.userTank.direction;
		for (i=0; i<keys.length; i++) {
			if (!game.keys.find(keys[i])) {
				game.keys.push(keys[i]);
			}
		}
		if (game.keys.find('left') || game.keys.find('up') || game.keys.find('right') || game.keys.find('down')) {
			if (game.keys[0]==='action') {
				game.userTank.move(game.keys[1])
			}
			else {
				game.userTank.move(game.keys[0]);
			}
		}
		if (game.keys.find('action')) {
			game.userTank.fire(dir);
		}
		game.keys=[];
	},
	updateInterval: null,
	update: function () {
		game.updateProjectilePositions();
		game.updateTankState();
		game.handleControlls();
		game.ai();
		effects.clear();
		game.drawTanks();
		game.drawProjectiles();
		game.drawWalls();
		//game.display();
	},
	display: function () {
		var i, j, txt='';
		for (j=0; j<height; j++) {
			txt+='<tr>';
			for (i=0; i<width; i++) {
				txt+='<td class="s'+get(i, j).state+'">'+game.pathArray[i][j]+'</td>';
			}
			txt+='</tr>';
		}
		$k('#matrixDisplay')[0].innerHTML=txt;
	},
	isOutside: function (left, top) {
		return (left<0 || left>=width || top<0 || top>=height);
	},
	isOnBorder: function (left, top) {
		return (left===0 || left===width-1 || top===0 || top===height-1);
	},
	neighbourWalls: function (left, top) {
		return game.isWallCell(left-1, top-1)+game.isWallCell(left, top-1)+game.isWallCell(left+1, top-1)+
			game.isWallCell(left-1, top)+game.isWallCell(left+1, top)+
			game.isWallCell(left-1, top+1)+game.isWallCell(left, top+1)+game.isWallCell(left+1, top+1);
	},
	isWallCell: function (left, top) {
		var i, j;
		for (i=0; i<game.walls.length; i++) {
			if (game.walls[i][0]===left && game.walls[i][1]===top) {
				return true;
			}
		}
		return false;
	},
	isEmptyCell: function (left, top) {
		var i, j, cells;
		if (left<0 || left>width-1 || top<0 || top>height-1) {
			return false;
		}
		for (i=0; i<game.tanks.length; i++) {
			cells=game.tanks[i].cells();
			for (j=0; j<cells.length; j++) {
				if (cells[j][0]===left && cells[j][1]===top) {
					return false;
				}
			}
		}
		for (i=0; i<game.walls.length; i++) {
			if (game.walls[i][0]===left && game.walls[i][1]===top) {
				return false;
			}
		}
		return true;
	},
	getTankByCell: function (left, top) {
		var i, j, cells;
		for (i=0; i<game.tanks.length; i++) {
			cells=game.tanks[i].cells();
			for (j=0; j<cells.length; j++) {
				if (cells[j][0]===left && cells[j][1]===top) {
					return game.tanks[i];
				}
			}
		}
		return false;
	},
	ai: function () {
		var tank, i, j, arr=game.pathArray;
		function crawl(i, j, value, direction) {
			if (game.isOutside(i, j)) {
				return false;
			}
			if (arr[i][j]!=0 && value<arr[i][j]) {
				arr[i][j]=value;
				crawl(i-1, j, value+1+(direction!=='left'), 'left');
				crawl(i+1, j, value+1+(direction!=='right'), 'right');
				crawl(i, j-1, value+1+(direction!=='up'), 'up');
				crawl(i, j+1, value+1+(direction!=='down'), 'down');
			}
		};
		arr.length=width;
		for (i=0; i<width; i++) {
			arr[i]=[];
			for (j=0; j<height; j++) {
				arr[i][j]=(game.isWallCell(i, j) || game.isOnBorder(i, j) || game.neighbourWalls(i, j)) ? 0 : 999;
			}
		}
		crawl(game.userTank.left, game.userTank.top, 1, game.userTank.direction);
		if (game.moveStep===5) {
			for (i=0; i<game.tanks.length-1; i++) {
				tank=game.tanks[i];
				if (tank.waitFire===2) {
					tank.waitFire=false;
					tank.fire();
				}
				else {
					if (tank.lookTowardsUserTank() || tank.hasUserTankInSight()) {
						if (tank.waitFire===0 || tank.waitFire) {
							tank.waitFire++;
						}
						else {
							tank.waitFire=0;
						}
					}
					else if (tank.waitFire===0 || tank.waitFire) {
						tank.waitFire++;
					}
					else {
						tank.travelTowardsUserTank();
					}
				}
			}
			game.moveStep=0;
		}
		else {
			game.moveStep++;
		}
	},
	pathArray: [],
	moveStep: 0,
	tank: function (array, user) {
		this.left=array[0];
		this.top=array[1];
		this.direction=array[2];
		this.userTank=user;
		this.advance=function () {
			var direction=this.direction;
			if (this.canAdvance()) {
				if (direction==='up') {
					this.top--;
				}
				else if (direction==='right') {
					this.left++;
				}
				else if (direction==='down') {
					this.top++;
				}
				else if (direction==='left') {
					this.left--;
				}
			}
		};
		this.move=function (newDirection) {
			if (this.direction===newDirection) {
				this.advance();
			}
			else {
				this.direction=newDirection;
			}
		};
		this.fireState=0;
		this.fire=function (dir) {
			var next=[];
			next[0]=(this.direction==='left') ? this.left-2 : this.left;
			next[0]=(this.direction==='right') ? this.left+2 : next[0];
			next[1]=(this.direction==='up') ? this.top-2 : this.top;
			next[1]=(this.direction==='down') ? this.top+2 : next[1];
			if (this.fireState===0) {
				game.projectiles.push([next[0], next[1], (dir || this.direction), this.userTank]);
				this.fireState=10;
			}
		};
		this.cells=function () {
			var left=this.left, top=this.top;
			return [
				[left-1, top-1], [left, top-1], [left+1, top-1],
				[left-1, top], [left, top], [left+1, top],
				[left-1, top+1], [left, top+1], [left+1, top+1],
			];
		};
		this.canAdvance=function () {
			var left=this.left, top=this.top, dir=this.direction, isEmptyCell=game.isEmptyCell;
			if (dir==='left') {
				return (isEmptyCell(left-2, top-1) && isEmptyCell(left-2, top) && isEmptyCell(left-2, top+1));
			}
			else if (dir==='up') {
				return (isEmptyCell(left-1, top-2) && isEmptyCell(left, top-2) && isEmptyCell(left+1, top-2));
			}
			else if (dir==='right') {
				return (isEmptyCell(left+2, top-1) && isEmptyCell(left+2, top) && isEmptyCell(left+2, top+1));
			}
			else if (dir==='down') {
				return (isEmptyCell(left-1, top+2) && isEmptyCell(left, top+2) && isEmptyCell(left+1, top+2));
			}
		};
		this.hasUserTankInSight=function () {
			var dir=this.direction, left=this.left, top=this.top, user=game.userTank, newDirection, i;
			if (left>=user.left-1 && left<=user.left+1) {
				if (top>user.top) {
					newDirection='up';
				}
				else {
					newDirection='down';
				}
			}
			else if (top>=user.top-1 && top<=user.top+1) {
				if (left>user.left) {
					newDirection='left';
				}
				else {
					newDirection='right';
				}
			}
			if (left>=user.left-1 && left<=user.left+1 || top>=user.top-1 && top<=user.top+1) {
				if (newDirection==='up') {
					for (i=top; i>user.top; i--) {
						if (game.isWallCell(left, i)) {
							return false;
						}
					}
					return true;
				}
				if (newDirection==='right') {
					for (i=left; i<user.left; i++) {
						if (game.isWallCell(i, top)) {
							return false;
						}
					}
					return true;
				}
				if (newDirection==='down') {
					for (i=top; i<user.top; i++) {
						if (game.isWallCell(left, i)) {
							return false;
						}
					}
					return true;
				}
				if (newDirection==='right') {
					for (i=left; i>user.left; i--) {
						if (game.isWallCell(i, top)) {
							return false;
						}
					}
					return true;
				}
			}
			return false;
		};
		this.lookTowardsUserTank=function () {
			var left=this.left, top=this.top, user=game.userTank, newDirection=this.direction;
			if (this.hasUserTankInSight()) {
				if (left>=user.left-1 && left<=user.left+1) {
					if (top>user.top) {
						newDirection='up';
					}
					else {
						newDirection='down';
					}
				}
				else if (top>=user.top-1 && top<=user.top+1) {
					if (left>user.left) {
						newDirection='left';
					}
					else {
						newDirection='right';
					}
				}
				if (this.direction!==newDirection) {
					this.direction=newDirection;
					return true;
				}
			}
			return false;
		};
		this.waitFire=false;
		this.travelTowardsUserTank=function () {
			var left=this.left, top=this.top;
			var upCell=(game.pathArray[left][top-1] || 999), rightCell=(game.pathArray[left+1][top] || 999), downCell=(game.pathArray[left][top+1] || 999), leftCell=(game.pathArray[left-1][top] || 999);
			var distance=(upCell<=rightCell && upCell<=downCell && upCell<=leftCell) ? upCell : ((rightCell<=upCell && rightCell<=downCell && rightCell<=leftCell) ? rightCell : ((downCell<=rightCell && downCell<=upCell && downCell<=leftCell) ? downCell : leftCell));
			var turn=(distance<15) ? Math.round(Math.random()*5)===1 : false;
			if (upCell<=rightCell && upCell<=downCell && upCell<=leftCell) {
				if (!turn) {
					this.move('up');
				}
				else {
					this.move('down');
				}
			}
			else if (rightCell<=upCell && rightCell<=downCell && rightCell<=leftCell) {
				if (!turn) {
					this.move('right');
				}
				else {
					this.move('left');
				}
			}
			else if (downCell<=rightCell && downCell<=upCell && downCell<=leftCell) {
				if (!turn) {
					this.move('down');
				}
				else {
					this.move('up');
				}
			}
			else {
				if (!turn) {
					this.move('left');
				}
				else {
					this.move('right');
				}
			}
		};
	},
	updateTankState: function () {
		var i;
		for (i=0; i<game.tanks.length; i++) {
			if (game.tanks[i].fireState!==0) {
				game.tanks[i].fireState--;
			}
		}
	},
	tanks: [
	],
	userTank: null,
	drawTank: function (tank) {
		var left=tank.left, top=tank.top, dir=tank.direction;
		if (tank.userTank) {
			get(left, top).semi();
		}
		else {
			get(left, top).on();
		}
		if (dir==='up') {
			get(left, top-1).on();
			get(left-1, top).on();
			get(left-1, top+1).on();
			get(left+1, top).on();
			get(left+1, top+1).on();
			get(left-1, top-1).off();
			get(left+1, top-1).off();
			get(left, top+1).off();
		}
		else if (dir==='right') {
			get(left+1, top).on();
			get(left, top-1).on();
			get(left-1, top-1).on();
			get(left, top+1).on();
			get(left-1, top+1).on();
			get(left+1, top-1).off();
			get(left+1, top+1).off();
			get(left-1, top).off();
		}
		else if (dir==='down') {
			get(left, top+1).on();
			get(left+1, top-1).on();
			get(left+1, top).on();
			get(left-1, top-1).on();
			get(left-1, top).on();
			get(left+1, top+1).off();
			get(left-1, top+1).off();
			get(left, top-1).off();
		}
		else if (dir==='left') {
			get(left-1, top).on();
			get(left, top+1).on();
			get(left+1, top+1).on();
			get(left, top-1).on();
			get(left+1, top-1).on();
			get(left-1, top+1).off();
			get(left-1, top-1).off();
			get(left+1, top).off();
		}
	},
	drawTanks: function () {
		var i;
		game.drawTank(game.userTank);
		for (i=0; i<game.tanks.length; i++) {
			game.drawTank(game.tanks[i]);
		}
	},
	projectiles: [
	],
	updateProjectilePositions: function () {
		var i, cur, next=[], next2=[], tank1, tank2, curTank;
		for (i=0; i<game.projectiles.length; i++) {
			cur=game.projectiles[i];
			next[0]=(cur[2]==='left') ? cur[0]-1 : cur[0];
			next[0]=(cur[2]==='right') ? cur[0]+1 : next[0];
			next[1]=(cur[2]==='up') ? cur[1]-1 : cur[1];
			next[1]=(cur[2]==='down') ? cur[1]+1 : next[1];
			next2[0]=(cur[2]==='left') ? cur[0]-2 : cur[0];
			next2[0]=(cur[2]==='right') ? cur[0]+2 : next2[0];
			next2[1]=(cur[2]==='up') ? cur[1]-2 : cur[1];
			next2[1]=(cur[2]==='down') ? cur[1]+2 : next2[1];
			tank1=game.getTankByCell(next[0], next[1]);
			tank2=game.getTankByCell(next2[0], next2[1]);
			curTank=game.getTankByCell(cur[0], cur[1]);
			if (curTank) {
				if (curTank===game.userTank) {
					game.lose();
				}
				else {
					game.tanks.remove(curTank);
					game.projectiles.remove(cur);
				}
			}
			else if (tank1) {
				if (tank1===game.userTank) {
					game.lose();
				}
				else {
					game.tanks.remove(tank1);
					game.projectiles.remove(cur);
				}
			}
			else if (tank2 && cur[3]) {
				if (tank2===game.userTank) {
					game.lose();
				}
				else {
					game.tanks.remove(tank2);
					game.projectiles.remove(cur);
				}
			}
			else {
				if (cur[3]) {
					if (!game.isEmptyCell(next[0], next[1]) || !game.isEmptyCell(next2[0], next2[1])) {
						game.projectiles.remove(cur);
					}
					else {
						if (cur[2]==='left') {
							cur[0]-=2;
						}
						if (cur[2]==='up') {
							cur[1]-=2;
						}
						if (cur[2]==='right') {
							cur[0]+=2;
						}
						if (cur[2]==='down') {
							cur[1]+=2;
						}
					}
				}
				else {
					if (!game.isEmptyCell(next[0], next[1])) {
						game.projectiles.remove(cur);
					}
					else {
						cur[0]=next[0];
						cur[1]=next[1];
					}
				}
			}
		}
		if (game.tanks.length===1 && game.tanks[0]===game.userTank) {
			game.win();
		}
	},
	drawProjectiles: function () {
		var i;
		for (i=0; i<game.projectiles.length; i++) {
			get(game.projectiles[i]).on();
		}
	},
	walls: [
	],
	drawWalls: function () {
		var i;
		for (i=0; i<game.walls.length; i++) {
			get(game.walls[i]).on();
		}
	},
	lose: function () {
		clearInterval(game.updateInterval);
		effects.negate(9);
		game.loseTimeout=setTimeout(function () {changeGame('Menu')}, 2500);
	},
	win: function () {
		var level;
		clearInterval(game.updateInterval);
		game.winTimeout=setTimeout(function () {
			if (game.level===game.levels.level3) {
				changeGame(tanks);
			}
			else {
				for (level in game.levels) {
					if (game.levels[level].no===game.level.no) {
						game.loadLevel(game.levels[level.replace(/\d/, game.level.no+1+'')]);
						break;
					}
				}
			}
		}, 1500);
	},
	levels: {
		level0: {
			walls: [],
			userTank: [6, 8, 'up'],
			tanks: [
				[1, 1, 'right'],
				[13, 23, 'left'],
				[1, 23, 'right'],
				[13, 1, 'left'],
			],
			speedFunction: function () {
				return 50;
			},
			no: 0
		},
		level1: {
			walls: [
				[4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10], [4, 11], [4, 12],
				[4, 13], [4, 14], [4, 15], [4, 16], [4, 17], [4, 18], [4, 19], [4, 20], [4, 21], [5, 5],
				[5, 13], [5, 21], [8, 9], [8, 17], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8],
				[9, 9], [9, 10], [9, 11], [9, 12], [9, 13], [9, 14], [9, 15], [9, 16]
			],
			userTank: [6, 8, 'up'],
			tanks: [
				[1, 1, 'right'],
				[11, 18, 'down']
			],
			speedFunction: function () {
				return 50;
			},
			no: 1
		},
		level2: {
			walls: [
				[3, 3], [3, 4], [3, 5], [3, 19], [3, 20], [3, 21], [4, 3], [4, 21], [5, 3], [5, 21],
				[9, 3], [9, 21], [10, 3], [10, 21], [11, 3], [11, 4], [11, 5], [11, 19], [11, 20], [11, 21]
			],
			userTank: [6, 12, 'up'],
			tanks: [
				[1, 1, 'down']
			],
			speedFunction: function () {
				return 50;
			},
			no: 2
		},
		level3: {
			walls: [
				[3, 3], [3, 4], [3, 5], [3, 9], [3, 10], [3, 14], [3, 15], [3, 19], [3, 20], [3, 21],
				[4, 3], [4, 21], [5, 3], [5, 21], [7, 11], [7, 12], [7, 13], [9, 3], [9, 21], [10, 3],
				[10, 21], [11, 3], [11, 4], [11, 5], [11, 9], [11, 10], [11, 14], [11, 15], [11, 16], [11, 19],
				[11, 20], [11, 21]
			],
			userTank: [5, 12, 'up'],
			tanks: [
				[13, 23, 'up']
			],
			speedFunction: function () {
				return 50;
			},
			no: 3
		}
	},
	unload: function () {
		clearInterval(game.updateInterval);
		clearTimeout(game.winTimeout);
		clearTimeout(game.loseTimeout);
		$k(window).off('brickLeft', game.addKey, false);
		$k(window).off('brickRight', game.addKey, false);
		$k(window).off('brickDown', game.addKey, false);
		$k(window).off('brickUp', game.addKey, false);
		$k(window).off('brickAction', game.addKey, false);
		$k(window).trigger('brickUnload');
	},
	loadScreen: [
		[5, 0], [5, 2], [5, 11], [5, 12], [6, 0], [6, 1], [6, 2], [6, 7], [6, 10], [7, 1],
		[7, 11], [7, 12], [10, 8], [11, 7], [11, 8], [11, 9], [12, 7], [12, 9]
	]
}, 'Tanks');
document.write('<table id="matrixDisplay"></table>');

menu=new Game({
	start: function () {
		var name, i=0;
		game.gamesArray=[];
		for (name in games) {
			if (name!=='Menu') {
				game.gamesArray[i++]=name;
			}
		}
		if (game.gameInGames(lastGame)) {
			game.changeScreenTo(game.gameInGames(lastGame));
		}
		else {
			game.changeScreenTo(0);
		}
		$k(window).on('brickLeft', game.changeScreen, false);
		$k(window).on('brickRight', game.changeScreen, false);
		$k(window).on('brickAction', game.enterGame, false);
	},
	enterGame: function () {
		changeGame(game.gamesArray[game.currentScreen]);
	},
	changeScreen: function (event) {
		if (event.type==='brickLeft') {
			game.changeScreenTo(game.prevScreen());
		}
		else if (event.type==='brickRight') {
			game.changeScreenTo(game.nextScreen());
		}
	},
	gameInGames: function (selGame) {
		var name;
		if (typeof game==='string') {
			if (games[selGame]) {
				return selGame;
			}
			else {
				return null;
			}
		}
		for (name in games) {
			if (games[name]===selGame) {
				return name;
			}
		}
		return null;
	},
	getPositionByName: function (name) {
		var i;
		for (i=0; i<game.gamesArray.length; i++) {
			if (game.gamesArray[i]===name) {
				return i;
			}
		}
	},
	currentScreen: null,
	nextScreen: function () {
		return (game.currentScreen===game.gamesArray.length-1) ? 0 : game.currentScreen+1;
	},
	prevScreen: function () {
		return (game.currentScreen===0) ? game.gamesArray.length-1 : game.currentScreen-1;
	},
	changeScreenTo: function (selGame) {
		var ls;
		if (typeof selGame==='number') {
			selGame=game.gamesArray[selGame];
		}
		ls=games[selGame].loadScreen;
		game.currentScreen=game.getPositionByName(selGame);
		effects.clear();
		for (i=0; i<ls.length; i++) {
			get(ls[i]).on();
		}
		for (i=0; i<game.defaultArrows.length; i++) {
			get(game.defaultArrows[i]).on();
		}
	},
	gamesArray: [],
	defaultArrows: [
		[0, 18], [0, 19], [0, 20], [0, 21], [0, 22], [0, 23], [0, 24], [1, 18], [1, 19], [1, 20],
		[1, 21], [1, 22], [1, 23], [1, 24], [2, 18], [2, 19], [2, 20], [2, 22], [2, 23], [2, 24],
		[3, 18], [3, 19], [3, 21], [3, 23], [3, 24], [4, 18], [4, 20], [4, 21], [4, 22], [4, 24],
		[5, 18], [5, 19], [5, 20], [5, 21], [5, 22], [5, 23], [5, 24], [6, 18], [6, 19], [6, 20],
		[6, 21], [6, 22], [6, 23], [6, 24], [7, 18], [7, 19], [7, 20], [7, 21], [7, 22], [7, 23],
		[7, 24], [8, 18], [8, 19], [8, 20], [8, 21], [8, 22], [8, 23], [8, 24], [9, 18], [9, 19],
		[9, 20], [9, 21], [9, 22], [9, 23], [9, 24], [10, 18], [10, 20], [10, 21], [10, 22], [10, 24],
		[11, 18], [11, 19], [11, 21], [11, 23], [11, 24], [12, 18], [12, 19], [12, 20], [12, 22], [12, 23],
		[12, 24], [13, 18], [13, 19], [13, 20], [13, 21], [13, 22], [13, 23], [13, 24], [14, 18], [14, 19],
		[14, 20], [14, 21], [14, 22], [14, 23], [14, 24]
	],
	unload: function () {
		$k(window).off('brickLeft', game.changeScreen, false);
		$k(window).off('brickRight', game.changeScreen, false);
		$k(window).off('brickAction', game.enterGame, false);
		$k(window).trigger('brickUnload');
	},
}, 'Menu');

changeGame('Menu');