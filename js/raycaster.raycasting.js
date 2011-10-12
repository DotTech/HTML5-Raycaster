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
    var getIntersection = function(line, angle) 
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
        hit = (line.x1 >= line.x2) 
            ? roundX <= line.x1 && roundX >= line.x2
            : roundX >= line.x1 && roundX <= line.x2;
        if (hit) {
            hit = (line.y1 >= line.y2)
                ? roundY <= line.y1 && roundY >= line.y2
                : roundY >= line.y1 && roundY <= line.y2;
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

    /****************** / Public methods / *****************/    
    // Find the wall that is closest to the player
    var findWall = function(angle)
    {
        var level = Raycaster.Objects.Level,
            intersection = false,
            index = 0;
        
        for (var i = 0; i < level.walls.length; i++) {
            // Find intersection point on current wall
            var c = getIntersection(level.walls[i], angle);
            
            // If wall distance is less than previously found walls, use it
            if (!intersection || c.distance < intersection.distance) {
                intersection = c;
                index = i;
            }
        }
        
        // Texture mapping
        // Determine which scanline of the texture to draw for this intersection
        var wallLine = level.walls[index],
            lengthToIntersection = Math.sqrt(Math.pow(Math.abs(wallLine.x1 - intersection.x), 2) + Math.pow(Math.abs(wallLine.y1 - intersection.y), 2));
        
        intersection.resourceIndex = level.walls[index].textureId;
        intersection.textureX = parseInt(lengthToIntersection % Raycaster.Objects.textures[intersection.resourceIndex].height);
        
        return intersection;
    }
    
    // Find the sprites that are in the players field of view
    var findSprite = function(angle)
    {
        var level = Raycaster.Objects.Level;
        
        for (var i = 0; i < level.sprites.length; i++) {
            // Create a imaginary plane on which the sprite is drawn
            // That way we can check for sprites in exactly the same way we check for walls
            var planeAngle = new Raycaster.Classes.Angle(angle.degrees - 90),
                x = level.sprites[i].x,
                y = level.sprites[i].y,
                sprite = Raycaster.Objects.sprites[level.sprites[i].id],
                delta = Raycaster.Utils.getDeltaXY(planeAngle, sprite.width / 2),
                plane = new Raycaster.Classes.Vector(x - Math.floor(delta.x), y + Math.floor(delta.y), 
                                                     x + Math.floor(delta.x), y - Math.floor(delta.y));

            // Find intersection point on the plane
            var intersection = getIntersection(plane, angle);
            
            if (intersection) {
                // Determine which scanline of the sprite image to draw for this intersection
                var lengthToIntersection = Math.sqrt(Math.pow(Math.abs(plane.x1 - intersection.x), 2) + Math.pow(Math.abs(plane.y1 - intersection.y), 2));

                intersection.textureX = parseInt(lengthToIntersection % sprite.width);
                intersection.resourceIndex = level.sprites[i].id;
                
                return intersection;
            }
        }
        
        return false;
    }
    
    // Expose public members
    return {
        findWall : findWall,
        findSprite: findSprite
    };
}();