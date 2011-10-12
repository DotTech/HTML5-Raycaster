// The render engine class contains all methods required for drawing the 3D world and related stuff.
// Reasons for making this non-static is that the instance needs to be created after the canvas context is created.
// Raycaster.start() creates the RenderEngine instances which is accessible through Raycaster.engine
Raycaster.RenderEngine = function()
{
    var context = Raycaster.Objects.context,
        constants = Raycaster.Constants,
        objects = Raycaster.Objects,
        drawing = Raycaster.Drawing,
        classes = Raycaster.Classes,
        level = Raycaster.Objects.Level,
        lastFpsUpdate = new Date().getTime();
    
    // Calculate viewport distance once
    Raycaster.Constants.distanceToViewport = Math.round(Raycaster.Constants.screenWidth / 2 / Math.tan(Raycaster.Constants.fieldOfView / 2 * (Math.PI / 180)));
    
    /****************** / Private methods / *****************/
    // Draw the FPS counter
    var drawFPS = function()
    {
        var elapsed = new Date().getTime() - lastFpsUpdate,
            fps = Math.round(1000 / elapsed),
            fpsText = fps + " fps";
        
        Raycaster.Drawing.text(fpsText, 590, 10, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.fpsFont);
        lastFpsUpdate = new Date().getTime();
    }
    
    // Draw the mini map
    var drawMiniMap = function() 
    {
        if (objects.settings.renderMiniMap()) {
            // Map is smaller than world, determine shrink factor
            var shrinkFactor = 10,
                mapOffsetX = 0,
                mapOffsetY = 0,
                odd = false;
            
            // Draw white background
            drawing.square(mapOffsetX, mapOffsetY, 
                           80, 80,
                           drawing.colorRgb(255, 255, 255));
            
            // Draw the walls
            for (var i in level.walls) {
                var wall = level.walls[i];
                drawing.line(mapOffsetX + wall.x1 / shrinkFactor, mapOffsetY + wall.y1 / shrinkFactor, 
                             mapOffsetX + wall.x2 / shrinkFactor, mapOffsetY + wall.y2 / shrinkFactor, drawing.colorRgb(0, 0, 0));
            }
            
            // Draw player
            var playerX = Math.floor(objects.player.x / shrinkFactor),
                playerY = Math.floor(objects.player.y / shrinkFactor);
             
            drawing.circle(mapOffsetX + playerX, mapOffsetY + playerY, 3, drawing.colorRgb(255, 0, 0));
            
            // Visualize the raycasting on the map
            var angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2),
                rayStep = 10;
            
            for (var i = 0; i < constants.screenWidth; i += rayStep) 
            {
                var intersection = Raycaster.Raycasting.findWall(angle),
                    deltaX = Math.floor(Math.cos(angle.toRadians()) * (Math.abs(intersection.distance) / shrinkFactor)),
                    deltaY = Math.floor(Math.sin(angle.toRadians()) * (Math.abs(intersection.distance) / shrinkFactor));
                
                drawing.line(mapOffsetX + playerX, mapOffsetY + playerY, 
                             playerX + deltaX, playerY - deltaY, drawing.colorRgb(200, 200, 0));
                
                angle.turn(-constants.angleBetweenRays * rayStep);
            }
        }
    };
    
    // Draw sky background
    var drawSky = function()
    {
        var skyX = objects.skyImage.width - parseInt(objects.player.angle.degrees * (objects.skyImage.width / 360)),
            skyWidth = constants.screenWidth,
            leftOverWidth = 0;
            
        if (skyX + skyWidth > objects.skyImage.width) {
            leftOverWidth = skyX + skyWidth - objects.skyImage.width;
            skyWidth -= leftOverWidth;
        }
        
        context.drawImage(objects.skyImage,
                          skyX, 0, skyWidth, constants.screenHeight / 2,
                          0, 0, skyWidth, constants.screenHeight / 2);

        if (leftOverWidth > 0) {
            context.drawImage(objects.skyImage,
                              0, 0, leftOverWidth, constants.screenHeight / 2,
                              skyWidth, 0, leftOverWidth, constants.screenHeight / 2);
        }
    }
    
    // Floor casting is too slow at this point
    // For that reason we use a gradient for the floor
    var drawFloor = function()
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
    
    // Draw a vertical slice of a wall found at specified intersection
    // TODO: Description, refactor method
    var drawWall = function(vscan, angle)
    {
        var intersection = Raycaster.Raycasting.findWall(angle);
        
        if (intersection) {
        
            // Remove distortion (counter fishbowl effect)
            var distortRemove = new classes.Angle(constants.fieldOfView / 2);
            distortRemove.turn(-constants.angleBetweenRays * vscan);
            intersection.distance *= Math.cos(distortRemove.toRadians());
            
            // Use distance to determine the size of the wall slice
            var wallHeight = Math.floor(constants.defaultWallHeight / intersection.distance * constants.distanceToViewport);
            
            // If a wall slice is larger than the viewport height, we only need the visible section
            // skipPixels indicates how many pixels from top and bottom towards the center can be skipped during rendering
            var skipPixels = wallHeight > constants.screenHeight ? (wallHeight - constants.screenHeight) / 2 : 0,
                scanlineStartY = parseInt(objects.centerOfScreen.y - (wallHeight - skipPixels * 2) / 2),
                scanlineEndY = parseInt(objects.centerOfScreen.y + (wallHeight - skipPixels * 2) / 2);
            
            // Prevent the coordinates from being off screen
            scanlineStartY = scanlineStartY < 0 ? 0 : scanlineStartY;
            scanlineEndY = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;
            
            if (objects.settings.renderTextures()) {
                // The visible scale of a wall compared to its original size
                var wallsGridcale = wallHeight / constants.defaultWallHeight;
                
                var offsetY = (skipPixels > 0) ? skipPixels / wallsGridcale : 0;
                if (offsetY >= constants.defaultWallHeight / 2) {
                    offsetY = constants.defaultWallHeight / 2 - 1;
                }
                
                // Draw the texture
                context.drawImage(objects.textures[intersection.resourceIndex], 
                                  intersection.textureX, offsetY, 1, constants.defaultWallHeight - offsetY * 2,
                                  vscan, scanlineStartY, 1, scanlineEndY - scanlineStartY);
            }
            else {
                // Draw without textures
                drawing.lineSquare(vscan, scanlineStartY,  1, scanlineEndY, drawing.colorRgb(128, 0, 0));
            }

            // Make walls in the distance appear darker
            if (objects.settings.renderLighting()) {
                if (intersection.distance > 100) {
                    var colorDivider = parseFloat(intersection.distance / 200); 
                    colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                    var opacity = parseFloat(1 - 1 / colorDivider);
                    
                    drawing.lineSquare(vscan, scanlineStartY, 1, scanlineEndY, drawing.colorRgba(0, 0, 0, opacity))
                }
            }
        }
    }
    
    // TODO: Description, refactor method
    var drawSprite = function(vscan, angle)
    {
        var intersection = Raycaster.Raycasting.findSprite(angle);
        
        if (intersection) {
            
            var lindex = intersection.resourceIndex,    // index for spriteLocation array
                sindex = level.sprites[lindex].id;      // index for sprites array
            
            // Remove distortion (counter fishbowl effect)
            var distortRemove = new classes.Angle(constants.fieldOfView / 2);
            distortRemove.turn(-constants.angleBetweenRays * vscan);
            intersection.distance *= Math.cos(distortRemove.toRadians());
            
            // Use distance to determine the size of the sprite
            var spriteWidth = Math.floor(objects.sprites[sindex].width / intersection.distance * constants.distanceToViewport),
                spriteHeight = Math.floor(objects.sprites[sindex].height / intersection.distance * constants.distanceToViewport);
                
            // If a wall slice is larger than the viewport height, we only need the visible section
            // skipPixels indicates how many pixels from top and bottom towards the center can be skipped during rendering
            var skipPixels = spriteHeight > constants.screenHeight ? (spriteHeight - constants.screenHeight) / 2 : 0,
                spriteStartY = parseInt(objects.centerOfScreen.y - (spriteHeight - skipPixels * 2) / 2),
                spriteEndY = parseInt(objects.centerOfScreen.y + (spriteHeight - skipPixels * 2) / 2);
            
            // Prevent the coordinates from being off screen
            spriteStartY = spriteStartY < 0 ? 0 : spriteStartY;
            spriteEndY = spriteEndY > constants.screenHeight ? constants.screenHeight : spriteEndY;
            
            // The visible scale of a sprite compared to its original size
            var spriteScale = spriteHeight / objects.sprites[sindex].height;
            
            var offsetY = (skipPixels > 0) ? skipPixels / spriteScale : 0;
            if (offsetY >= objects.sprites[sindex].height / 2) {
                offsetY = objects.sprites[sindex].height / 2 - 1;
            }
            
            context.drawImage(objects.sprites[sindex], 
                              intersection.textureX, offsetY, 1, objects.sprites[sindex].height - offsetY * 2,
                              vscan, spriteStartY, 1, spriteEndY - spriteStartY);
                                   
            //objects.context.drawImage(objects.sprites[sindex], 
            //                          0, offsetY, objects.sprites[sindex].width, objects.sprites[sindex].height - offsetY * 2,
            //                          vscan, spriteStartY, spriteWidth, spriteEndY - spriteStartY);
            
            // Make sprites in the distance appear darker
            if (objects.settings.renderLighting()) {
                if (intersection.distance > 100) {
                    // Calculate opacity
                    var colorDivider = parseFloat(intersection.distance / 200); 
                    colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                    var opacity = parseFloat(1 - 1 / colorDivider);
                    
                    // Draw a black mask version of the sprite using the calculated opacity
                    if (opacity > 0) {
                        context.globalAlpha = opacity;
                        context.drawImage(objects.sprites[sindex + 1], 
                                          intersection.textureX, offsetY, 1, objects.sprites[sindex].height - offsetY * 2,
                                          vscan, spriteStartY, 1, spriteEndY - spriteStartY);
                        context.globalAlpha = 1;
                    }
                }
            }
        }
    }
    
    // Draw 3D representation of the world
    var drawWorld = function()
    {
        // Draw solid floor and ceiling
        drawing.clear();
        drawing.square(0, 0, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(60, 60, 60));
        drawing.square(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(120, 120, 120));

        // Draw sky background image
        if (objects.settings.renderSky()) {
            drawSky();
        }
        
        // Draw floor gradient
        drawFloor();
        
        var angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2);
        
        // Draw visible walls
        for (var vscan = 0; vscan < constants.screenWidth; vscan++) 
        {
            drawWall(vscan, angle);
            //drawSprite(vscan, angle);
            angle.turn(-constants.angleBetweenRays);
        }
        
        angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2);
        
        // Draw visible sprites
        for (var vscan = 0; vscan < constants.screenWidth; vscan++) 
        {
            drawSprite(vscan, angle);
            angle.turn(-constants.angleBetweenRays);
        }
    };
    
    /****************** / Public methods / *****************/
    // Tell renderer that a redraw is required
    var redraw = function()
    {
        objects.redrawScreen = true;
    }
    
    // Execute all rendering tasks
    var update = function()
    {
        if (objects.redrawScreen) {
            drawWorld();
            drawMiniMap();
            drawFPS();
            objects.redrawScreen = false;
        }
    }
    
    // Expose public members
    return {
        redraw: redraw,
        update: update
    };
};