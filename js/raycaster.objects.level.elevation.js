// Hard-coded level definition
Raycaster.Objects.Level =
{
    walls: [
        // Walls surrounding the level
        new Raycaster.Classes.Wall(100, 10, 700, 10, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(10, 100, 10, 700, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(10, 100, 100, 10, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(790, 100, 790, 700, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(700, 10, 790, 100, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(100, 790, 700, 790, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(790, 700, 700, 790, 0, 0, 200, 200, 1),
        new Raycaster.Classes.Wall(10, 700, 100, 790, 0, 0, 200, 200, 1),
        
        // Stairways
        new Raycaster.Classes.Wall(59, 240, 59, 600, 0, 0, 32, 109, 0),
        new Raycaster.Classes.Wall(59, 601, 400, 601, 0, 0, 109, 45, 0),
        new Raycaster.Classes.Wall(181, 240, 181, 480, 0, 0, 32, 80, 0),
        new Raycaster.Classes.Wall(181, 480, 400, 480, 0, 0, 80, 45, 0),
        new Raycaster.Classes.Wall(400, 480, 400, 601, 0, 0, 45, 45, 0),
    ],
    
    sprites: [
    ],
    
    // Define floor elevations
    // Make sure the vectors appear in the correct order (connecting lines) and the area is closed
    // Must be a straight square!!
    elevations: [    
        // Elevate the floor inside the square
        new Raycaster.Classes.Elevation(45, new Raycaster.Classes.Vector(180, 480, 400, 600))
    ],
    
    floorTextureId: 4,
    
    // Generates a stairway in the level
    init: function() {
        var level = Raycaster.Objects.Level,
            classes = Raycaster.Classes,
            stairwidth = 120,
            stepwidth = 120,
            startX = 60,
            startY = 240;
        
        // Generate walls for stairway
        for (var i = 0; i < 3; i++) {
            var stepheight = 15,
                z = i * 15,
                y = startY + i * stepwidth;
            
            level.walls[level.walls.length] = new classes.Wall(startX, y, startX + stairwidth, y, z, z, stepheight, stepheight, 0);
            if (i < 2) {
                level.walls[level.walls.length] = new classes.Wall(startX + stairwidth, y, startX + stairwidth, y + stepwidth, z, z, stepheight, stepheight, 0);
                level.walls[level.walls.length] = new classes.Wall(startX + stairwidth, y + stepwidth, startX, y + stepwidth, z, z, stepheight, stepheight, 0);
                level.walls[level.walls.length] = new classes.Wall(startX, y + stepwidth, startX, y, z, z, stepheight, stepheight, 0);
            }
            level.elevations[level.elevations.length] = new Raycaster.Classes.Elevation(z + stepheight, new Raycaster.Classes.Vector(startX, y, startX + stairwidth, y + stepwidth));
        }
        
    }
}