// Hard-coded level definition
Raycaster.Objects.Level =
{
    // Define walls in the world, make sure they are connected and there are no holes left in it
    walls: [
        // Walls surrounding the level
        new Raycaster.Classes.Wall(100, 10, 700, 10, 1),
        new Raycaster.Classes.Wall(10, 100, 10, 700, 1),
        new Raycaster.Classes.Wall(10, 100, 100, 10, 1),
        new Raycaster.Classes.Wall(790, 100, 790, 700, 1),
        new Raycaster.Classes.Wall(700, 10, 790, 100, 1),
        new Raycaster.Classes.Wall(100, 790, 700, 790, 1),
        new Raycaster.Classes.Wall(790, 700, 700, 790, 1),
        new Raycaster.Classes.Wall(10, 700, 100, 790, 1),
        
        // Colored stones west
        new Raycaster.Classes.Wall(100, 420, 200, 700, 2),
        new Raycaster.Classes.Wall(100, 420, 120, 400, 2),
        new Raycaster.Classes.Wall(120, 400, 160, 400, 2),
        new Raycaster.Classes.Wall(160, 400, 180, 420, 2),
        new Raycaster.Classes.Wall(180, 420, 200, 460, 2),
        new Raycaster.Classes.Wall(200, 460, 400, 640, 2),
        new Raycaster.Classes.Wall(400, 640, 420, 680, 2),
        new Raycaster.Classes.Wall(420, 680, 420, 700, 2),
        new Raycaster.Classes.Wall(420, 700, 390, 730, 2),
        new Raycaster.Classes.Wall(390, 730, 200, 700, 2),
        
        // Wooden walls in the middle
        new Raycaster.Classes.Wall(300, 300, 340, 300, 7),
        new Raycaster.Classes.Wall(340, 300, 380, 320, 7),
        new Raycaster.Classes.Wall(380, 320, 420, 360, 7),
        new Raycaster.Classes.Wall(420, 360, 400, 440, 7),
        new Raycaster.Classes.Wall(400, 440, 400, 470, 7),
        new Raycaster.Classes.Wall(400, 470, 430, 510, 7),
        new Raycaster.Classes.Wall(430, 510, 500, 530, 7),
        new Raycaster.Classes.Wall(500, 530, 560, 530, 7),
        new Raycaster.Classes.Wall(560, 530, 580, 500, 7),
        new Raycaster.Classes.Wall(580, 500, 560, 280, 7),
        new Raycaster.Classes.Wall(560, 280, 500, 220, 7),
        new Raycaster.Classes.Wall(500, 220, 340, 190, 7),
        new Raycaster.Classes.Wall(340, 190, 300, 300, 7),
    ],
    
    sprites: [
        new Raycaster.Classes.Sprite(160, 50, 2),
        new Raycaster.Classes.Sprite(40, 160, 0),
        new Raycaster.Classes.Sprite(280, 80, 0),
    ],
}