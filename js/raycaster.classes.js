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
    
    Sprite: function(x, y, dy, id) {
        this.x = x;
        this.y = y;
        this.dy = dy;
        this.id = id;
    },
    
    Vector: function(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    },
    
    Wall: function(x1, y1, x2, y2, textureId) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.textureId = textureId;
    },
    
    VSliceDrawParams: function(dy1, dy2, sy1, sy2) {
        this.dy1 = dy1;
        this.dy2 = dy2;
        this.sy1 = sy1;
        this.sy2 = sy2;
    },
    
    Intersection: function() {
        this.x = 0;             // X coordinate of this intersection
        this.y = 0;             // Y coordinate of this intersection
        this.distance = 0;      // Distance to the intersection
        this.resourceId = 0;    // index of texture or sprite
        this.textureX = 0;      // X coordinate of the texture scanline to draw
    },
    
    KeyButton: function(code) {
        this.code = code;
        this.pressed = false;
    },
    
    // Represents an angle and implements some methods to manipulate the angle
    Angle: function(degrees) {        
        var self = this;
        this.degrees = degrees;
        
        // Set the value of this angle
        // Corrects negative values or values greater than 360 degrees
        this.setValue = function(v) {
            self.degrees = parseFloat(v);
            
            if (self.degrees < 0) {
                self.degrees += 359;
            }
            else if (self.degrees > 359) {
                self.degrees -= 360;
            }
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
            if (self.degrees >= 0 && self.degrees < 90) {
                return 1;
            }
            if (self.degrees >= 90 && self.degrees < 180) {
                return 2;
            }
            if (self.degrees >= 180 && self.degrees < 270) {
                return 3;
            }
            if (self.degrees >= 270 && self.degrees < 360) {
                return 4;
            }
        };
        
        this.setValue(degrees);
    }
};