HTML5 Raycaster Demo

Author:     Ruud van Falier (ruud@dottech.nl)
Version:    0.5.2
Released:   11 october 2011

Demo:       http://www.dottech.nl/raycaster/
Git:        https://github.com/Stribe/HTML5-Raycaster

This is a very basic raycasting engine rendered on an HTML5 canvas.
Currently supports non-orthogonal walls and texture mapping.
The old (orthogonal walls) version is still available from the v0.3 branch.

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
(0.5.2) Experimented with floor casting, but it costs too much performance (ended up with 2 fps)
        For that reason a gradient is used as floor.
        Added sky background
        
Planned features:
- Sectors
- Variable height walls
- Sprites    