/*
//  Namespace:      Raycaster.Classes
//  Description:    Definition of classes
*/
Raycaster.Classes = 
{
    Point: function(x, y) {
        this.x = x;
        this.y = y;
    },
    
    Vector: function(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    },
    
    /*
    // Class:       Raycaster.Classes.Sprite
    // Description: Parameters that define a sprite in the game world
    */
    Sprite: function(x, y, id, yoff) {
        this.x = x;         // x,y location of sprite in the game world
        this.y = y;
        this.yoff = yoff;   // Offset for Y coordinate, to make it possible to place things on the floor or ceiling
        this.id = id;       // index of sprite image in Constants.spriteFiles array
    },
    
    /*
    // Class:       Raycaster.Classes.Wall
    // Description: Parameters that define a wall in the game world
    */
    Wall: function(x1, y1, x2, y2, h1, h2, textureId) {
        this.x1 = x1;   // x1, y1: wall start point
        this.y1 = y1;
        this.x2 = x2;   // x2, y2: wall end point
        this.y2 = y2;
        this.h1 = h1;   // wall height at start
        this.h2 = h2;   // wall height at end
        this.textureId = textureId; // id (index in Constants.texturesFiles array) of texture to use on this wall
        this.maxHeight = h1 > h2 ? h1 : h2;
    },
    
    VSliceDrawParams: function() {
        return {
            dy1: 0,
            dy2: 0,
            sy1: 0,
            sy2: 0
        };
    },
    
    Intersection: function() {
        return {
            x: 0,               // X coordinate of this intersection
            y: 0,               // Y coordinate of this intersection
            distance: 0,        // Distance to the intersection
            resourceId: 0,      // index of texture or sprite image in Objects namespace
            levelObjectId: 0,   // index of texture or sprite in Objects.Level namespace
            textureX: 0         // X coordinate of the texture scanline to draw
        };
    },
    
    KeyButton: function(code) {
        this.code = code;
        this.pressed = false;
    },
    
    Angle: function(degrees) {        
        var self = this;
        this.degrees = degrees;
        this.radians = 0;
        
        // Set the value of this angle
        // Corrects negative values or values greater than 360 degrees
        this.setValue = function(v) {
            self.degrees = parseFloat(v);
            
            if (self.degrees >= 360) {
                self.degrees -= 360;
            }
            if (self.degrees < 0) {
                self.degrees += 360;
            }
            
            self.radians = self.toRadians();
        };
        
        // Converts the angle from degrees to radians
        this.toRadians = function() {
            if (self.degrees == 90) {
                return Math.PI / 2;
            }
            else if (self.degrees == 270) {
                return 3 * Math.PI / 2;
            }
            return self.degrees * (Math.PI / 180);
        };
        
        // Turn the angle with n degrees
        this.turn = function(degrees) {
            self.setValue(self.degrees + degrees);
        };

        // Determine to which quadrant of a circle the angle is facing
        this.getQuadrant = function() {
            var rounded = ~~ (0.5 + self.degrees);
            
            if ((rounded >= 0 || rounded == 360) && rounded < 90) {
                return 1;
            }
            if (rounded >= 90 && rounded < 180) {
                return 2;
            }
            if (rounded >= 180 && rounded < 270) {
                return 3;
            }
            if (rounded >= 270 && rounded < 360) {
                return 4;
            }
        };
        
        this.setValue(degrees);
    }
};