# raycast_win
Flat shaded raycaster graphics demo, for Windows.

Compiles with MinGW GCC 8.1.0.  The provided executable is the 64-bit "release" output with optimizations enabled.

Project file: Code::Blocks IDE.

Run raycast.exe with the map file as the only parameter:
raycast level.map

The map format is plain text, easy enough to understand.  Have fun making new ones!

Background
-----------
This code is derived from various demos I've played with, ever since I learned how to program basic 3D (and pseudo-3D) graphics back around the early 2000s.  Back then, I was learning QuickBasic.  By the mid 2000s, I picked up Java, ASM and a little C.  By the late 2000s, I had returned to the original code base with a few new methods (from a better grasp of geometry, programming, and complexity).

All told: this code is a 2018 port and fork of a 2011 Java version, which was a port and fork of a hybrid QB+ASM version from 2008.

I've also written an all-x86-ASM version (late 2008), and a C version (~contemporary) for AVR (which works surprisingly well, for a mere 30MHz 8-bit machine).

Tech
-----
The key insight was doing as much setup as possible outside the inner loop, and as little inside (well, duh).  In lieu of Carmack's (Wolf3D's) self-modifying code (depending on cardinal direction, the loop inc/decrement and compare signs change), coordinate increments are used, plus the dual accumulators (tIntV/H), which more or less serve as the accumulator in Bresenham's line algorithm, generalized for a line of desired slope but unknown length, and any slope within a full quadrant.  (The travel assignment doesn't need to be done each time, it could be saved as a flag and postponed til after the loop.)

Quirks
-------
The keyboard input method doesn't work very well: it seems Windows sends a KEYUP event just before another KEYDOWN.  Sometimes.  Arrow keys don't seem to interfere with each other, but letters do.  I noticed the same behavior in the Java code (which conveniently uses the same names for a lot of VK_keys -- easy to see the influence there!), which could likely be just because Windows sends precisely these events and Java just wraps them in native functions.

The whole thing is pretty easily ported to fixed point math, with negligible loss in accuracy.  Not that that's of any importance on a stonking great x64 machine, that can crank out doubles faster than the original 80386 cranked out clock cycles at all!

Collision isn't handled on map boundaries: instead it just returns straightaway.  Instead of sliding along a wall with an alert sound dinging, you just stop in your tracks.  Some naked edges are provided in the map, for your, uh, tactile pleasure I guess?

Possible Improvements
----------------------
Two ways, one old and one new:
1. Since back in the day (~2008), I've been thinking of drawing whole polygon (namely, trapezoid) walls, instead of building them from individual rays.  The algorithm should be thus: starting at some point on the screen, cast a ray there; when you find a wall, calculate its edge locations.  Cast a ray at those edges.  If the same wall is found, you're done.  If another wall is found, repeat the casting-edges process until done.  When done, push on a stack, the columns one pixel outside of the walls you just found, and recurse.  If you find a wall whose edges are more distant than existing columns, only fill in the columns that are new.  This way, when any wall is found, the screen is spanned recursively, and the occlusion problem is solved (hopefully?).
This method is old because I tried it, but it didn't work -- I didn't realize all the occlusion steps necessary at the time.

2. A sector-based method.  Instead of evaluating each screen column, checking multiple times across a grid of squares: simplify the visible area into variable sized blocks.  Call them sectors.

A sector is a rectangle of variable width and height, and contains four lists, describing the walls bounding the sector.  Each "wall" is a value, or descriptor, or pointer to a table of wall data (depending on how you want to store it, and how rich the wall data needs to be).  A sector is convex, so its walls can be tested in order with no worries about occlusion.

Starting from the sector the camera is currently in: the wall vertices are perspective transformed, and the walls are drawn by interpolating between vertices.  (This incurs a couple multiplies for each vertex, and a division for each wall.  Annoying, but maybe not deal-breaking, on a very simple platform.)  If textured, a trapezoid perspective texturing method is used.  To build arbitrary (but still block-based) regions, tag some walls as portals to another sector.  Instead of drawing them solid, add their start and end columns to a list.  Therefore, this is a 2D sector-and-portal method, like the Build engine, but with orthogonal line segments only, saving a lot of geometry testing.

When the present sector is done drawing, enter each portal, recursively, and repeat the sector drawing process from that window.  Drawing is front-to-back, so occlusion is perfect.  Pathological cases are diagonal hallways, which can only be sliced into 1x1 or 1x2 sectors.  As a graph-based method, a map grid is no longer required at all -- noneuclidian geometry can be hacked into this format.
