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
            px2 = player.x + Math.cos(angle.toRadians()),
            py2 = player.y - Math.sin(angle.toRadians());
        
        // Some number we need to solve our equation
        var f1 = ((line.x2 - line.x1) * (py1 - line.y1) - (line.y2 - line.y1) * (px1 - line.x1)) /
                 ((line.y2 - line.y1) * (px2 - px1) - (line.x2 - line.x1) * (py2 - py1));
        
        // Calculate where the ray intersects with the line
        var i = new Raycaster.Classes.Intersection();
            i.x = px1 + f1 * (px2 - px1),
            i.y = py1 + f1 * (py2 - py1),
            roundX = Math.round(i.x),
            roundY = Math.round(i.y);
        
        // Check if intersection is located on the line
        // Use rounded coordinates here!
        var hit = true;
            linex1 = Math.round(line.x1),
            linex2 = Math.round(line.x2),
            liney1 = Math.round(line.y1),
            liney2 = Math.round(line.y2);
        
        // When looking for walls we want to round the coordinates before comparing them
        if (!dontRoundCoords) {
            hit = (linex1 >= linex2) 
                ? roundX <= linex1 && roundX >= linex2
                : roundX >= linex1 && roundX <= linex2;
            if (hit) {
                hit = (liney1 >= liney2)
                    ? roundY <= liney1 && roundY >= liney2
                    : roundY >= liney1 && roundY <= liney2;
            }
        }
        // When looking for sprites we dont want the coords rounded, otherwise the result is not exact enough
        else {
            hit = (line.x1 >= line.x2) 
                ? i.x <= line.x1 && i.x >= line.x2
                : i.x >= line.x1 && i.x <= line.x2;
            if (hit) {
                hit = (line.y1 >= line.y2)
                    ? i.y <= line.y1 && i.y >= line.y2
                    : i.y >= line.y1 && i.y <= line.y2;
            }
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
            i.distance = Math.abs(deltaX / Math.cos(angle.toRadians()));
        }
        else {
            i.distance = Math.abs(deltaY / Math.sin(angle.toRadians()));
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
            // Texture mapping
            // Determine which scanline of the texture to draw for this intersection
            var wallLine = level.walls[wallId],
                lengthToIntersection = Math.sqrt(Math.pow(Math.abs(wallLine.x1 - intersection.x), 2) + Math.pow(Math.abs(wallLine.y1 - intersection.y), 2));
            
            intersection.resourceIndex = level.walls[wallId].textureId;
            intersection.textureX = parseInt(lengthToIntersection % Raycaster.Objects.textures[intersection.resourceIndex].height);
            intersection.levelObjectId = wallId;
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
    
    // Expose public members
    return {
        findWalls : findWalls,
        findSprites: findSprites
    };
}();