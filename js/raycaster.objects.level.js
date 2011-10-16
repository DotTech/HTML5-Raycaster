// Hard-coded level definition
Raycaster.Objects.Level =
{
    walls: [
        // Walls surrounding the level
        new Raycaster.Classes.Wall(100, 10, 700, 10, 200, 200, 1),
        new Raycaster.Classes.Wall(10, 100, 10, 700, 200, 200, 1),
        new Raycaster.Classes.Wall(10, 100, 100, 10, 200, 200, 1),
        new Raycaster.Classes.Wall(790, 100, 790, 700, 200, 200, 1),
        new Raycaster.Classes.Wall(700, 10, 790, 100, 200, 200, 1),
        new Raycaster.Classes.Wall(100, 790, 700, 790, 200, 200, 1),
        new Raycaster.Classes.Wall(790, 700, 700, 790, 200, 200, 1),
        new Raycaster.Classes.Wall(10, 700, 100, 790, 200, 200, 1),
        
        // Walls in the middle
        new Raycaster.Classes.Wall(340, 300, 380, 320, 64, 64, 0),
        new Raycaster.Classes.Wall(380, 320, 420, 360, 64, 64, 0),
        new Raycaster.Classes.Wall(420, 360, 420, 424, 64, 64, 2),
        new Raycaster.Classes.Wall(420, 424, 400, 440, 64, 64, 0),
        new Raycaster.Classes.Wall(400, 440, 400, 470, 64, 64, 0),
        new Raycaster.Classes.Wall(400, 470, 430, 510, 64, 64, 0),
        new Raycaster.Classes.Wall(430, 510, 500, 530, 64, 64, 0),
        new Raycaster.Classes.Wall(500, 530, 560, 530, 64, 64, 0),
        new Raycaster.Classes.Wall(560, 530, 580, 500, 64, 64, 0),
        new Raycaster.Classes.Wall(580, 500, 560, 280, 64, 64, 0),
        new Raycaster.Classes.Wall(560, 280, 500, 220, 64, 64, 0),
        new Raycaster.Classes.Wall(500, 220, 340, 190, 64, 64, 0),
        new Raycaster.Classes.Wall(340, 190, 340, 300, 64, 64, 0),
        
        new Raycaster.Classes.Wall(240, 10, 300, 84, 128, 128, 1),
        new Raycaster.Classes.Wall(300, 84, 410, 84, 128, 128, 1),
        new Raycaster.Classes.Wall(410, 84, 470, 10, 128, 128, 1),
        
        // Angled wall height
        new Raycaster.Classes.Wall(80, 10, 120, 60, 32, 32, 0),
        new Raycaster.Classes.Wall(120, 60, 140, 80, 32, 64, 0),
        new Raycaster.Classes.Wall(140, 80, 160, 90, 64, 75, 0),
        new Raycaster.Classes.Wall(160, 90, 170, 90, 75, 75, 0),
        new Raycaster.Classes.Wall(170, 90, 190, 80, 75, 64, 0),
        new Raycaster.Classes.Wall(190, 80, 210, 60, 64, 32, 0),
        new Raycaster.Classes.Wall(210, 60, 250, 10, 32, 32, 0),
    ],
    
    sprites: [
        new Raycaster.Classes.Sprite(355, 171, 2, 0),
        new Raycaster.Classes.Sprite(355, 137, 2, 0),
        new Raycaster.Classes.Sprite(355, 103, 2, 0),
        new Raycaster.Classes.Sprite(320, 230, 0, 0),
        new Raycaster.Classes.Sprite(320, 247, 0, -30),
        new Raycaster.Classes.Sprite(320, 265, 0, 0),
    ],
    
    floorTextureId: 4,
    
    
}