#ifndef MAIN_H_INCLUDED
#define MAIN_H_INCLUDED

#include <windows.h>
#include <stdbool.h>

/**
 *	Key input handling
 */
enum KEYCMD_e {
	KEYCMD_FWD,
	KEYCMD_REV,
	KEYCMD_TURNLEFT,
	KEYCMD_TURNRIGHT,
	KEYCMD_STRAFELEFT,
	KEYCMD_STRAFERIGHT,
	KEYCMD_EXIT,
	KEYCMD_MAXKEY = KEYCMD_EXIT
};

typedef struct RayType_s {
	float travel;
	int colr;
	bool wallHoriz;
} RayType_t;

BOOL OnPaint(void);
LRESULT CALLBACK WindowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam);
int WINAPI WinMain(HINSTANCE hThisInstance, HINSTANCE hPrevInstance, LPSTR lpszArgument, int nCmdShow);
void setKeyState(int key, bool pressed);
void doGameTic(void);
int loadMap(const char* f);
void rayCast(float posX, float posY, float slopeX, float slopeY, RayType_t* ray);
void render(void);
bool collisionDetect(float moveX, float moveY);

#endif // MAIN_H_INCLUDED
