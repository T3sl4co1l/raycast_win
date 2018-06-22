#if defined(UNICODE) && !defined(_UNICODE)
    #define _UNICODE
#elif defined(_UNICODE) && !defined(UNICODE)
    #define UNICODE
#endif

#define _USE_MATH_DEFINES

#include <cstdio>
#include <cstdlib>
#include <cmath>
#include <tchar.h>
#include <windows.h>
#include <gdiplus.h>
#include <fstream>

using namespace Gdiplus;
#include "main.h"

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
TCHAR szClassName[ ] = _T("RaycastClass");
/**	Timer handle / reference number */
ULONG_PTR hTimer;
/**	Keyboard input */
bool keyDown[KeyCommands::MaxKey + 1];
/**
 *	Ray data to be drawn.
 *	ceiling		\
 *	floor		 | Colors to draw everything in
 *	walls		/
 *	rayBuffer	Column heights
 *	colBuffer	Column color indices
 */
Color rayCeiling = Color::LightGray;
Color rayFloor = Color::DarkGray;
Color rayWalls[] = {
	Color::Black,
	Color::DarkBlue,
	Color::DarkGreen,
	Color::DarkCyan,
	Color::DarkRed,
	Color::Purple,
	Color::Brown,
	Color::LightGray,
	Color::DarkGray,
	Color::LightBlue,
	Color::LightGreen,
	Color::Cyan,
	Color::Salmon,
	Color::Magenta,
	Color::Yellow,
	Color::White
};
int* rayColumns;
int* rayColColors;

/**
 *	World data
 */
int worldWidth;
int worldHeight;
int* worldMap;
/**
 *	Player coordinates: X, Y (with respect to
 *	World coordinates), and angle (radians).
 */
float playerX = -1.0f;
float playerY = -1.0f;
float playerA = 0.0f;

/** Handle for main window */
HWND hwnd;

/**
 *	Main Entry Point
 */
int WINAPI WinMain(HINSTANCE hThisInstance,
                     HINSTANCE hPrevInstance,
                     LPSTR lpszArgument,
                     int nCmdShow)
{
    MSG messages;            /* Here messages to the application are saved */
    WNDCLASSEX wincl;        /* Data structure for the windowclass */
	GdiplusStartupInput gdiplusStartupInput;
	ULONG_PTR           gdiplusToken;
	int loadErr;

	/* * *  Initialization and loading  * * */

    printf("Raycast: flat shaded, grid-based raycaster.  By Tim Williams, " __DATE__ ".\n");
    if (!strlen(lpszArgument)) {
		printf("Usage: RAYCAST <mapname>\n");
		return 0;
    }
    printf("Loading map \"%s\"...\n", lpszArgument);
	loadErr = loadMap(lpszArgument);
	if (loadErr) {
		if (loadErr == -1) {
			printf("File not found.\n");
		} else {
			printf("Failed at character: %i\n", loadErr);
		}
		return -1;
	}

	rayColumns = new int[RAYS_WIDE];
	rayColColors = new int[RAYS_WIDE];

	/* * *  Deal with all the Windows crap  * * */

	GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, NULL);

    /* The Window structure */
    wincl.hInstance = hThisInstance;
    wincl.lpszClassName = szClassName;
    wincl.lpfnWndProc = WindowProcedure;      /* This function is called by windows */
    wincl.style = CS_DBLCLKS;                 /* Catch double-clicks */
    wincl.cbSize = sizeof(WNDCLASSEX);

    /* Use default icon and mouse-pointer */
    wincl.hIcon = LoadIcon(NULL, IDI_APPLICATION);
    wincl.hIconSm = LoadIcon(NULL, IDI_APPLICATION);
    wincl.hCursor = LoadCursor(NULL, IDC_ARROW);
    wincl.lpszMenuName = NULL;                 /* No menu */
    wincl.cbClsExtra = 0;                      /* No extra bytes after the window class */
    wincl.cbWndExtra = 0;                      /* structure or the window instance */
    /* Use Windows's default color as the background of the window */
    wincl.hbrBackground = (HBRUSH)COLOR_BACKGROUND;

    /* Register the window class, and if it fails quit the program */
    if (!RegisterClassEx(&wincl)) {
		printf("RegisterClassEx failed.\n");
        return 0;
    }
    /* The class is registered, let's create the program */
    hwnd = CreateWindowEx(
           0,                   /* Extended possibilites for variation */
           szClassName,         /* Classname */
           _T("Raycast"),       /* Title Text */
           (WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX),	/* Window style */
           CW_USEDEFAULT,       /* Windows decides the position */
           CW_USEDEFAULT,       /* where the window ends up on the screen */
           WIDTH,               /* The programs width */
           HEIGHT,              /* and height in pixels */
           HWND_DESKTOP,        /* The window is a child-window to desktop */
           NULL,                /* No menu */
           hThisInstance,       /* Program Instance handler */
           NULL                 /* No Window Creation data */
           );

	hTimer = SetTimer(hwnd, IDT_FRAMETIC, 1000 / FRAME_RATE, NULL);
	if (!hTimer) {
		printf("SetTimer failed.\n");
		return 0;
	}

    /* Make the window visible on the screen */
    ShowWindow(hwnd, nCmdShow);

    /* Run the message loop. It will run until GetMessage() returns 0 */
    while (GetMessage(&messages, NULL, 0, 0))
    {
        /* Translate virtual-key messages into character messages */
        TranslateMessage(&messages);
        /* Send message to WindowProcedure */
        DispatchMessage(&messages);
    }

    /* The program return-value is 0 - The value that PostQuitMessage() gave */
    return messages.wParam;
}


/**
 *	Message dispatch handler
 */
LRESULT CALLBACK WindowProcedure (HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    HDC          hdc;
    PAINTSTRUCT  ps;
    static bool inGameTic = 0;

    switch(message)               /* handle the messages */
    {
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
    case WM_PAINT:
        hdc = BeginPaint(hwnd, &ps);
        OnPaint(hdc);
        EndPaint(hwnd, &ps);
        break;
    case WM_DESTROY:
    	KillTimer(hwnd, hTimer);
        PostQuitMessage(0);       /* send a WM_QUIT to the message queue */
        break;
    default:                      /* for messages that we don't deal with */
        return DefWindowProc(hwnd, message, wParam, lParam);
    }

    return 0;
}

/**
 *	Draws the graphical output to the window.
 */
VOID OnPaint(HDC hdc)
{
	int x, xg;
	Graphics g(hdc);
	SolidBrush c(rayCeiling);
	SolidBrush f(rayFloor);
	SolidBrush w(rayCeiling);

	xg = 0;
	for (x = 0; x < RAYS_WIDE; x++) {
		w.SetColor(Color(rayWalls[rayColColors[x]]));
		g.FillRectangle(&c, xg, 0, STRIP_WIDTH, HALF_HEIGHT - rayColumns[x]);
		g.FillRectangle(&w, xg, HALF_HEIGHT - rayColumns[x],
						STRIP_WIDTH, rayColumns[x] * 2);
		g.FillRectangle(&f, xg, HALF_HEIGHT + rayColumns[x], STRIP_WIDTH, HEIGHT);
		xg += STRIP_WIDTH;
	}

}

/**
 *	Processes inputs and updates game state.
 *	Triggered by system timer.
 */
void doGameTic(void) {

	float moveX = 0, moveY = 0;
	bool moveFlag = false;

	if (keyDown[0]) {
		moveX = MOVE_STEP * std::cos(playerA);
		moveY = MOVE_STEP * std::sin(playerA);
		moveFlag = true;
	}
	if (keyDown[1]) {
		moveX = -MOVE_STEP * std::cos(playerA);
		moveY = -MOVE_STEP * std::sin(playerA);
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
		moveX = MOVE_STEP * std::sin(playerA);
		moveY = -MOVE_STEP * std::cos(playerA);
		moveFlag = true;
	}
	if (keyDown[5]) {
		moveX = -MOVE_STEP * std::sin(playerA);
		moveY = MOVE_STEP * std::cos(playerA);
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

	KeyCommands k;

	switch (key) {
	case VK_UP:
	case 'W':
		k = KeyCommands::Fwd;
		break;
	case VK_DOWN:
	case 'S':
		k = KeyCommands::Rev;
		break;
	case VK_LEFT:
		k = KeyCommands::TurnLeft;
		break;
	case VK_RIGHT:
		k = KeyCommands::TurnRight;
		break;	case 'A':
		k = KeyCommands::StrLeft;
		break;
	case 'D':
		k = KeyCommands::StrRight;
		break;
	case VK_ESCAPE:
		k = KeyCommands::Exit;
		SendMessage(hwnd, WM_DESTROY, 0, 0);
		break;
	default:
		return;
	}
	keyDown[k] = pressed;

}

/**
 *
 */

/**
 *	Loads map data from the specified filename.
 */
int loadMap(char* f) {

	int x, y, col, offs = 1;
	std::ifstream file(f, std::ifstream::in);

	if (file.fail()) return -1;
	file >> worldWidth >> worldHeight;
	offs += file.gcount(); if (file.fail()) return offs;
	printf("Map size: %i x %i\n", worldWidth, worldHeight);

	//	Allocate the map, and read in data
	worldMap = new int[worldWidth * worldHeight];

	for (y = 0; y < worldHeight; y++) {
		for (x = 0; x < worldWidth; x++) {
			file >> col;
			offs += file.gcount();
			if (file.fail() ||
				(col < 0 || col > 9) ||
				(col == 9 && (playerX >= 0.0f || playerY >= 0.0f)) ) {
					return offs;
				}
			if (col == 9) {
				playerX = x + 0.5f; playerY = y + 0.5f;
				printf("Player at location: %i, %i\n", x, y);
				col = 0;
			}
			worldMap[x + y * worldWidth] = col;
		}
	}
	if (playerX < 0 || playerY < 0) {
		return offs;
	}

	return 0;
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
	int* col;
	int* rays;
	RayType ray;

	col = new int[RAYS_WIDE];
	rays = new int[RAYS_WIDE];
	for (int x = 0; x < RAYS_WIDE; x++) {
		slopeY = (float)(x - RAYS_WIDE / 2) / RAYS_WIDE;
		slopeY *= 2;
		slopeX = std::cos(playerA) - slopeY * std::sin(playerA);
		slopeY = std::sin(playerA) + slopeY * std::cos(playerA);
		rayCast(playerX, playerY, slopeX, slopeY, &ray);
		if (ray.wallHoriz) {
			ray.colr += 8;
		}
		col[x] = ray.colr;
		rays[x] = (int)(HALF_HEIGHT * RAY_HEIGHT / ray.travel);
	}
	//	Copy the data to RayGraphics and draw it
	//synchronized(this) {
	//colBuffer = col; rayBuffer = rays;
	//}
	delete rayColumns; delete rayColColors;
	rayColumns = rays; rayColColors = col;
	RedrawWindow(hwnd, NULL, NULL, RDW_INVALIDATE);
}

/**
 *	Cast a ray across the map
 */
void rayCast(float posX, float posY, float slopeX, float slopeY, RayType* ray) {

	int blockX = (int)posX, blockY = (int)posY;
	int dirX, dirY, i;

	ray->colr = 0; ray->travel = 0;
	//	Normalization, if desired (defeats perspective here)
//	float magnitude = std::sqrt(slopeX * slopeX + slopeY * slopeY);
	float magnitude = 1;
	//	Amount traveled to the next axis intersection
	float travelX = magnitude / std::abs(slopeX);
	float travelY = magnitude / std::abs(slopeY);
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
