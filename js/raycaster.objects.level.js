// Hard-coded level definition
Raycaster.Objects.Level =
{
    // Define walls in the world, make sure they are connected and there are no holes left in it
    walls: [
        // Walls surrounding the level
        new Raycaster.Classes.Wall(100, 10, 700, 10, 64, 64, 1),
        new Raycaster.Classes.Wall(10, 100, 10, 700, 64, 64, 1),
        new Raycaster.Classes.Wall(10, 100, 100, 10, 64, 64, 1),
        new Raycaster.Classes.Wall(790, 100, 790, 700, 64, 64, 1),
        new Raycaster.Classes.Wall(700, 10, 790, 100, 64, 64, 1),
        new Raycaster.Classes.Wall(100, 790, 700, 790, 64, 64, 1),
        new Raycaster.Classes.Wall(790, 700, 700, 790, 64, 64, 1),
        new Raycaster.Classes.Wall(10, 700, 100, 790, 64, 64, 1),
        
        // Dent in the northern outer wall
        new Raycaster.Classes.Wall(240, 10, 300, 84, 64, 64, 1),
        new Raycaster.Classes.Wall(300, 84, 410, 84, 64, 64, 1),
        new Raycaster.Classes.Wall(410, 84, 470, 10, 64, 64, 1),
        
        // Colored stones south-west
        new Raycaster.Classes.Wall(100, 420, 200, 700, 64, 64, 2),
        new Raycaster.Classes.Wall(100, 420, 120, 400, 64, 64, 2),
        new Raycaster.Classes.Wall(120, 400, 160, 400, 64, 64, 2),
        new Raycaster.Classes.Wall(160, 400, 180, 420, 64, 64, 2),
        new Raycaster.Classes.Wall(180, 420, 200, 460, 64, 64, 2),
        new Raycaster.Classes.Wall(200, 460, 400, 640, 64, 64, 2),
        new Raycaster.Classes.Wall(400, 640, 420, 680, 64, 64, 2),
        new Raycaster.Classes.Wall(420, 680, 420, 700, 64, 64, 2),
        new Raycaster.Classes.Wall(420, 700, 390, 730, 64, 64, 2),
        new Raycaster.Classes.Wall(390, 730, 200, 700, 64, 64, 2),
        
        // Wooden walls in the middle
        new Raycaster.Classes.Wall(340, 300, 380, 320, 64, 64, 7),
        new Raycaster.Classes.Wall(380, 320, 420, 360, 64, 64, 7),
        new Raycaster.Classes.Wall(420, 360, 400, 440, 64, 64, 7),
        new Raycaster.Classes.Wall(400, 440, 400, 470, 64, 64, 7),
        new Raycaster.Classes.Wall(400, 470, 430, 510, 64, 64, 7),
        new Raycaster.Classes.Wall(430, 510, 500, 530, 64, 64, 7),
        new Raycaster.Classes.Wall(500, 530, 560, 530, 64, 64, 7),
        new Raycaster.Classes.Wall(560, 530, 580, 500, 64, 64, 7),
        new Raycaster.Classes.Wall(580, 500, 560, 280, 64, 64, 7),
        new Raycaster.Classes.Wall(560, 280, 500, 220, 64, 64, 7),
        new Raycaster.Classes.Wall(500, 220, 340, 190, 64, 64, 7),
        new Raycaster.Classes.Wall(340, 190, 340, 300, 64, 64, 7),
    ],
    
    sprites: [
        new Raycaster.Classes.Sprite(355, 171, 2, 0),
        new Raycaster.Classes.Sprite(355, 137, 2, 0),
        new Raycaster.Classes.Sprite(355, 103, 2, 0),
        new Raycaster.Classes.Sprite(120, 120, 0, 31),
        new Raycaster.Classes.Sprite(320, 250, 0, 31),
    ],
}