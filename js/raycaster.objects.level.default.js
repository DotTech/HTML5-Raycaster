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
    }
}