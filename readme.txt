HTML5 Raycaster Demo

Author:     Ruud van Falier (ruud@dottech.nl)
Version:    0.8
Released:   16 october 2011

Demo:       http://www.dottech.nl/raycaster/
Git:        https://github.com/Stribe/HTML5-Raycaster

This is a very basic raycasting engine running on a HTML5 canvas.
Currently supports non-orthogonal walls with variable height,
texture mapping and sprite rendering.
FPS has dropped quite severely since more features were added and i hope to be able
to improve on this after planned analysis and implemention of sectors.
The old (orthogonal walls) version is available from the v0.3 branch.

Feel free to use it for whatever you need it for.

Planned features:
- Sectors
- Support for elevated floors in level
- Repeating textures (instead of being stretched)

Optimizations/fixes planned:
- When drawing a wall slice, remember intersection and use it during sprite rendering to avoid having to search for blocking walls
- Sprites are not visible behind walls with lower height than the sprite

Revision log:
(0.2)   - Initial release.
          Uses "wolfenstein" technique to render the world.
          Has a grid-bases level and supports only orthogonal walls.
(0.3)   - Redraw only when player has moved or settings have changed.
        - Removed jQuery dependency (thanks to James Abley, https://github.com/jabley)
(0.4)   - Attempted to implement non-orthogonal walls, but it was a failed attempt
          Never released this version
(0.5)   - Raycasting engine is rewritten and now supports non-orthogonal walls.
        - Strafing implemented.
(0.5.1) - Added FPS counter
(0.5.2) - Experimented with floor casting, but it costs too much performance.
          For that reason a gradient is used as floor.
        - Added sky background
(0.6)   - Refactored the code so that it could be stored in seperate files and added more comments
        - Implemented sprite rendering
(0.7)   - Fixed bug that caused incorrect rendering of walls that are very close to the player
        - Sprites rendering optimized and now supports vertically positioning of sprites
        - Variable wall height implemented
          Also support angled height (a different start and end height)
(0.8)   - Tried several techniques for speeding up drawing, but couldn't find anything faster.
          Also turns out that the big performance eater is not drawing, but calculating.
        - Implemented a few performance tweaks:
          * VSliceDrawParams and Intersection are now returning objects and dont need to be instantiated
          * Math.round() replaced for bitwise hack in functions that are frequently called
        - Fixed bug in Raycasting.correctQuadrant() which returned incorrect result at straight angles
        - Fixed texturing bug at 0 degrees (turns out i should not ignore angle=360 degrees, doh)
        - Experimental floorcasting implemented, its way too slow though
        - Player Z coord added and implemented elevation
        - Movement key bindings got a different setup
        - Texture mapping procedure is improved and now stretches correctly.
          Textures now always stretch in height to fit the wall and repeat over the width.

