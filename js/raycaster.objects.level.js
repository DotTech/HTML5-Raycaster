// Hard-coded level definition
var demoLevels = new Array();

demoLevels[0] = {
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
        
        // Walls in the middle
        new Raycaster.Classes.Wall(340, 300, 380, 320, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(380, 320, 420, 360, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(420, 360, 420, 424, 0, 0, 64, 64, 2),
        new Raycaster.Classes.Wall(420, 424, 400, 440, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(400, 440, 400, 470, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(400, 470, 430, 510, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(430, 510, 500, 530, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(500, 530, 560, 530, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(560, 530, 580, 500, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(580, 500, 560, 280, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(560, 280, 500, 220, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(500, 220, 340, 190, 0, 0, 64, 64, 0),
        new Raycaster.Classes.Wall(340, 190, 340, 300, 0, 0, 64, 64, 0),
        
        new Raycaster.Classes.Wall(240, 10, 300, 84, 0, 0, 128, 128, 1),
        new Raycaster.Classes.Wall(300, 84, 410, 84, 0, 0, 128, 128, 1),
        new Raycaster.Classes.Wall(410, 84, 470, 10, 0, 0, 128, 128, 1),
    ],
    
    sprites: [
        new Raycaster.Classes.Sprite(355, 171, 0, 2),
        new Raycaster.Classes.Sprite(355, 137, 0, 2),
        new Raycaster.Classes.Sprite(355, 103, 0, 2),
        new Raycaster.Classes.Sprite(320, 230, 0, 0),
        new Raycaster.Classes.Sprite(320, 247, 30, 0),
        new Raycaster.Classes.Sprite(320, 265, 0, 0),
    ],
    
    // Define floor elevations
    // Make sure the vectors appear in the correct order (connecting lines) and the area is closed
    // Must be a straight square!!
    elevations: [    
    ],
    
    floorTextureId: 4,
    
    init: function() {
        Raycaster.Objects.player.angle.setValue(340);
    }
};

demoLevels[1] =
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
        Raycaster.Objects.player.angle.setValue(280);
        
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
};

demoLevels[2] =
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
        
        // Angled and elevated walls
        new Raycaster.Classes.Wall(300, 10, 300, 90, 0, 0, 120, 120, 0),
        new Raycaster.Classes.Wall(300, 90, 300, 130, 40, 120, 80, 80, 0),
        new Raycaster.Classes.Wall(300, 130, 300, 170, 120, 120, 80, 80, 0),
        new Raycaster.Classes.Wall(300, 170, 300, 210, 120, 40, 80, 80, 0),
        new Raycaster.Classes.Wall(300, 210, 300, 290, 0, 0, 120, 120, 0),
    ],
    
    sprites: [
        new Raycaster.Classes.Sprite(455, 171, 0, 2),
        new Raycaster.Classes.Sprite(455, 137, 0, 2),
        new Raycaster.Classes.Sprite(455, 103, 0, 2),
        new Raycaster.Classes.Sprite(420, 230, 0, 0),
        new Raycaster.Classes.Sprite(420, 247, 30, 0),
        new Raycaster.Classes.Sprite(420, 265, 0, 0),
    ],
    
    elevations: [    
    ],
    
    floorTextureId: 4,
    
    // Generates a stairway in the level
    init: function() {
        Raycaster.Objects.player.angle.setValue(4);
    }
};

Raycaster.Objects.Level = demoLevels[0];