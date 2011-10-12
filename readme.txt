HTML5 Raycaster Demo

Author:     Ruud van Falier (ruud@dottech.nl)
Version:    0.6
Released:   -

Demo:       http://www.dottech.nl/raycaster/
Git:        https://github.com/Stribe/HTML5-Raycaster

This is a very basic raycasting engine running on a HTML5 canvas.
Currently supports non-orthogonal walls, texture mapping and sprite rendering.
The old (orthogonal walls) version is available from the v0.3 branch.

Feel free to use it for whatever you need it for.

Changelog:
(0.2)   Initial release.
        Uses "wolfenstein" technique to render the world.
        Has a grid-bases level and supports only orthogonal walls.
(0.3)   Redraw only when player has moved or settings have changed.
        Removed jQuery dependency (thanks to James Abley, https://github.com/jabley)
(0.4)   Added quality setting which makes raycasting use lesser rays.
        Attempted to implement non-orthogonal walls, but it was a failed attempt
(0.5)   Raycasting engine is rewritten and now supports non-orthogonal walls.
        Strafing implemented.
        Quality settings removed because it needs fixing.
(0.5.1) Added FPS counter
(0.5.2) Experimented with floor casting, but it costs too much performance.
        For that reason a gradient is used as floor.
        Added sky background
(0.6)   Implemented sprite rendering.
        Refactored the code so that it could be stored in seperate files and added more comments

Planned features:
- Sectors
- Variable height walls