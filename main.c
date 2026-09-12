#include "main_c.h"
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <tchar.h>
#include <gdiplus/gdiplus.h>
#include "gdi_colors.h"

/** Angle (in radians) turned per gametic */
#define IDT_FRAMETIC	0x00aa
/** Frame rate (1/gametic timer) */
#define FRAME_RATE		60
/** Angle (in radians) turned per gametic */
#define ANGLE_STEP		(M_PI / 52.0f)
/** Fraction of a grid square moved in one gametic */
#define MOVE_STEP		0.08f
/** Square bounding box for the player's collision */
#define PLAYER_SIZE		0.4f
/** Height scaling of a ray */
#define RAY_HEIGHT		0.6f

/** Number of rays/columns to draw */
#define RAYS_WIDE		240
/** Window and drawing dimensions */
#define HEIGHT			640
#define HALF_HEIGHT		(HEIGHT / 2)
#define STRIP_WIDTH		3
#define WIDTH			(RAYS_WIDE * STRIP_WIDTH)

/** Class name */
TCHAR szClassName[] = _T("RaycastClass");
/**	GDI+ token for unloading */
ULONG_PTR gdiplusToken;
/**	Timer handle / reference number */
ULONG_PTR hTimer;
/**	Keyboard input */
bool keyDown[KEYCMD_MAXKEY + 1];
/**
 *	Ray data to be drawn.
 *	ceiling		\
 *	floor		 | Colors to draw everything in
 *	walls		/
 *	rayBuffer	Column heights
 *	colBuffer	Column color indices
 */
ARGB rayCeiling = Color_LightGray;
ARGB rayFloor = Color_DarkGray;
ARGB rayWalls[] = {
	Color_Black,
	Color_DarkBlue,
	Color_DarkGreen,
	Color_DarkCyan,
	Color_DarkRed,
	Color_Purple,
	Color_Brown,
	Color_LightGray,
	Color_DarkGray,
	Color_LightBlue,
	Color_LightGreen,
	Color_Cyan,
	Color_Salmon,
	Color_Magenta,
	Color_Yellow,
	Color_White
};

/** Display data */
int rayColumns[RAYS_WIDE];
int rayColColors[RAYS_WIDE];

/**
 *	World data:
 *	Width and Height are the column and row count of the map array.
 *	worldMap is allocated on the heap (see loadMap).
 */
int worldWidth, worldHeight, *worldMap = NULL;

/**
 *	Player coordinates: X, Y (with respect to
 *	World coordinates), and angle (radians).
 */
float playerX = 0.0f;
float playerY = 0.0f;
float playerA = 0.0f;

/** Handle for main window */
HWND hMainWindow;

/**
 *	Main Entry Point
 */
int WINAPI WinMain(HINSTANCE hThisInstance, HINSTANCE hPrevInstance, LPSTR lpszArgument, int nCmdShow) {
	MSG msgs;
	WNDCLASSEX wincl;
	GdiplusStartupInput gdiSI = { GdiplusVersion: 1 };
	int err;

	/* * *  Initialization and loading  * * */

	printf("Raycast: flat shaded, grid-based raycaster\nBy Tim Williams, " __DATE__ "\n");
	if (!strlen(lpszArgument)) {
		printf("\nUsage: RAYCAST <mapname>\n");
		return 0;
	}
	printf("Loading map \"%s\"...\n", lpszArgument);
	if ((err = loadMap(lpszArgument))) {
		if (err == -1) {
			printf("File not found.\n");
		} else if (err == -2) {
			printf("Windows error: 0x%lx\n", GetLastError());
		} else if (err == -3) {
			printf("Player start not found.\n");
		} else {
			printf("Failed at character: %i\n", err);
		}
		return 1;
	}

	/* * *  Deal with all the Windows crap  * * */

	if ((err = GdiplusStartup(&gdiplusToken, &gdiSI, NULL))) {
		printf("Error opening GDI+, status: 0x%x\n", err);
		return 2;
	}

	//	set up window class...
	wincl = (WNDCLASSEX){
		cbSize: sizeof(WNDCLASSEX),
		style: CS_DBLCLKS, 	//	Catch double-clicks
		lpfnWndProc: WindowProc,
		cbClsExtra: 0,     	//	No extra bytes after the window class structure,
		cbWndExtra: 0,     	//	or the window instance
		hbrBackground: (HBRUSH)COLOR_BACKGROUND,
		lpszMenuName: NULL,	//	No menu
		lpszClassName: szClassName
	};
	wincl.hInstance = hThisInstance;
	//	Use default icon and mouse cursor
	wincl.hIcon = LoadIcon(NULL, IDI_APPLICATION);
	wincl.hCursor = LoadCursor(NULL, IDC_ARROW);
	wincl.hIconSm = LoadIcon(NULL, IDI_APPLICATION);

	//	Register window class, and if it fails, quit out
	ATOM aClass;
	if (!(aClass = RegisterClassEx(&wincl))) {
		printf("RegisterClassEx failed with error 0x%lx.\n", GetLastError());
		return 3;
	}
	//	Class is registered, create window...
	hMainWindow = CreateWindowEx(
			0,            	//	Extended possibilites for variation
			MAKEINTATOM(aClass),	//	Class atom
			_T("Raycast"),	//	Title text
			(WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX),	//	window style
			CW_USEDEFAULT,	//	Windows decides position where..
			CW_USEDEFAULT,	//	..the window ends up on the screen
			WIDTH,        	//	Window's width..
			HEIGHT,       	//	..and height in px
			HWND_DESKTOP, 	//	Is child to desktop
			NULL,         	//	No menu
			hThisInstance,	//	Application instance
			NULL          	//	No window creation data
			);
	if (!hMainWindow) {
		printf("CreateWindowEx failed with error 0x%lx.\n", GetLastError());
		return 3;
	}

	hTimer = SetTimer(hMainWindow, IDT_FRAMETIC, 1000 / FRAME_RATE, NULL);
	if (!hTimer) {
		printf("SetTimer failed with error 0x%lx.\n", GetLastError());
		return 4;
	}

	render();

	//	Make the window visible on the screen
	ShowWindow(hMainWindow, nCmdShow);

	/* Run the message loop. It will run until GetMessage() returns 0 */
	while (GetMessage(&msgs, NULL, 0, 0)) {
		//	Translate virtual-key messages into character messages
		TranslateMessage(&msgs);
		//	Send message to WindowProc
		DispatchMessage(&msgs);
	}

	return 0;
}

/**
 *	Message dispatch handler
 */
LRESULT CALLBACK WindowProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
	static volatile bool inGameTic = 0;

	switch(msg) {
	case WM_TIMER:
		if ((ULONG_PTR)wParam == hTimer) {
			//	Handle timer tic
			if (!inGameTic) {
				inGameTic = true;
				doGameTic();
				inGameTic = false;
			}
		}
		break;
	case WM_KEYUP:
		setKeyState((int)wParam, false);
		break;
	case WM_KEYDOWN:
		if (~lParam & (1 << 30)) {
			setKeyState((int)wParam, true);
		}
		break;
	case WM_ACTIVATE:
	case WM_PAINT:
		OnPaint();
		break;
	case WM_DESTROY:
		KillTimer(hwnd, hTimer);
		GdiplusShutdown(gdiplusToken);
		PostQuitMessage(0);
		break;
	default:
		return DefWindowProc(hwnd, msg, wParam, lParam);
	}

	return 0;
}

/**
 *	Draws graphical output to the window.
 */
BOOL OnPaint(void) {
	int x;
	HDC hdc;
	PAINTSTRUCT ps;
	GpGraphics *g;
	GpSolidFill *c, *f, *w;

	if (!(hdc = BeginPaint(hMainWindow, &ps))) {
		EndPaint(hMainWindow, &ps);
		return false;
	}

	int st;
	st = GdipCreateFromHDC(hdc, &g);
	st = GdipCreateSolidFill(rayCeiling, &c);
	st = GdipCreateSolidFill(rayFloor, &f);
	st = GdipCreateSolidFill(rayCeiling, &w);
	(void)st;

	for (x = 0; x < RAYS_WIDE; x++) {
		st = GdipSetSolidFillColor(w, rayWalls[rayColColors[x]]);
		st = GdipFillRectangleI(g, c, x * STRIP_WIDTH, 0, STRIP_WIDTH, HALF_HEIGHT - rayColumns[x]);
		st = GdipFillRectangleI(g, w, x * STRIP_WIDTH, HALF_HEIGHT - rayColumns[x],
						STRIP_WIDTH, rayColumns[x] * 2);
		st = GdipFillRectangleI(g, f, x * STRIP_WIDTH, HALF_HEIGHT + rayColumns[x], STRIP_WIDTH, HEIGHT);
	}
	st = GdipDeleteGraphics(g);
	EndPaint(hMainWindow, &ps);

	return true;
}

/**
 *	Processes inputs and updates game state.
 *	Triggered by system timer.
 */
void doGameTic(void) {

	float moveX = 0, moveY = 0;
	float angsin, angcos;
	//sincosf(playerA, &angsin, &angcos);
	angsin = sinf(playerA); angcos = cosf(playerA);
	bool moveFlag = false;

	if (keyDown[0]) {
		moveX = MOVE_STEP * angcos;
		moveY = MOVE_STEP * angsin;
		moveFlag = true;
	}
	if (keyDown[1]) {
		moveX = -MOVE_STEP * angcos;
		moveY = -MOVE_STEP * angsin;
		moveFlag = true;
	}
	if (keyDown[2]) {
		playerA -= ANGLE_STEP;
		moveFlag = true;	}
	if (keyDown[3]) {
		playerA += ANGLE_STEP;
		moveFlag = true;
	}
	if (keyDown[4]) {
		moveX = MOVE_STEP * angsin;
		moveY = -MOVE_STEP * angcos;
		moveFlag = true;
	}
	if (keyDown[5]) {
		moveX = -MOVE_STEP * angsin;
		moveY = MOVE_STEP * angcos;
		moveFlag = true;
	}
	if (playerA < 0) playerA += 2 * M_PI;
	if (playerA > 2 * M_PI) playerA -= 2 * M_PI;
	if (moveFlag) {
		collisionDetect(moveX, moveY);
		render();
	}

}

/**
 *	Convert virtual key message into key pressed states.
 */
void setKeyState(int key, bool pressed) {
	int k;

	switch (key) {
	case VK_UP:
	case 'W':
		k = KEYCMD_FWD;
		break;
	case VK_DOWN:
	case 'S':
		k = KEYCMD_REV;
		break;
	case VK_LEFT:
		k = KEYCMD_TURNLEFT;
		break;
	case VK_RIGHT:
		k = KEYCMD_TURNRIGHT;
		break;	case 'A':
		k = KEYCMD_STRAFELEFT;
		break;
	case 'D':
		k = KEYCMD_STRAFERIGHT;
		break;
	case VK_ESCAPE:
		k = KEYCMD_EXIT;
		SendMessage(hMainWindow, WM_DESTROY, 0, 0);
		break;
	default:
		return;
	}
	keyDown[k] = pressed;

}

/**
 *	Loads map data from the specified filename.
 *	worldMap will be allocated on the heap, and freed first
 *	if non-NULL.
 *	@param f  String; filename, zero terminated
 *	@return 0: success<br>
 *	 positive: file offset at which an error occurred<br>
 *	 negative: error:<br>
 *	               -1: Failed to open file<br>
 *	               -2: Windows error; check GetLastError()<br>
 *	               -3: No player start location
 */
int loadMap(const char* f) {
	int err = 0, scanlen, tokens, x, y, col;
	HANDLE hFile = INVALID_HANDLE_VALUE;
	DWORD bytesRead;
	LARGE_INTEGER fLen;
	char* mapbuf = NULL;

	//	Memory-map file (could also use mmap as such)
	hFile = CreateFileA(
			f, GENERIC_READ, FILE_SHARE_READ, NULL,
			OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
	if (hFile == INVALID_HANDLE_VALUE) {
		err = -1;
		goto loadFileError;
	}
	if (!GetFileSizeEx(hFile, &fLen)) {
		err = -1;
		goto loadFileError;
	}
	if (fLen.QuadPart < 5) {	//	negative would be weird; also exclude non-minimum-size files
		err = -1;
		goto loadFileError;
	}	fLen.QuadPart++;
	if (fLen.HighPart > 0) {
		err = -1;
		goto loadFileError;
	}	mapbuf = HeapAlloc(GetProcessHeap(), 0, fLen.QuadPart);
	if (mapbuf == NULL) {
		err = -2;
		goto loadFileError;
	}	fLen.QuadPart--;
	ReadFile(hFile, mapbuf, fLen.LowPart, &bytesRead, NULL);
	if (bytesRead != fLen.LowPart) {
		err = -2;
		goto loadFileError;
	}	mapbuf[fLen.QuadPart] = 0;	//	ensure very last entry is zero-terminated
	CloseHandle(hFile);

	/*	parse mapbuf:
	 *	- Line breaks are any '\n'
	 *	- Tokens are any numeric digits, separated by white space
	 *	- From file start, 0 or more lines starting with "//" are comments; skip over them
	 *	- First (non-comment) line: two tokens (width, height)
	 *	- Subsequent lines: (width) tokens per line, for (row) lines (expected; but lines
	 *	  aren't special, any whitespace suffices for delimiting and tokens are positional)
	 *	- Additional lines/tokens after array: ignored
	 */
	size_t cursor = 0;
	while (cursor < fLen.QuadPart - 1  && mapbuf[cursor] == '/' && mapbuf[cursor + 1] == '/') {
		//	advance whole lines until heading comments clear
		cursor = (size_t)memchr(&mapbuf[cursor], '\n', fLen.QuadPart - cursor);
		if (cursor == (size_t)NULL)
			break;
		cursor = cursor - (size_t)mapbuf + 1;
		if (cursor >= (size_t)fLen.QuadPart) {
			err = cursor;
			goto loadFileError;
		}	}
	if (cursor >= (size_t)fLen.QuadPart) {
		err = cursor;
		goto loadFileError;
	}	//	capture tokens

	tokens = sscanf(&mapbuf[cursor], "%d %d%n", &worldWidth, &worldHeight, &scanlen); cursor += scanlen;
	if (tokens < 2 || cursor >= (size_t)fLen.QuadPart) {
		err = cursor;
		goto loadFileError;
	}
	printf("Map size: %i x %i\n", worldWidth, worldHeight);

	//	Allocate the map, and read in data
	if (worldMap != NULL) {
		//	we've probably been here before; realloc
		HeapFree(GetProcessHeap(), 0, worldMap);
	}
	worldMap = HeapAlloc(GetProcessHeap(), 0, worldWidth * worldHeight * sizeof(*worldMap));
	if (worldMap == NULL) {
		err = -2;
		goto loadFileError;
	}

	playerX = -1.0f; playerY = -1.0f; playerA = 0.0f;
	for (y = 0; y < worldHeight; y++) {
		for (x = 0; x < worldWidth; x++) {
			tokens = sscanf(&mapbuf[cursor], " %d%n", &col, &scanlen); cursor += scanlen;
			if (tokens < 1 || cursor >= (size_t)fLen.QuadPart) {
				err = cursor;
				goto loadFileError;
			}
			if (col < 0 || col > 9) {
				printf("Ignoring invalid map value at %I64d\n", cursor);
				col = 0;
			}
			if (col == 9) {
				if (playerX >= 0.0f) {
					printf("Ignoring extra player start at %I64d\n", cursor);
					col = 0;
				} else {
					playerX = x + 0.5f; playerY = y + 0.5f;
					printf("Player at location: %i, %i\n", x, y);
					col = 0;
				}
			}
			worldMap[x + y * worldWidth] = col;
		}
	}
	if (playerX < 0.0f || playerY < 0.0f) {
		err = -3;
		goto loadFileError;
	}

	err = 0;

loadFileError:
	if (hFile != INVALID_HANDLE_VALUE)
		CloseHandle(hFile);
	if (mapbuf != NULL)
		HeapFree(GetProcessHeap(), 0, mapbuf);
	if (err != 0 && worldMap != NULL)
		HeapFree(GetProcessHeap(), 0, worldMap);
	return err;
}

/**
 * Checks if the specified move is allowable.  Automatically updates
 * playerX, playerY.  Note: variables passed in by reference may be
 * changed (a collision zeroes moveX and/or moveY).
 * @param moveX Movement in X direction
 * @param moveY Movement in Y direction
 * @return true if there was a collision
 */
bool collisionDetect(float moveX, float moveY) {

	float checkX[4], checkY[4];
	int pointNum[4];
	float changedX = playerX + moveX, changedY = playerY + moveY;
	int blockX, blockY;
	int corners = 0;

	//	Check if the move is even on the map
	if (changedX < 1 || changedY < 1 || changedX >= (worldWidth - 1)
			|| changedY >= (worldHeight - 1))
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
	for (int i = 0; i < 4; i++) {
		//	corners counts the number of points that are faulty:
		//	0 = nothing, 1 = an outside corner, 2 = one side (or a
		//	diagonal pinch), 3 = inside corner, 4 = trapped.
		if (worldMap[((int)checkX[i]) + ((int)checkY[i]) * worldWidth] > 0) {
			pointNum[corners] = i;
			corners++;
		}
	}
	int index;
	switch (corners) {
	case 0:
		//	No collisions, make the move
		playerX += moveX; playerY += moveY;
		return false;
	case 1:
		//	1 collision: an outside wall corner at pointNum[0].
		blockX = (int)checkX[pointNum[0]];
		blockY = (int)checkY[pointNum[0]];
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
	playerX += moveX; playerY += moveY;
	//	Hit something
	MessageBeep(MB_ICONEXCLAMATION);
	return true;
}

/**
 * Transforms current information (worldMap, playerX, playerY, playerA)
 * into color and height in the RayGraphics fields.
 */
void render(void) {
	float slopeX, slopeY;
	float angsin, angcos;
	RayType_t ray;
	int rays[RAYS_WIDE], col[RAYS_WIDE];

	//sincosf(playerA, &angsin, &angcos);
	angsin = sinf(playerA); angcos = cosf(playerA);

	for (int x = 0; x < RAYS_WIDE; x++) {
		slopeY = (float)(x - RAYS_WIDE / 2) / RAYS_WIDE;
		slopeY *= 2;
		slopeX = angcos - slopeY * angsin;
		slopeY = angsin + slopeY * angcos;
		rayCast(playerX, playerY, slopeX, slopeY, &ray);
		if (ray.wallHoriz) {
			ray.colr += 8;
		}
		col[x] = ray.colr;
		rays[x] = (int)(HALF_HEIGHT * RAY_HEIGHT / ray.travel);
	}
	//	copy to display buffer
	for (int x = 0; x < RAYS_WIDE; x++) {
		rayColumns[x] = rays[x]; rayColColors[x] = col[x];
	}
	RedrawWindow(hMainWindow, NULL, NULL, RDW_INVALIDATE);
}

/**
 *	Cast a ray across the map
 */
void rayCast(float posX, float posY, float slopeX, float slopeY, RayType_t* ray) {

	int blockX = (int)posX, blockY = (int)posY;
	int dirX, dirY, i;

	ray->colr = 0; ray->travel = 0;
	//	Normalization, if desired (defeats perspective here)
//	float magnitude = sqrt(slopeX * slopeX + slopeY * slopeY);
	float magnitude = 1;
	//	Amount traveled to the next axis intersection
	float travelX = magnitude / fabs(slopeX);
	float travelY = magnitude / fabs(slopeY);
	//	Distance to the first intersection (and each thereafter)
	float tIntV, tIntH;
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
			ray->travel = tIntH;
			blockY += dirY;
			tIntH += travelY;
			ray->wallHoriz = true;
		} else {
			ray->travel = tIntV;
			blockX += dirX;
			tIntV += travelX;
			ray->wallHoriz = false;
		}
		i++;
		if (blockX < 0 || blockY < 0 || blockX >= worldWidth || blockY >= worldHeight) {
			//	Out of bounds?
			break;
		}
		ray->colr = worldMap[blockX + blockY * worldWidth];
	} while (i < 100 && ray->colr == 0);

}
