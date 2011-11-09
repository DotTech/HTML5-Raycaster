/*
//  Namespace:      Raycaster.Classes
//  Description:    Definition of classes
*/
Raycaster.Classes = 
{
    Point: function(x, y) {
        return {
            x: x,
            y: y
        };
    },
    
    Vector: function(x1, y1, x2, y2) {
        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        };
    },
    
    /*
    // Class:       Raycaster.Classes.Sprite
    // Description: Parameters that define a sprite in the game world
    */
    Sprite: function(x, y, z, id, yoff) {
        return {
            x: x,       // x,y location of sprite in the game world
            y: y,
            z: z,
            yoff: yoff, // Offset for Y coordinate, to make it possible to place things on the floor or ceiling
            id: id      // index of sprite image in Constants.spriteFiles array
        };
    },
    
    /*
    // Class:       Raycaster.Classes.Wall
    // Description: Parameters that define a wall in the game world
    */
    Wall: function(x1, y1, x2, y2, z1, z2, h1, h2, textureId) {
        return {
            x1: x1,   // x1, y1: wall start point
            y1: y1,
            x2: x2,   // x2, y2: wall end point
            y2: y2,
            z1: z1,   // wall elevation at start
            z2: z2,   // wall elevation at end
            h1: h1,   // wall height at start
            h2: h2,   // wall height at end
            textureId: textureId, // id (index in Constants.texturesFiles array) of texture to use on this wall
            maxHeight: (h1 > h2 ? h1: h2)
        };
    },
    
    /*
    // Class:       Raycaster.Classes.Elevation
    // Description: Defines an elevation in the floor
    */
    Elevation: function(height, area) {
        return {
            area: area,     // One Vector defining the size of the elevated area.
                            // Currently limits to elevations being squared and angled straight
            height: height  // Height of the elevation
        };
    },
    
    /*
    // Class:       Raycaster.Classes.VSliceDrawParams
    // Description: Drawing parameters for a vertical slice (scanline) of an object
    */
    VSliceDrawParams: function() {
        return {
            dy1: 0,         // Destination start Y coord
            dy2: 0,         // Destination end Y coord
            sy1: 0,         // Source image start Y coord
            sy2: 0,         // Source image end Y coord
            texture: null   // Image object containing the texture or sprite to draw
        };
    },
    
    Intersection: function() {
        return {
            x: 0,               // X coordinate of this intersection
            y: 0,               // Y coordinate of this intersection
            distance: 0,        // Distance to the intersection
            resourceId: 0,      // index of texture or sprite image in Objects namespace
            levelObjectId: 0,   // index of texture or sprite in Objects.Level namespace
            textureX: 0,        // X coordinate of the texture scanline to draw
            isSprite: false,    // true if intersection if for a sprite, otherwise its for a wall
            drawParams: null    // VSliceDrawParams object for this intersection
        };
    },
    
    KeyButton: function(code) {
        return {
            code: code,
            pressed: false
        };
    },
    
    Angle: function(degrees) {
    
        var self = this;
        this.degrees = degrees;
        this.radians = 0;
        
        // Set the value of this angle
        // Corrects negative values or values greater than 360 degrees
        this.setValue = function(v) {
            self.degrees = Number(v);
            
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