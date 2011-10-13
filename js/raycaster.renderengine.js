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
        level = Raycaster.Objects.Level,
        lastFpsUpdate = new Date().getTime();
    
    // Calculate viewport distance once
    Raycaster.Constants.distanceToViewport = Math.round(Raycaster.Constants.screenWidth / 2 / Math.tan(Raycaster.Constants.fieldOfView / 2 * (Math.PI / 180)));
    

    /************* / Rendering of secondary stuff (sky, floor, map) / *****************/
    
    // Writes debug information to the screen
    var drawDebugInfo = function()
    {
        var elapsed = new Date().getTime() - lastFpsUpdate,
            fps = Math.round(1000 / elapsed),
            fpsText = fps + " fps";
        
        Raycaster.Drawing.text(fpsText, 590, 10, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
        lastFpsUpdate = new Date().getTime();
        
        Raycaster.Drawing.text("X: " + Math.round(objects.player.x) + " Y: " + Math.round(objects.player.y), 550, 30, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
        Raycaster.Drawing.text("A: " + objects.player.angle.degrees, 590, 50, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
    }
    
    // Draw the 2D top-view of the level
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
    // Floor casting is too slow at this point, thats why i used a gradient
    var drawFloor = function()
    {
        if (objects.settings.renderFloor()) {
            var context = Raycaster.Objects.context,
                gradient = context.createLinearGradient(0, constants.screenHeight / 2, 0, constants.screenHeight);
            
            gradient.addColorStop(0, drawing.colorRgb(20, 20, 20));
            gradient.addColorStop(0.25, drawing.colorRgb(40, 40, 40));
            gradient.addColorStop(0.6, drawing.colorRgb(100, 100, 100));
            gradient.addColorStop(1, drawing.colorRgb(130, 130, 130));
            
            context.fillStyle = gradient;
            context.fillRect(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2);
        }
    }
    
    
    /****************** / Core rendering methods (walls, sprites) / *****************/
    
    // Search for a wall in given direction and draw the vertical scanline for it
    var drawWall = function(vscan, angle)
    {
        var intersection = Raycaster.Raycasting.findWall(angle);
        
        if (intersection) {
            // Correction to counter fishbowl effect
            intersection.distance = fixFishbowlEffect(vscan, intersection.distance);
            
            // Calculate what to draw for this scanline
            var texture = objects.textures[intersection.resourceIndex],
                drawParams = calcVSliceDrawParams(vscan, intersection.distance, constants.defaultWallHeight, texture);
            
            if (objects.settings.renderTextures()) {
                // Draw wall slice with texture
                context.drawImage(texture, 
                                  intersection.textureX, drawParams.sy1, 1, texture.height - drawParams.sy1,
                                  vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);
            }
            else {
                // Draw without textures
                drawing.lineSquare(vscan, drawParams.dy1,  1, drawParams.dy2, drawing.colorRgb(128, 0, 0));
            }
            
            // Make walls in the distance appear darker
            if (objects.settings.renderLighting()) {
                if (intersection.distance > 100) {
                    var colorDivider = parseFloat(intersection.distance / 200); 
                    colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                    var opacity = parseFloat(1 - 1 / colorDivider);
                    
                    drawing.lineSquare(vscan, drawParams.dy1, 1, drawParams.dy2, drawing.colorRgba(0, 0, 0, opacity))
                }
            }
        }
    }
    
    // Search for sprites in direction 'angle' and draw the vertical scanline for them
    var drawSprites = function(vscan, angle)
    {
        // Search for intersections with visible sprites
        // When multiple sprites are found, they are returned in drawing order (furthest first)
        var intersections = Raycaster.Raycasting.findSprites(angle);
        
        // Loop through sprites and check for intersections
        for (var i = 0; i < intersections.length; i++) {
            var intersection = intersections[i];
            
            // Counter fishbowl effect
            intersection.distance = fixFishbowlEffect(vscan, intersection.distance);
            
            // Calculate what to draw for this scanline
            var sprite = objects.sprites[intersection.resourceIndex],
                drawParams = calcVSliceDrawParams(vscan, intersection.distance, sprite.height, sprite);
                
            context.drawImage(sprite, 
                              intersection.textureX, drawParams.sy1, 1, sprite.height - drawParams.sy2,
                              vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);

            // Make sprites in the distance appear darker
            if (objects.settings.renderLighting()) {
                if (intersection.distance > 100) {
                    // Calculate opacity
                    var colorDivider = parseFloat(intersection.distance / 200); 
                    colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                    var opacity = parseFloat(1 - 1 / colorDivider);
                    
                    // There is a black image mask of every sprite located in the sprites array, one index after the original sprite.
                    // Draw the mask over the sprite using the calculated opacity
                    if (opacity > 0) {
                        context.globalAlpha = opacity;
                        context.drawImage(objects.sprites[intersection.resourceIndex + 1], 
                                          intersection.textureX, drawParams.sy1, 1, sprite.height - drawParams.sy2,
                                          vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);
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
        
        // Draw sky and floor
        drawSky();
        drawFloor();
        
        var angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2);
        
        // Render the walls
        for (var vscan = 0; vscan < constants.screenWidth; vscan++)  {
            drawWall(vscan, angle);
            angle.turn(-constants.angleBetweenRays);
        }
        
        // Render the sprites
        if (objects.settings.renderSprites()) {
            angle = new classes.Angle(objects.player.angle.degrees + constants.fieldOfView / 2);
            
            for (var vscan = 0; vscan < constants.screenWidth; vscan++) {
                drawSprites(vscan, angle);
                angle.turn(-constants.angleBetweenRays);
            }
        }
    };
    
    // Manipulate distance to counter "fishbowl effect"
    var fixFishbowlEffect = function(vscan, distance)
    {
        var distortRemove = new classes.Angle(constants.fieldOfView / 2);
        distortRemove.turn(-constants.angleBetweenRays * vscan);
        
        return distance * Math.cos(distortRemove.toRadians());
    };
    
    // Once we have the distance to the wall or sprite, this function calculates the parameters 
    // that are needed to draw the vertical slice for it.
    // It also accounts for leaving away parts of the wall if it exceeds the size of the viewport
    // The following parameters are calculated:
    // - dy1:   Starting point of the slice on the destination (the screen) 
    // - dy2:   End point of the slice on the destination
    // - sy1:   Starting point of the slice on the source (the texture image)
    // - sy2:   End point of the slice on the source
    // - yOff:  
    var calcVSliceDrawParams = function(vscan, distance, orginalHeight, texture)
    {
        // Use distance to determine the size of the slice
        var height = Math.floor(orginalHeight / distance * constants.distanceToViewport),
            params = new classes.VSliceDrawParams();
        
        // If the slice is larger than the viewport height, we only need the visible section
        // skipPixels indicates how many pixels from top and bottom towards the center can be skipped during rendering
        var skipPixels = height > constants.screenHeight ? (height - constants.screenHeight) / 2 : 0;
        
        // Now calculate where to start and end the drawing
        var scanlineStartY = parseInt(objects.centerOfScreen.y - (height - skipPixels * 2) / 2),
            scanlineEndY = parseInt(objects.centerOfScreen.y + (height - skipPixels * 2) / 2);
        
        // Prevent the coordinates from being off-screen
        params.dy1 = scanlineStartY < 0 ? 0 : scanlineStartY;
        params.dy2 = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;
        
        // Now calculate the params for the source image.
        // Determine the scale of the visible slice compared to its original size
        var scale = height / texture.height;
        
        // Calculate where to start copying from the source image
        var offsetY = (skipPixels > 0) ? skipPixels / scale : 0;
        if (offsetY >= texture.height / 2) {
            offsetY = texture.height / 2 - 1;
        }
        
        params.sy1 = offsetY;
        params.sy2 = offsetY * 2;
        
        return params;
    }
    
    
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
            drawWorld();
            drawMiniMap();
            //drawDebugInfo();
            objects.redrawScreen = false;
        }
    }
    
    // Expose public members
    return {
        redraw: redraw,
        update: update
    };
};