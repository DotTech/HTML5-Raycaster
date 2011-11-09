/*
//  Namespace:      Raycaster.RenderEngine
//  Description:    The render engine class contains all methods required for drawing the 3D world and related stuff.
//                  Reasons for making this non-static is that the instance needs to be created after the canvas context is created.
//                  Raycaster.start() creates the RenderEngine instances which is accessible through Raycaster.engine
//
//  Public methods: redraw()
//                  update()
*/
Raycaster.RenderEngine = function()
{
    var context = Raycaster.Objects.context,
        constants = Raycaster.Constants,
        objects = Raycaster.Objects,
        drawing = Raycaster.Drawing,
        classes = Raycaster.Classes,
        raycasting = Raycaster.Raycasting,
        lastFpsUpdate = new Date().getTime();
    
    // Calculate viewport distance and angle between casted rays
    constants.distanceToViewport = Math.round(constants.screenWidth / 2 / Math.tan(constants.fieldOfView / 2 * (Math.PI / 180)));
    constants.angleBetweenRays   = Number(constants.fieldOfView / constants.screenWidth);
    
    
    /************* / Rendering of secondary stuff (sky, floor, map) / *****************/
    
    // Writes debug information to the screen
    var drawDebugInfo = function()
    {
        if (constants.displayDebugInfo) {
            var elapsed = new Date().getTime() - lastFpsUpdate,
                fps = Math.round(1000 / elapsed),
                fpsText = fps + " fps";
            
            Raycaster.Drawing.text(fpsText, 590, 10, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
            lastFpsUpdate = new Date().getTime();
            
            Raycaster.Drawing.text("X: " + Math.round(objects.player.x) + " Y: " + Math.round(objects.player.y) + " Z: " + Math.round(objects.player.z), 530, 30, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
            Raycaster.Drawing.text("A: " + objects.player.angle.degrees, 590, 50, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
        }
    }
    
    // Draw the 2D top-view of the level
    var drawMiniMap = function() 
    {
        if (objects.settings.renderMiniMap()) {
            // Map is smaller than world, determine shrink factor
            var shrinkFactor = 5,
                mapOffsetX = 0,
                mapOffsetY = 0,
                odd = false;
            
            context.globalAlpha = 0.6;
            
            // Draw white background
            drawing.square(mapOffsetX, mapOffsetY, 
                           160, 160,
                           drawing.colorRgb(255, 255, 255));
            
            // Draw elevations
            for (var i in Raycaster.Objects.Level.elevations) {
                var elevation = Raycaster.Objects.Level.elevations[i],
                    area = elevation.area;
                    
                drawing.square(area.x1 / shrinkFactor, area.y1 / shrinkFactor, (area.x2 - area.x1) / shrinkFactor, (area.y2 - area.y1) / shrinkFactor, drawing.colorRgb(255, 0, 0));
            }
            
            // Draw the walls
            for (var i in Raycaster.Objects.Level.walls) {
                var wall = Raycaster.Objects.Level.walls[i];
                drawing.line(mapOffsetX + wall.x1 / shrinkFactor, mapOffsetY + wall.y1 / shrinkFactor, 
                             mapOffsetX + wall.x2 / shrinkFactor, mapOffsetY + wall.y2 / shrinkFactor, drawing.colorRgb(0, 0, 0));
            }
            
            // Draw sprites
            for (var i in Raycaster.Objects.Level.sprites) {
                var sprite = Raycaster.Objects.Level.sprites[i];
                drawing.circle(mapOffsetX + sprite.x / shrinkFactor, mapOffsetY + sprite.y / shrinkFactor, 2, drawing.colorRgb(0, 255, 0));
            }
            
            // Draw player
            var playerX = Math.floor(objects.player.x / shrinkFactor),
                playerY = Math.floor(objects.player.y / shrinkFactor);
             
            drawing.circle(mapOffsetX + playerX, mapOffsetY + playerY, 3, drawing.colorRgb(255, 0, 0));
            
            // Visualize the viewing range on the map
            var angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2),
                rayStep = 10;
            
            for (var i = 0; i < constants.screenWidth; i += rayStep) 
            {
                var deltaX = Math.floor(Math.cos(angle.radians) * (Math.abs(200) / shrinkFactor)),
                    deltaY = Math.floor(Math.sin(angle.radians) * (Math.abs(200) / shrinkFactor));
            
                drawing.line(mapOffsetX + playerX, mapOffsetY + playerY, 
                             playerX + deltaX, playerY - deltaY, drawing.colorRgb(200, 200, 0));
                
                angle.turn(-constants.angleBetweenRays * rayStep);
            }
            
            context.globalAlpha = 1;
        }
    };
    
    // Draw sky background
    var drawSky = function()
    {
        if (objects.settings.renderSky()) {
            var skyX = objects.skyImage.width - parseInt(objects.player.angle.degrees * (objects.skyImage.width / 360)),
                skyWidth = constants.screenWidth,
                leftOverWidth = 0;
                
            if (skyX + skyWidth > objects.skyImage.width) {
                leftOverWidth = skyX + skyWidth - objects.skyImage.width;
                skyWidth -= leftOverWidth;
            }
            
            if (skyWidth > 0) {
                context.drawImage(objects.skyImage,
                                  skyX, 0, skyWidth, constants.screenHeight / 2,
                                  0, 0, skyWidth, constants.screenHeight / 2);
            }

            if (leftOverWidth > 0) {
                context.drawImage(objects.skyImage,
                                  0, 0, leftOverWidth, constants.screenHeight / 2,
                                  skyWidth, 0, leftOverWidth, constants.screenHeight / 2);
            }
        }
    }
    
    // Draws the gradient for the floor
    var drawFloorGradient = function()
    {
        var context = Raycaster.Objects.context,
            gradient = context.createLinearGradient(0, constants.screenHeight / 2, 0, constants.screenHeight);
        
        gradient.addColorStop(0, drawing.colorRgb(20, 20, 20));
        gradient.addColorStop(0.25, drawing.colorRgb(40, 40, 40));
        gradient.addColorStop(0.6, drawing.colorRgb(100, 100, 100));
        gradient.addColorStop(1, drawing.colorRgb(130, 130, 130));
        
        context.fillStyle = gradient;
        context.fillRect(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2);
    }
    
    // Perform floor casting for scanline
    // Floor casting is too slow at this point..
    // The calculations alone lose us a lot of FPS, not even to speak about drawing the pixels...
    // (thats why there is drawFloorGradient() to use as alternative)
    var drawFloor = function(vscan, startY, intersection)
    {
        var step = 1;
        
        // Formula from: http://lodev.org/cgtutor/raycasting2.html
        if (objects.settings.renderFloor() && vscan % step == 0) {
            
            var floorTexture = objects.textures[Raycaster.Objects.Level.floorTextureId];
            
            for (var y = startY; y < constants.screenHeight; y += step) {
                var curdist = constants.screenHeight / (2 * y - constants.screenHeight);
            
                var weight = curdist / intersection.distance,
                    floorX = weight * intersection.x + (1 - weight) * objects.player.x,
                    floorY = weight * intersection.y + (1 - weight) * objects.player.y,
                    textureX = parseInt(floorX * floorTexture.width) % floorTexture.width,
                    textureY = parseInt(floorY * floorTexture.height) % floorTexture.height;
                    
                context.drawImage(floorTexture, 
                                  textureX, textureY, 1, 1,
                                  vscan, y, step, step);
                
                //if (objects.settings.renderLighting() && curdist > 100) {
                //    drawing.lineSquare(vscan, y, vscan + 1, y + 1, drawing.colorRgba(0, 0, 0, calcDistanceOpacity(curdist)))
                //}
            }
        }
    };
    
    /****************** / Core rendering methods (walls, sprites) / *****************/
    
    // Search for objects in given direction and draw the vertical scanline for them.
    // All objects in visible range will be drawn in order of distance.
    var drawObjects = function(vscan, angle)
    {
        var intersections = raycasting.findObjects(angle, vscan);
        
        // Draw walls for each found intersection
        for (var i = 0; i < intersections.length; i++) {
            var intersection = intersections[i];
            if (intersection.isSprite) {
                drawSprite(vscan, intersection);
            }
            else {
                drawWall(vscan, intersection);
            }
        }
        
        // Floor casting (still way too slow)
        //drawFloor(vscan, drawParams.dy2, intersection);
    }
    
    // Draw the vertical slice for a wall
    var drawWall = function(vscan, intersection)
    {
        var drawParams = intersection.drawParams;
            
        if (objects.settings.renderTextures()) {
            // Draw wall slice with texture
            context.drawImage(drawParams.texture, 
                              intersection.textureX, drawParams.sy1, 1, drawParams.sy2 - drawParams.sy1,
                              vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);
        }
        else {
            // Draw without textures
            drawing.lineSquare(vscan, drawParams.dy1,  1, drawParams.dy2, drawing.colorRgb(128, 0, 0));
        }
        
        // Make walls in the distance appear darker
        if (objects.settings.renderLighting() && intersection.distance > constants.startFadingAt) {
            drawing.lineSquare(vscan, drawParams.dy1, 1, drawParams.dy2, drawing.colorRgba(0, 0, 0, calcDistanceOpacity(intersection.distance)))
        }
    }
    
    // Draw the vertical slice for a sprite
    var drawSprite = function(vscan, intersection)
    {
        if (objects.settings.renderSprites()) {
            var drawParams = intersection.drawParams;
                
            context.drawImage(drawParams.texture, 
                              intersection.textureX, drawParams.sy1, 1, drawParams.sy2 - drawParams.sy1,
                              vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);

            // Make sprites in the distance appear darker
            if (objects.settings.renderLighting() && intersection.distance > constants.startFadingAt) {
                var opacity = calcDistanceOpacity(intersection.distance);
                
                // There is a black image mask of every sprite located in the sprites array, one index after the original sprite.
                // Draw the mask over the sprite using the calculated opacity
                if (opacity > 0) {
                    context.globalAlpha = opacity;
                    context.drawImage(objects.sprites[intersection.resourceIndex + 1], 
                                      intersection.textureX, drawParams.sy1, 1, drawParams.sy2 - drawParams.sy1,
                                      vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);
                    context.globalAlpha = 1;
                }
            }
        }
    }
    
    // Calculates the opacity for the black overlay image that is used to make objects in the distance appear darker
    var calcDistanceOpacity = function(distance) 
    {
        var colorDivider = Number(distance / (constants.startFadingAt * 1.5)); 
        colorDivider = (colorDivider > 5) ? 5 : colorDivider;
        
        return Number(1 - 1 / colorDivider);
    };
    
    // Draw 3D representation of the world
    var drawWorld = function()
    {
        // Draw solid floor and ceiling
        drawing.clear();
        drawing.square(0, 0, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(60, 60, 60));
        drawing.square(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(120, 120, 120));
        
        // Draw sky and floor (floorcasting is disabled)
        drawSky();
        drawFloorGradient();
        
        var angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2);
        
        // Render the walls
        for (var vscan = 0; vscan < constants.screenWidth; vscan++)  {
            drawObjects(vscan, angle);
            angle.turn(-constants.angleBetweenRays);
        }
    };
    
    // Calculates if the player is standing inside an elevated area and returns the elevation
    // If elevation has changed we need to update the player's Z coord
    var updateElevation = function() 
    {
        for (var i in Raycaster.Objects.Level.elevations) {
            var elevation = Raycaster.Objects.Level.elevations[i],
                area = elevation.area;

            if (objects.player.x >= area.x1 && objects.player.x <= area.x2 &&   
                objects.player.y >= area.y1 && objects.player.y <= area.y2) 
            {
                objects.player.z = elevation.height;
                return;
            }
        }
        
        objects.player.z = 0;
    };
    
    /****************** / Public methods / *****************/
    // Tell renderengine that a redraw is required
    var redraw = function()
    {
        objects.redrawScreen = true;
    }
    
    // Execute all rendering tasks
    var update = function()
    {
        if (objects.redrawScreen) {
            updateElevation();
            drawWorld();
            drawMiniMap();
            drawDebugInfo();
            
            objects.redrawScreen = false;
        }
    }
    
    // Expose public members
    return {
        redraw: redraw,
        update: update
    };
};