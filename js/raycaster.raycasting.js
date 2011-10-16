/*
//  Namespace:      Raycaster.Raycasting
//  Description:    Functionality required for raycasting
//
//  Public methods: findWall(angle):    returns Intersection object or false
//                  findSprite(angle):  returns Intersection object or false
*/
Raycaster.Raycasting = function()
{
    var player = Raycaster.Objects.player;
    
    /****************** / Private methods / *****************/
    // Determine wether an intersection is located in the quadrant we are looking at
    var correctQuadrant = function(intersection, angle)
    {
        var deltaX = player.x - intersection.x,
            deltaY = player.y - intersection.y,
            quadrant = 0;
        
        var roundedAngle = ~~ (0.5 + angle.degrees);
        if (roundedAngle == 0 || roundedAngle == 360) {
            return deltaX < 0;
        }
        else if (roundedAngle == 90) {
            return deltaY > 0;
        }
        else if (roundedAngle == 180) {
            return deltaX > 0;
        }
        else if (roundedAngle == 270) {
            return deltaY < 0;
        }
        
        if (deltaX < 0 && deltaY >= 0) quadrant = 1;
        if (deltaX >= 0 && deltaY > 0) quadrant = 2;
        if (deltaX > 0 && deltaY <= 0) quadrant = 3;
        if (deltaX <= 0 && deltaY < 0) quadrant = 4;
        
        return quadrant == angle.getQuadrant();
    }
    
    // Calculate intersection point on a line (wall)
    // Formula found here: http://paulbourke.net/geometry/lineline2d/
    var getIntersection = function(line, angle, dontRoundCoords) 
    {
        // Ray line
        var px1 = player.x,
            py1 = player.y,
            px2 = px1 + Math.cos(angle.radians),
            py2 = py1 - Math.sin(angle.radians);
        
        // Some number we need to solve our equation
        var f1 = ((line.x2 - line.x1) * (py1 - line.y1) - (line.y2 - line.y1) * (px1 - line.x1)) /
                 ((line.y2 - line.y1) * (px2 - px1) - (line.x2 - line.x1) * (py2 - py1));
        
        // Calculate where the ray intersects with the line
        var i = Raycaster.Classes.Intersection();
            i.x = px1 + f1 * (px2 - px1),
            i.y = py1 + f1 * (py2 - py1);
        
        // Check if intersection is located on the line
        var hit = true,
            intersX = i.x,
            intersY = i.y,
            linex1 = line.x1,
            linex2 = line.x2,
            liney1 = line.y1,
            liney2 = line.y2;
                
        // When looking for walls we want to round the intersection coordinates before comparing them
        // When looking for sprites we dont want those coords rounded, otherwise the result is not exact enough
        if (!dontRoundCoords) {
            // Round the numbers using bitwise rounding hack
            intersX = ~~ (0.5 + i.x);
            intersY = ~~ (0.5 + i.y);
        }
        
        hit = (linex1 >= linex2) 
            ? intersX <= linex1 && intersX >= linex2
            : intersX >= linex1 && intersX <= linex2;
        if (hit) {
            hit = (liney1 >= liney2)
                ? intersY <= liney1 && intersY >= liney2
                : intersY >= liney1 && intersY <= liney2;
        }
        
        // The formula will also return the intersections that are behind the player
        // Only return it if it's located in the correct quadrant
        if (!correctQuadrant(i, angle) || !hit) {
            return false;
        }
        
        // Calculate distance to the intersection
        var deltaX = player.x - i.x,
            deltaY = player.y - i.y;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            i.distance = Math.abs(deltaX / Math.cos(angle.radians));
        }
        else {
            i.distance = Math.abs(deltaY / Math.sin(angle.radians));
        }
        
        return i;
    };

    // Find intersection on a specific sprite that is in the players field of view
    var findSprite = function(angle, spriteId)
    {
        var level = Raycaster.Objects.Level;
        
        // Create a imaginary plane on which the sprite is drawn
        // That way we can check for sprites in exactly the same way we check for walls
        var planeAngle = new Raycaster.Classes.Angle(angle.degrees - 90),
            x = level.sprites[spriteId].x,
            y = level.sprites[spriteId].y,
            sprite = Raycaster.Objects.sprites[level.sprites[spriteId].id],
            delta = Raycaster.Utils.getDeltaXY(planeAngle, (sprite.width - 1) / 2),
            plane = new Raycaster.Classes.Vector(x - delta.x, y + delta.y, 
                                                 x + delta.x, y - delta.y);

        // Find intersection point on the plane
        var intersection = getIntersection(plane, angle, true);
        
        if (intersection) {
            
            // Check if the intersection is blocked by a wall
            // Don't return sprite intersection if it's blocked
            var wallints = findWalls(angle);
            if (wallints.length > 0 && wallints[wallints.length - 1].distance < intersection.distance) {
                return false;
            }
            
            // Determine which scanline of the sprite image to draw for this intersection
            var lengthToIntersection = Math.sqrt(Math.pow(Math.abs(plane.x1 - intersection.x), 2) + Math.pow(Math.abs(plane.y1 - intersection.y), 2));
            
            intersection.textureX = Math.floor(lengthToIntersection);
            intersection.resourceIndex = level.sprites[spriteId].id;
            intersection.levelObjectId = spriteId;
            
            return intersection;
        }
        
        return false;
    };
    
    // Find intersection on a specific wall that is in the players field of view
    var findWall = function(angle, wallId)
    {
        var level = Raycaster.Objects.Level,
            intersection = false;
        
        // Find intersection point on current wall
        var intersection = getIntersection(level.walls[wallId], angle);
        
        if (intersection) {
            intersection.levelObjectId = wallId;
            
            // Texture mapping routine
            // Determine which scanline of the texture to draw for this intersection
            if (Raycaster.Objects.settings.renderTextures()) {
                var wall = level.walls[wallId],
                    length = Math.sqrt(Math.pow(Math.abs(wall.x1 - wall.x2), 2) + Math.pow(Math.abs(wall.y1 - wall.y2), 2)),
                    lengthToIntersection = Math.sqrt(Math.pow(Math.abs(wall.x1 - intersection.x), 2) + Math.pow(Math.abs(wall.y1 - intersection.y), 2));

                intersection.resourceIndex = level.walls[wallId].textureId;
                
                var textureWidth = Raycaster.Objects.textures[intersection.resourceIndex].width,
                    textureHeight = Raycaster.Objects.textures[intersection.resourceIndex].height;
                
                // Wall textures are stretched in height and repeated over the width
                if (wall.maxHeight != textureHeight) {
                    lengthToIntersection *= textureHeight / wall.maxHeight;
                }
                
                intersection.textureX = parseInt(lengthToIntersection % Raycaster.Objects.textures[intersection.resourceIndex].width);
            }
        }
        
        return intersection;
    };
    
    
    /****************** / Public methods / *****************/    
    // Find intersection for all the walls that are in viewing range.
    // Returns an array of intersection objects, sorted descending by distance
    var findWalls = function(angle)
    {
        var intersections = new Array(),
            level = Raycaster.Objects.Level;
        
        // Test for every wall wether it intersects with the player's view angle
        for (var i = 0; i < level.walls.length; i++) {
            var intersection = findWall(angle, i);
            if (intersection) {
                intersections[intersections.length] = intersection;
            }
        }
        
        // Sort the walls by distance so that the once further away are drawn first
        intersections.sort(function(i1, i2) {
            return i2.distance - i1.distance;
        });
        
        return intersections;
    };
    
    // Find intersection for all sprites that are in viewing range.
    // Returns an array of intersection objects, sorted descending by distance
    var findSprites = function(angle)
    {
        var intersections = new Array(),
            level = Raycaster.Objects.Level;
        
        // Test for every sprite wether its intersects with player's view angle
        for (var i = 0; i < level.sprites.length; i++) {
            var intersection = findSprite(angle, i);
            if (intersection) {
                intersections[intersections.length] = intersection;
            }
        }
        
        // Sort the sprites by distance so that the once further away are drawn first
        intersections.sort(function(i1, i2) {
            return i2.distance - i1.distance;
        });
        
        return intersections;
    };
    
    // Walls have a start and end height
    // This method calculates the height of a wall at a specific intersection
    var getWallHeight = function(intersection)
    {
        var wall = Raycaster.Objects.Level.walls[intersection.levelObjectId];
        
        if (wall.h1 == wall.h2) {
            return wall.h1;
        }
        
        var length = Math.sqrt(Math.pow(Math.abs(wall.x1 - wall.x2), 2) + Math.pow(Math.abs(wall.y1 - wall.y2), 2)),
            slope = (wall.h2 - wall.h1) / length,
            lengthToIntersection = Math.sqrt(Math.pow(Math.abs(wall.x1 - intersection.x), 2) + Math.pow(Math.abs(wall.y1 - intersection.y), 2)),
            height = wall.h1 + (lengthToIntersection * slope);
        
        return height;
    }
    
    
    // Expose public members
    return {
        findWalls : findWalls,
        findSprites: findSprites,
        getWallHeight: getWallHeight
    };
}();