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
1. Since back in the day (~2008), I've been thinking of drawing whole polygon (namely, trapezoid) walls, instead of building them from individual rays.  The algorithm should be thus: starting at some point on the screen, cast a ray there; whatever you find there, calculate its edge locations.  Cast again (repeat for each edge)...
