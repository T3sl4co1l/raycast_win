const FILE_LOAD_IDS = {
	loadbutton: "fileload",
	loadbutton2: "urlload",
	fileinput: "filein",
	messagebox: "messagebox",
	options: {map: "filemap", json: "filejson"}
};
const VIEWPORT_ID = "viewport";
const MUTE_ID = "mute";

/** Square bounding box for the player's collision */
const PLAYER_SIZE = 0.3;
/** Height scaling of a ray */
const RAY_HEIGHT = 0.78;
/** Maximum iteration steps per ray cast */
const MAX_STEPS = 100;
/** Number of rays/columns to draw */
const RAYS_WIDE = 240;
/** Window and drawing dimensions */
const HEIGHT = 480;
const HALF_HEIGHT = (HEIGHT / 2);
const STRIP_WIDTH = 3;
const WIDTH = (RAYS_WIDE * STRIP_WIDTH);
/** Frame rate (1/gametic timer) */
const FRAME_RATE = 30;

/**
 *	Ray data to be drawn.
 *	COLOR_CEILING  \
 *	COLOR_FLOOR    | Colors to draw everything in
 *	COLOR_WALLS    /
 *	rayBuffer	Column heights
 *	colBuffer	Column color indices
 */
const COLOR_CEILING = "#aaaaaa";
const COLOR_FLOOR = "#555555";
const COLOR_WALLS = [
	"#000000", "#0000aa", "#00aa00", "#00aaaa",
	"#aa0000", "#aa00aa", "#aa5500", "#aaaaaa",
	"#555555", "#5555ff", "#55ff55", "#55ffff",
	"#ff5555", "#ff55ff", "#ff5555", "#ffffff"
];
var rayColumns = []; rayColumns[RAYS_WIDE - 1] = 0;
var rayColColors = []; rayColColors[RAYS_WIDE - 1] = 0;

/** World map and player state.  Properties:
 *  width (int), height (int), map (int array),
 *  playerX (float), playerY (float), world.playerA (float) */
var world;

var keyDown = {
	fwd: false, fwd2: false,
	rev: false, rev2: false,
	turnLeft: false, turnRight: false,
	strLeft: false, strRight: false
};
var moveFlag = true;
/** Mouse drag and movement parameters */
const MOUSE_DRAG_SCALE_X = 0.0046;
const MOUSE_DRAG_SCALE_Y = -0.02;
const MOUSE_DRAG_MAX_X = 0.3;
const MOUSE_DRAG_MAX_Y = 0.3;
const MOUSE_DRAG_MAXMAX_Y = 1.2;
var mouseDrag = {x: 0, y: 0, active: false};
var touchDrag = { list: [], activeId: undefined, initX: 0, initY: 0 };
/** Angle (in radians) turned per gametic */
const ANGLE_STEP = (Math.PI / 35);
/** Fraction of a grid square moved in one gametic */
const MOVE_STEP = 0.12;

var atx, volume = 0;

document.addEventListener("DOMContentLoaded", function() {
	var el = document.getElementById(VIEWPORT_ID);
	el.width = RAYS_WIDE * STRIP_WIDTH;
	el.height = HEIGHT;
	//	Enable touch
	el.addEventListener("touchstart", startTouch);
	el.addEventListener("touchend", endTouch);
	el.addEventListener("touchcancel", endTouch);
	el.addEventListener("touchmove", moveTouch);

	//	Enable mouse drag
	document.addEventListener("mousedown", startMouseDrag);
	document.addEventListener("mouseup", endMouseDrag);
	document.addEventListener("mousemove", doMouseDrag);

	//	File load stuff
	document.getElementById(FILE_LOAD_IDS.loadbutton).addEventListener("click", rayload, true);
	document.getElementById(FILE_LOAD_IDS.loadbutton2).addEventListener("click", () => urlload("level.map"), true);
	document.getElementById(MUTE_ID).checked = true;
	document.getElementById(MUTE_ID).addEventListener("click", audioToggle, true);
	document.addEventListener("keydown", function(e) {setKeyState(e, true)});
	document.addEventListener("keyup", function(e) {setKeyState(e, false)});

	setTimeout(doGameTic);
});

/**
 * Load and parse a file
 */
function rayload() {

	var f = document.getElementById(FILE_LOAD_IDS.fileinput).files;
	if (f.length != 1) {
		document.getElementById(FILE_LOAD_IDS.messagebox).innerHTML = "Select a single file.";
		return;
	}
	var fr = new FileReader();
	fr.onload = function () {

		var inp, err = "";
		if (document.getElementById(FILE_LOAD_IDS.options.json).checked) {

			try {
				inp = JSON.parse(this.result);
			} catch (e) {
				document.getElementById(FILE_LOAD_IDS.messagebox).innerHTML = "JSON " + e;
				return;
			}
			//	Verify input parameters; do headers in a group:
			const PARAM_CHECK = {
				width: {type: "number", check: Number.isInteger, min: 1, max: 255},
				height: {type: "number", check: Number.isInteger, min: 1, max: 255},
				playerX: {type: "number", check: (x) => {return !Number.isNaN(x)}, min: 0, max: 255},
				playerY: {type: "number", check: (x) => {return !Number.isNaN(x)}, min: 0, max: 255},
				playerA: {type: "number", check: (x) => {return !Number.isNaN(x)}, min: 0, max: 2 * Math.PI},
			};
			Object.keys(HEADER_PARAMS).forEach(key => {
				if (
					inp[key] === undefined
					|| typeof inp[key] !== PARAM_CHECK[key].type
					|| !PARAM_CHECK[key].check(inp[key])
					|| inp[key] < PARAM_CHECK[key].min
					|| inp[key] > PARAM_CHECK[key].max
				) {
					err += "Error: parameter " + key + " missing, not of type " + PARAM_CHECK[key].type + ", or not in range " + PARAM_CHECK[key].min + " to " + PARAM_CHECK[key].max + "<br>\n";
				}
			});
			//	Verify map separately, as it's a bit more detailed
			if (
				inp.map === undefined
				|| typeof inp.map !== "object"
				|| !Array.isArray(inp.map)
				|| inp.map.length < (inp.width * inp.height)
			) {
				err += "Error: " + key + " is not of type " + PARAM_CHECK[key].type + "in range " + PARAM_CHECK[key].min + " to " + PARAM_CHECK[key].max + "<br>\n";
			}
			for (var y = 0; y < inp.height; y++) {
				for (var x = 0; x < inp.width; x++) {
					if (
						inp.map[x + y * inp.width] === undefined
						|| typeof inp.map[x + y * inp.width] !== "number"
						|| inp.map[x + y * inp.width] < 0
						|| inp.map[x + y * inp.width] > 8
					) {
						err += "Error: map entry at (" + x + ", " + y + ") missing, not of type number, or not in range 0 to 9<br>\n";
						break;
					}
				}
			}

		} else if (document.getElementById(FILE_LOAD_IDS.options.map).checked) {

			[inp, err] = parseMapFile(fr.result);

		} else {	//	no option selected

			err = "Select a file type.";
			return;

		}

		document.getElementById(FILE_LOAD_IDS.messagebox).innerHTML = err;
		if (err > "") return;
		world = inp;

	}
	fr.readAsText(f[0]);

}

function urlload(u) {
	fetch(u).then(function(response) {
		if (!response.ok) {
			document.getElementById(FILE_LOAD_IDS.messagebox).innerHTML =
					"URL " + response.url + " error " + response.status + " " + response.statusText + ".<br>\n";
			return null;
		}
		return response.text();
	}).then((s) => {
		var inp, err = "";
		[inp, err] = parseMapFile(s);
		document.getElementById(FILE_LOAD_IDS.messagebox).innerHTML = err;
		if (err > "") return;
		world = inp;
	});
}

/**
 * Read in a map file from a string source.
 */
function parseMapFile(s) {

	var err = "", inp = {width: 0, height: 0, map: [], playerX: -1, playerY: -1, playerA: 0};

	//	Formatting and verification...
	var lines = s.split("\n");
	var table = [];
	lines.forEach(s => {
		s.trimStart();
		i1 = s.indexOf("#"); i2 = s.indexOf("//");
		//	If either comment type starts at the line, discard the line
		if (i1 != 0 && i2 != 0) {
			//	If midway, discard the string past that point.
			//	Ignore comment type if not found (-1).
			if (i1 < 0) i1 = Number.MAX_SAFE_INTEGER;
			if (i2 < 0) i2 = Number.MAX_SAFE_INTEGER;
			i1 = Math.min(i1, i2);
			table.push(s.substring(0, i1).split(' '));
		}
	});
	const HEADER_PARAMS = {
		width: {row: 0, col: 0, min: 1, max: 255},
		height: {row: 0, col: 1, min: 1, max: 255}
	};
	Object.keys(HEADER_PARAMS).forEach(key => {
		inp[key] = Number.parseInt(table[HEADER_PARAMS[key].row][HEADER_PARAMS[key].col]);
		if (inp[key] === undefined) {
			err += "Error: parameter " + key + " missing or invalid at line " + HEADER_PARAMS[key].row + ", token " + HEADER_PARAMS[key].col + "<br>\n";
		} else if (inp[key] < HEADER_PARAMS[key].min) {
			err += "Error: parameter " + key + " out of range: " + inp[key] + " < " + HEADER_PARAMS[key].min + " at line " + HEADER_PARAMS[key].row + ", token " + HEADER_PARAMS[key].col + "<br>\n";
		} else if (inp[key] > HEADER_PARAMS[key].max) {
			err += "Error: parameter " + key + " out of range: " + inp[key] + " > " + HEADER_PARAMS[key].max + " at line " + HEADER_PARAMS[key].row + ", token " + HEADER_PARAMS[key].col + "<br>\n";
		}
	});
	for (var y = 0; y < inp.height; y++) {
		for (var x = 0; x < inp.width; x++) {
			inp.map[x + y * inp.width] = Number.parseInt(table[y + 1][x]);
			if (inp.map[x + y * inp.width] === undefined) {
				err += "Error: missing or invalid map data at line " + (y + 1) + ", token " + x + "<br>\n";
			} else if (inp.map[x + y * inp.width] < 0) {
				err += "Error: map data < 0 at line " + (y + 1) + ", token " + x + "<br>\n";
			} else if (inp.map[x + y * inp.width] == 9) {
				//	One 9 is OK: set player start here. Subsequent 9s are a fail, however
				if (inp.playerX > 0) {
					err += "Error: extra player start at line " + (y + 1) + ", token " + x + "<br>\n";
				} else {
					inp.playerX = x + 0.5; inp.playerY = y + 0.5;
					inp.map[x + y * inp.width] = 0;
				}
			} else if (inp.map[x + y * inp.width] > 9) {
				err += "Error: map data > 9 at line " + (y + 1) + ", token " + x + "<br>\n";
			}
		}
	}
	if (inp.playerX < 0)
		err += "Error: no player start found<br>\n";

	return [inp, err];
}

/**
 *	Draws graphical output to the canvas.
 */
function repaint() {

	var ctx = document.getElementById(VIEWPORT_ID).getContext("2d");
	var xg = 0;
	for (var x = 0; x < RAYS_WIDE; x++) {
		ctx.fillStyle = COLOR_CEILING;
		ctx.fillRect(xg, 0, STRIP_WIDTH, HALF_HEIGHT - rayColumns[x]);
		ctx.fillStyle = COLOR_WALLS[rayColColors[x]];
		ctx.fillRect(xg, HALF_HEIGHT - rayColumns[x],
						STRIP_WIDTH, rayColumns[x] * 2);
		ctx.fillStyle = COLOR_FLOOR;
		ctx.fillRect(xg, HALF_HEIGHT + rayColumns[x], STRIP_WIDTH, HEIGHT);
		xg += STRIP_WIDTH;
	}

}

function audioToggle(e) {
	if (atx === undefined)
		atx = new AudioContext();

	if (this.checked)
		volume = 0;
	else
		volume = 0.06;
}

/**
 *  Emits a beep sound
 */
function beep() {
	if (atx === undefined) return;
	
	var osc = atx.createOscillator();
	var g = atx.createGain();
	osc.connect(g);
	g.connect(atx.destination);
	g.gain.value = volume;
	osc.frequency.value = 520;
	osc.type = "square";
	osc.start(atx.currentTime);
	osc.stop(atx.currentTime + 0.04);
}

/**
 *	Convert key up/down events into key pressed states.
 *	@param e KeyboardEvent to process
 *	@param p boolean flag, true for keydown event, false for keyup event
 */
function setKeyState(e, p) {
	p = !!p;
	var f = false;
	if (e.key == "ArrowUp") {
		keyDown.fwd = p; f = true;
	} else if (e.key == "W" || e.key == "w") {
		keyDown.fwd2 = p; f = true;
	} else if (e.key == "ArrowDown") {
		keyDown.rev = p; f = true;
	} else if (e.key == "S" || e.key == "s") {
		keyDown.rev2 = p; f = true;
	} else if (e.key == "ArrowLeft") {
		keyDown.turnLeft = p; f = true;
	} else if (e.key == "ArrowRight") {
		keyDown.turnRight = p; f = true;
	} else if (e.key == "A" || e.key == "a") {
		keyDown.strLeft = p; f = true;
	} else if (e.key == "D" || e.key == "d") {
		keyDown.strRight = p; f = true;
	}
	if (f) e.preventDefault();
}

/**
 *	Begins a mouse left-drag operation when "this" is the canvas
 */
function startMouseDrag(e) {
	if (e.target.id == VIEWPORT_ID && e.buttons & 1) {
		mouseDrag.active = true;
		mouseDrag.x = 0; mouseDrag.y = 0;
		e.preventDefault();
	}
}

/**
 *	Ends the mouse left-drag operation
 */
function endMouseDrag(e) {
	if (mouseDrag.active) {
		mouseDrag.active = false;
		e.preventDefault();
	}
}

/**
 *	Handles mousemove events dragging on the canvas
 */
function doMouseDrag(e) {
	if (mouseDrag.active) {
		mouseDrag.x += e.movementX * MOUSE_DRAG_SCALE_X;
		mouseDrag.y += e.movementY * MOUSE_DRAG_SCALE_Y;
	}
}

function startTouch(e) {
	//	Only track the first / singular touch, ignore others
	for (var i = 0; i < e.changedTouches.length; i++) {
		touchDrag.list.push(e.changedTouches[i].identifier);
	}
	if (e.changedTouches.length == 1 && touchDrag.list.length == 1 && e.changedTouches[0].target.id == VIEWPORT_ID) {
		touchDrag.activeId = e.changedTouches[0].identifier;
		touchDrag.initX = e.changedTouches[0].pageX;
		touchDrag.initY = e.changedTouches[0].pageY;
	}
}

function endTouch(e) {
	for (var i = 0; i < e.changedTouches.length; i++) {
		for (var j = 0; j < touchDrag.list.length; j++) {
			if (touchDrag.list[j] == e.changedTouches[i].identifier) {
				touchDrag.list.splice(j, 1);
				break;
			}
		}
		if (e.changedTouches[i].identifier == touchDrag.activeId) {
			touchDrag.activeId = undefined;
		}
	}
}

function moveTouch(e) {
	if (touchDrag.activeId !== undefined) {
		for (var i = 0; i < e.changedTouches.length; i++) {
			if (e.changedTouches[i].identifier == touchDrag.activeId) {
				mouseDrag.x += (e.changedTouches[i].pageX - touchDrag.initX) * MOUSE_DRAG_SCALE_X;
				mouseDrag.y += (e.changedTouches[i].pageY - touchDrag.initY) * MOUSE_DRAG_SCALE_Y;
				touchDrag.initX = e.changedTouches[i].pageX;
				touchDrag.initY = e.changedTouches[i].pageY;
				if (e.cancelable)
					e.preventDefault();	//	because I guess there's no way to cancel a scroll/zoom gesture in Chrome??
				break;
			}
		}
	}
}

/**
 *	Processes inputs and updates game state.
 *	Triggered by system timer.
 */
function doGameTic() {

	var moveX = 0, moveY = 0;

	setTimeout(doGameTic, 1000 / FRAME_RATE);

	//	More sanity checking may be worthwhile, but just a basic null
	//	reference check to handle unloaded world at least
	//	--> handle sanity checking in file load
	if (world === undefined) return;

	if (keyDown.fwd || keyDown.fwd2) {
		moveX += MOVE_STEP * Math.cos(world.playerA);
		moveY += MOVE_STEP * Math.sin(world.playerA);
		moveFlag = true;
	}
	if (keyDown.rev || keyDown.rev2) {
		moveX += -MOVE_STEP * Math.cos(world.playerA);
		moveY += -MOVE_STEP * Math.sin(world.playerA);
		moveFlag = true;
	}
	if (keyDown.turnLeft) {
		world.playerA -= ANGLE_STEP;
		moveFlag = true;
	}
	if (keyDown.turnRight) {
		world.playerA += ANGLE_STEP;
		moveFlag = true;
	}
	if (keyDown.strLeft) {
		moveX += MOVE_STEP * Math.sin(world.playerA);
		moveY += -MOVE_STEP * Math.cos(world.playerA);
		moveFlag = true;
	}
	if (keyDown.strRight) {
		moveX += -MOVE_STEP * Math.sin(world.playerA);
		moveY += MOVE_STEP * Math.cos(world.playerA);
		moveFlag = true;
	}

	if (mouseDrag.x != 0 || mouseDrag.y != 0) {
		mouseDrag.y = Math.max(Math.min(mouseDrag.y, MOUSE_DRAG_MAXMAX_Y), -MOUSE_DRAG_MAXMAX_Y);
		var mx = Math.max(Math.min(mouseDrag.x, MOUSE_DRAG_MAX_X), -MOUSE_DRAG_MAX_X);
		var my = Math.max(Math.min(mouseDrag.y, MOUSE_DRAG_MAX_Y), -MOUSE_DRAG_MAX_Y);
		moveX += my * Math.cos(world.playerA);
		moveY += my * Math.sin(world.playerA);
		world.playerA += mx;
		mouseDrag.x -= mx; mouseDrag.y -= my;
		moveFlag = true;
	}

	if (world.playerA < 0) world.playerA += 2 * Math.PI;
	if (world.playerA > 2 * Math.PI) world.playerA -= 2 * Math.PI;
	if (moveFlag) {
		collisionDetect(moveX, moveY);
		render();
		repaint();
		moveFlag = false;
	}

}

/**
 * Checks if the specified move is allowable.  Automatically updates
 * playerX, playerY.  Note: variables passed in by reference may be
 * changed (a collision zeroes moveX and/or moveY).
 * @param moveX Movement in X direction
 * @param moveY Movement in Y direction
 * @return true if there was a collision
 */
function collisionDetect(moveX, moveY) {

	var checkX = [0, 0, 0, 0], checkY = [0, 0, 0, 0];
	var pointNum = [0, 0, 0, 0];
	var changedX = world.playerX + moveX, changedY = world.playerY + moveY;
	var blockX, blockY, corners = 0;

	//	Check if the move is even on the map
	if (changedX < 1 || changedY < 1 || changedX >= (world.width - 1)
			|| changedY >= (world.height - 1))
		//	Out of bounds?  Hit the edge, don't move
		return true;
	//	Check for map collisions
	//	Lower right corner of player
	checkX[0] = changedX + PLAYER_SIZE; checkY[0] = changedY + PLAYER_SIZE;
	//	lower left
	checkX[1] = changedX - PLAYER_SIZE; checkY[1] = changedY + PLAYER_SIZE;
	//	upper left
	checkX[2] = changedX - PLAYER_SIZE; checkY[2] = changedY - PLAYER_SIZE;
	//	upper right
	checkX[3] = changedX + PLAYER_SIZE; checkY[3] = changedY - PLAYER_SIZE;
	for (var i = 0; i < 4; i++) {
		//	corners counts the number of points that are faulty:
		//	0 = nothing, 1 = an outside corner, 2 = one side (or a
		//	diagonal pinch), 3 = inside corner, 4 = trapped.
		if (world.map[Math.floor(checkX[i]) + Math.floor(checkY[i]) * world.width] > 0) {
			pointNum[corners] = i;
			corners++;
		}
	}
	var index;
	switch (corners) {
	case 0:
		//	No collisions, make the move
		world.playerX += moveX; world.playerY += moveY;
		return false;
	case 1:
		//	1 collision: an outside wall corner at pointNum[0].
		blockX = Math.floor(checkX[pointNum[0]]);
		blockY = Math.floor(checkY[pointNum[0]]);
		switch (pointNum[0]) {
		case 0:
			//	Lower right corner of player is stuck
			if (changedY > (blockY + changedX - blockX)) {
				if (moveX > 0) moveX = 0;
			} else {
				if (moveY > 0) moveY = 0;
			}
			break;
		case 1:
			//	Lower left
			blockX++;
			if (changedY > (blockY - changedX + blockX)) {
				if (moveX < 0) moveX = 0;
			} else {
				if (moveY > 0) moveY = 0;
			}
			break;
		case 2:
			//	Upper left
			blockY++; blockX++;
			if (changedY > (blockY + changedX - blockX)) {
				if (moveY < 0) moveY = 0;
			} else {
				if (moveX < 0) moveX = 0;
			}
			break;
		case 3:
			//	Upper right
			blockY++;
			if (changedY > (blockY - changedX + blockX)) {
				if (moveY < 0) moveY = 0;
			} else {
				if (moveX > 0) moveX = 0;
			}
			break;
		default:
			break;
		}
		break;
	case 2:
		//	Wall hit.
		index = pointNum[0] + pointNum[1] * 4;
		switch (index) {
		case 4:
			//	Bottom of player (0, 1)
			if (moveY > 0) moveY = 0;
			break;
		case 9:
			//	Left (1, 2)
			if (moveX < 0) moveX = 0;
			break;
		case 14:
			//	Top (2, 3)
			if (moveY < 0) moveY = 0;
			break;
		case 12:
			//	Right (3, 0)
			if (moveX > 0) moveX = 0;
			break;
		case 8:
		case 13:
			//	Diagonal corners (partial inside corners (0, 2), (1, 3))
			moveX = 0; moveY = 0;
			break;
		default:
			break;
		}
		break;
	case 3:
		//	Inside corner: one free.  Allow motion in that direction.
		index = pointNum[0] + pointNum[1] * 4 + pointNum[2] * 16;
		switch (index) {
		case 57:
			//	Bottom right open (stuck points 1, 2, 3)
			if (moveX < 0) moveX = 0;
			if (moveY < 0) moveY = 0;
			break;
		case 56:
			//	Bottom left (0, 2, 3)
			if (moveX > 0) moveX = 0;
			if (moveY < 0) moveY = 0;
			break;
		case 52:
			//	Top left (0, 1, 3)
			if (moveX > 0) moveX = 0;
			if (moveY > 0) moveY = 0;
			break;
		case 36:
			//	Top right (0, 1, 2)
			if (moveX < 0) moveX = 0;
			if (moveY > 0) moveY = 0;
			break;
		default:
			break;
		}
		break;
	default:
		//	Stuck in a block?!
		break;
	}
	world.playerX += moveX; world.playerY += moveY;
	//	Hit something
	beep();
	return true;
}

/**
 * Transforms current information (world) into color and height in the RayGraphics fields.
 */
function render() {

	var slopeX, slopeY, ray;
	var col = []; col[RAYS_WIDE - 1] = 0;
	var rays = []; rays[RAYS_WIDE - 1] = 0;
	
	for (var x = 0; x < RAYS_WIDE; x++) {
		slopeY = 2 * (x - RAYS_WIDE / 2) / RAYS_WIDE;
		slopeX = Math.cos(world.playerA) - slopeY * Math.sin(world.playerA);
		slopeY = Math.sin(world.playerA) + slopeY * Math.cos(world.playerA);
		ray = rayCast(world.playerX, world.playerY, slopeX, slopeY);
		if (ray.wallHoriz) {
			ray.colr += 8;
		}
		col[x] = ray.colr;
		//	Perspective projection
		rays[x] = Math.floor(HALF_HEIGHT * RAY_HEIGHT / ray.travel);
	}
	//	Copy the data to RayGraphics and draw it
	rayColumns = rays; rayColColors = col;
	repaint();

}

/**
 *	Cast a ray across the map
 */
function rayCast(posX, posY, slopeX, slopeY) {

	var blockX = Math.floor(posX), blockY = Math.floor(posY);
	var dirX, dirY, i;
	var ray = { travel: 0, colr: 0, wallHoriz: false };

	//	Normalization (radar projection)
	//var magnitude = Math.sqrt(slopeX * slopeX + slopeY * slopeY);
	//	No correction (perspective projection)
	var magnitude = 1;
	//	Amount traveled to the next axis intersection
	var travelX = magnitude / Math.abs(slopeX);
	var travelY = magnitude / Math.abs(slopeY);
	//	Distance to the first intersection (and each thereafter)
	var tIntV, tIntH;
	if (slopeX > 0) {
		dirX = 1;
		tIntV = (1 - posX + blockX) * travelX;
	} else {
		dirX = -1;
		tIntV = (posX - blockX) * travelX;
	}
	if (slopeY > 0) {
		dirY = 1;
		tIntH = (1 - posY + blockY) * travelY;
	} else {
		dirY = -1;
		tIntH = (posY - blockY) * travelY;
	}
	i = 0;
	do {
		if (tIntH < tIntV) {
			ray.travel = tIntH;
			blockY += dirY;
			tIntH += travelY;
			ray.wallHoriz = true;
		} else {
			ray.travel = tIntV;
			blockX += dirX;
			tIntV += travelX;
			ray.wallHoriz = false;
		}
		i++;
		if (blockX < 0 || blockY < 0 || blockX >= world.width || blockY >= world.height) {
			//	Out of bounds?
			break;
		}
		ray.colr = world.map[blockX + blockY * world.width];
	} while (i < MAX_STEPS && ray.colr == 0);

	return ray;
}
