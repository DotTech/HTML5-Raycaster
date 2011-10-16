/*
//  Namespace:      Raycaster.Raycasting
//  Description:    Functionality required for raycasting
//
//  Public methods: findWall(angle):    returns Intersection object or false
//                  findSprite(angle):  returns Intersection object or false
//                  getWallHeight:      returns height for wall at specified intersection
//                  getDeltaXY:         returns difference in x and y for a distance at specified angle
*/
Raycaster.Raycasting = function()
{
    var objects = Raycaster.Objects,
        player = objects.player,
        classes = Raycaster.Classes,
        constants = Raycaster.Constants,
        fishbowlFixValue = 0;
    
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
    
    // Calculates the length of the hypotenuse side (angled side) of a triangle
    // adjacentLength: length of the side adjacent to the angle
    // oppositeLength: length of the side opposite of the angle
    var getHypotenuseLength = function(adjacentLength, oppositeLength)
    {
        return Math.sqrt(Math.pow(Math.abs(adjacentLength), 2) + Math.pow(Math.abs(oppositeLength), 2));
    }
    
    // Calculate value needed to manipulate distance to counter "fishbowl effect"
    var setFishbowlFixValue = function(vscan)
    {
        var distortRemove = new classes.Angle(constants.fieldOfView / 2);
        distortRemove.turn(-constants.angleBetweenRays * vscan);
        
        fishbowlFixValue = Math.cos(distortRemove.radians);
    };
    
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
        var i = classes.Intersection();
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
        
        if (!dontRoundCoords) {
            //i.x = intersX;
            //i.y = intersY;
        }
        
        return i;
    };

    // Texture mapping routine for walls
    // Determines which scanline of the texture to draw for this intersection
    var setTextureParams = function(intersection)
    {
        if (objects.settings.renderTextures()) {
            var wall = Raycaster.Objects.Level.walls[intersection.levelObjectId],
                length = getHypotenuseLength(wall.x1 - wall.x2, wall.y1 - wall.y2),
                lengthToIntersection = getHypotenuseLength(wall.x1 - intersection.x, wall.y1 - intersection.y);

            intersection.resourceIndex = Raycaster.Objects.Level.walls[intersection.levelObjectId].textureId;
            
            var textureWidth = objects.textures[intersection.resourceIndex].width,
                textureHeight = objects.textures[intersection.resourceIndex].height;
            
            // Wall textures are stretched in height and repeated over the width
            if (wall.maxHeight != textureHeight) {
                lengthToIntersection *= textureHeight / wall.maxHeight;
            }
            
            intersection.textureX = parseInt(lengthToIntersection % objects.textures[intersection.resourceIndex].width);
        }
    };
    
    /*
    // Method:      Raycaster.Raycasting.setVSliceDrawParams
    // Description:
    //   Once we know the distance to a wall or sprite, this function calculates the parameters 
    //   that are required to draw the vertical slice for it.
    //   It also accounts for leaving away pixels of the object if it exceeds the size of the viewport.
    //   Returns FALSE if the intersection is not visible to the player
    //
    // Input parameters:
    // - intersection:  intersection with the object to draw
    //
    // The following parameters are calculated:
    // - dy1:       Starting point of the slice on the destination (the screen) 
    // - dy2:       End point of the slice on the destination
    // - sy1:       Starting point of the slice on the source (the texture image)
    // - sy2:       End point of the slice on the source
    // - texture:   Image object containing the texture to draw
    */
    var setVSliceDrawParams = function(intersection)
    {   
        var scanlineOffsY = 0,                              // Additional Y-offset for the scanline (used in sprites)
            distance =      intersection.distance * fishbowlFixValue, // Distance to the intersection
            rindex =        intersection.resourceIndex,     
            lindex =        intersection.levelObjectId,
            levelObject =   intersection.isSprite           // Level object definition (wall or sprite)
                                ? Raycaster.Objects.Level.sprites[lindex] 
                                : Raycaster.Objects.Level.walls[lindex],
            texture =       intersection.isSprite           // Image object containing the texture to draw
                                ? objects.sprites[rindex] 
                                : objects.textures[rindex],
            objHeight =     intersection.isSprite           // Original height of the object at current intersection
                                ? texture.height 
                                : getWallHeight(intersection),
            objMaxHeight =  intersection.isSprite           // Maximum possible height of the object (used in walls with angled height)
                                ? objHeight 
                                : levelObject.maxHeight,
            objectZ =       intersection.isSprite           // Z-position of the object at current intersection
                                ? levelObject.z
                                : getWallZ(intersection),
            height =        Math.floor(objHeight / distance * constants.distanceToViewport);    // Height of the object on screen
        
        // horizonOffset is used for aligning walls and objects correctly on the horizon.
        // Without this value, everything would always be vertically centered.
        var eyeHeight = player.height * 0.75,
            base = (eyeHeight + player.z - objectZ) * 2,
            horizonOffset = (height - Math.floor(base / distance * constants.distanceToViewport)) / 2;
        
        // Determine where to start and end the scanline on the screen
        var scanlineEndY = parseInt((objects.centerOfScreen.y - horizonOffset) + height / 2),
            scanlineStartY = scanlineEndY - height;
        
        // Prevent the coordinates from being off-screen
        intersection.drawParams = classes.VSliceDrawParams();
        intersection.drawParams.dy1 = scanlineStartY < 0 ? 0 : scanlineStartY;
        intersection.drawParams.dy2 = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;
        intersection.drawParams.texture = texture;
        
        if (intersection.drawParams.dy2 < 0 || intersection.drawParams.dy1 > constants.screenHeight) {
            return false;
        }
        
        // Now that we've determined the size and location of the scanline,
        // we calculate which part of the texture image we need to render onto the scanline
        // When part of the object is located outside of the screen we dont need to copy that part of the texture image.
        if ((!intersection.isSprite && objects.settings.renderTextures())
            || (intersection.isSprite && objects.settings.renderSprites()))        
        {
            var scale = height / texture.height, // Height ratio of the object compared to its original size
                srcStartY = 0,                   // Start Y coord of source image data
                srcEndY = texture.height;        // End y coord of source image data
            
            // Compensate for bottom part being offscreen
            if (scanlineEndY > constants.screenHeight) {
                var remove = (scanlineEndY - constants.screenHeight) / scale;
                srcEndY -= remove;
            }
            
            // Compensate for top part being offscreen
            if (scanlineStartY < 0) {
                var remove = Math.abs(scanlineStartY) / scale;
                srcStartY += remove;
            }
            
            // Prevent the texture from appearing skewed when wall height is angled
            // This is bugged:
            /*if (objMaxHeight > objHeight) {
                var maxHeight = Math.floor(objMaxHeight / distance * constants.distanceToViewport),
                    diff = Math.abs(maxHeight - height),
                    scale = maxHeight / texture.height;
                    
                srcStartY += Math.floor(diff / scale);
            }*/
            
            intersection.drawParams.sy1 = srcStartY;
            intersection.drawParams.sy2 = srcEndY;
            
            if (intersection.drawParams.sy2 <= intersection.drawParams.sy1) {
                return false;
            }
        }
        
        return true;
    }
    
    // Walls have a start and end height
    // This method calculates the height of a wall at a specific intersection
    var getWallHeight = function(intersection)
    {
        var wall = Raycaster.Objects.Level.walls[intersection.levelObjectId];
        
        if (wall.h1 == wall.h2) {
            return wall.h1;
        }
        
        var length = getHypotenuseLength(wall.x1 - wall.x2, wall.y1 - wall.y2),
            slope = (wall.h2 - wall.h1) / length,
            lengthToIntersection = getHypotenuseLength(wall.x1 - intersection.x, wall.y1 - intersection.y),
            height = wall.h1 + (lengthToIntersection * slope);
        
        return height;
    }
    
    // Walls have a start and end Z position
    // This method calculates the Z pos of a wall at a specific intersection
    var getWallZ = function(intersection)
    {
        var wall = Raycaster.Objects.Level.walls[intersection.levelObjectId];
        
        if (wall.z1 == wall.z2) {
            return wall.z1;
        }
        
        var length = getHypotenuseLength(wall.x1 - wall.x2, wall.y1 - wall.y2),
            slope = (wall.z2 - wall.z1) / length,
            lengthToIntersection = getHypotenuseLength(wall.x1 - intersection.x, wall.y1 - intersection.y),
            z = wall.z1 + (lengthToIntersection * slope);
        
        return z;
    }
    
    // Find intersection on a specific sprite that is in the players field of view
    var findSprite = function(angle, spriteId)
    {
        // Create a imaginary plane on which the sprite is drawn
        // That way we can check for sprites in exactly the same way we check for walls
        var planeAngle = new classes.Angle(angle.degrees - 90),
            x = Raycaster.Objects.Level.sprites[spriteId].x,
            y = Raycaster.Objects.Level.sprites[spriteId].y,
            sprite = objects.sprites[Raycaster.Objects.Level.sprites[spriteId].id],
            delta = getDeltaXY(planeAngle, (sprite.width - 1) / 2),
            plane = new classes.Vector(x - delta.x, y + delta.y, 
                                       x + delta.x, y - delta.y);

        // Find intersection point on the plane
        var intersection = getIntersection(plane, angle, true);
        
        if (intersection) {
            // Determine which scanline of the sprite image to draw for this intersection
            var lengthToIntersection = getHypotenuseLength(plane.x1 - intersection.x, plane.y1 - intersection.y);
            
            intersection.textureX = Math.floor(lengthToIntersection);
            intersection.resourceIndex = Raycaster.Objects.Level.sprites[spriteId].id;
            intersection.levelObjectId = spriteId;
            intersection.isSprite = true;
            
            // Calculate the drawing parameters for the vertical scanline for this sprite
            // If the sprite is not visible for the player the method returns false
            if (!setVSliceDrawParams(intersection)) {
                return false;
            }
        }
        
        return intersection;
    };
    
    // Find intersection on a specific wall that is in the players field of view
    var findWall = function(angle, wallId)
    {
        // Find intersection point on current wall
        var intersection = getIntersection(Raycaster.Objects.Level.walls[wallId], angle);
        
        if (intersection) {
            intersection.levelObjectId = wallId;
            setTextureParams(intersection);
            
            // Calculate the drawing parameters for the vertical scanline for this wall
            // If the wall is not visible (elevation is too high or low) the method returns false
            if (!setVSliceDrawParams(intersection)) {
                return false;
            }
        }
        
        return intersection;
    };
    
    
    /****************** / Public methods / *****************/    
    // Find intersection for all the walls and sprites that are in viewing range.
    // Returns an array of intersection objects, sorted descending by distance
    var findObjects = function(angle, vscan)
    {
        var intersections = new Array();
        
        if (vscan) {
            setFishbowlFixValue(vscan);
        }
        
        // Find walls
        for (var i = 0; i < Raycaster.Objects.Level.walls.length; i++) {
            var intersection = findWall(angle, i);
            if (intersection) {
                intersections[intersections.length] = intersection;
            }
        }
        
        // Find sprites
        for (var i = 0; i < Raycaster.Objects.Level.sprites.length; i++) {
            var intersection = findSprite(angle, i);
            if (intersection) {
                intersections[intersections.length] = intersection;
            }
        }
        
        // Sort the objects by distance so that the once further away are drawn first
        intersections.sort(function(i1, i2) {
            return i2.distance - i1.distance;
        });
        
        return intersections;
    };
    
    // Calculate difference in X and Y for a distance at a specific angle
    var getDeltaXY = function(angle, distance) 
    {
        return new classes.Point(
            Math.cos(angle.radians) * distance,
            Math.sin(angle.radians) * distance
        );
    }
    
    // Expose public members
    return {
        findObjects : findObjects,
        getDeltaXY: getDeltaXY,
    };
}();