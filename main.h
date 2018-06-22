#ifndef MAIN_H_INCLUDED
#define MAIN_H_INCLUDED

/**
 *	Key input handling
 */
enum KeyCommands {
	Fwd, Rev, TurnLeft, TurnRight, StrLeft, StrRight, Exit,
	MaxKey = Exit
};

struct RayType {
	float travel;
	int colr;
	bool wallHoriz;
};

VOID OnPaint(HDC hdc);
LRESULT CALLBACK WindowProcedure (HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam);
int WINAPI WinMain(HINSTANCE hThisInstance,
                     HINSTANCE hPrevInstance,
                     LPSTR lpszArgument,
                     int nCmdShow);
void setKeyState(int key, bool pressed);
void doGameTic(void);
int loadMap(char* f);
void rayCast(float posX, float posY, float slopeX, float slopeY, RayType* ray);
void render(void);
bool collisionDetect(float moveX, float moveY);

#endif // MAIN_H_INCLUDED
