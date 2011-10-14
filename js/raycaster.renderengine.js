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
        raycasting = Raycaster.Raycasting,
        lastFpsUpdate = new Date().getTime();
    
    // Calculate viewport distance once
    Raycaster.Constants.distanceToViewport = Math.round(Raycaster.Constants.screenWidth / 2 / Math.tan(Raycaster.Constants.fieldOfView / 2 * (Math.PI / 180)));
    

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
            
            Raycaster.Drawing.text("X: " + Math.round(objects.player.x) + " Y: " + Math.round(objects.player.y), 550, 30, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
            Raycaster.Drawing.text("A: " + objects.player.angle.degrees, 590, 50, Raycaster.Drawing.colorRgb(255, 255, 255), Raycaster.Constants.debugFont);
        }
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
                var intersections = raycasting.findWalls(angle);
                
                if (intersections.length > 0) {
                    var intersection = intersections[intersections.length - 1],
                        deltaX = Math.floor(Math.cos(angle.toRadians()) * (Math.abs(intersection.distance) / shrinkFactor)),
                        deltaY = Math.floor(Math.sin(angle.toRadians()) * (Math.abs(intersection.distance) / shrinkFactor));
                
                    drawing.line(mapOffsetX + playerX, mapOffsetY + playerY, 
                                 playerX + deltaX, playerY - deltaY, drawing.colorRgb(200, 200, 0));
                    
                    angle.turn(-constants.angleBetweenRays * rayStep);
                }
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
    
    // Search for a walls in given direction and draw the vertical scanline for them.
    // Because of variable wall height, if multiple walls are found they will be drawn on top each other.
    // Walls furthest from the player are drawn first.
    var drawWalls = function(vscan, angle)
    {
        // Search for intersections with visible walls
        var intersections = raycasting.findWalls(angle);
        
        // Draw walls for each found intersection
        for (var i = 0; i < intersections.length; i++) {
            var intersection = intersections[i];
            
            // Correction to counter fishbowl effect
            intersection.distance = fixFishbowlEffect(vscan, intersection.distance);
            
            // Calculate what to draw for this scanline
            var texture = objects.textures[intersection.resourceIndex],
                height = raycasting.getWallHeight(intersection),
                drawParams = calcVSliceDrawParams(vscan, intersection.distance, height, texture, 0, true);
            
            if (objects.settings.renderTextures()) {
                // Draw wall slice with texture
                context.drawImage(texture, 
                                  intersection.textureX, drawParams.sy1, 1, drawParams.sy2 - drawParams.sy1,
                                  vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);
            }
            else {
                // Draw without textures
                drawing.lineSquare(vscan, drawParams.dy1,  1, drawParams.dy2, drawing.colorRgb(128, 0, 0));
            }
            
            // Make walls in the distance appear darker
            if (objects.settings.renderLighting() && intersection.distance > 100) {
                drawing.lineSquare(vscan, drawParams.dy1, 1, drawParams.dy2, drawing.colorRgba(0, 0, 0, calcDistanceOpacity(intersection.distance)))
            }
        }
    }
    
    // Search for sprites in direction 'angle' and draw the vertical scanline for them
    var drawSprites = function(vscan, angle)
    {
        // Search for intersections with visible sprites
        // When multiple sprites are found, they are returned in drawing order (furthest first)
        var intersections = raycasting.findSprites(angle);
        
        // Loop through sprites and check for intersections
        for (var i = 0; i < intersections.length; i++) {
            var intersection = intersections[i];
            
            // Counter fishbowl effect
            intersection.distance = fixFishbowlEffect(vscan, intersection.distance);
            
            // Calculate what to draw for this scanline
            var sprite = objects.sprites[intersection.resourceIndex],
                drawParams = calcVSliceDrawParams(vscan, intersection.distance, sprite.height, sprite, level.sprites[intersection.levelObjectId].yoff, false);
                
            context.drawImage(sprite, 
                              intersection.textureX, drawParams.sy1, 1, drawParams.sy2 - drawParams.sy1,
                              vscan, drawParams.dy1, 1, drawParams.dy2 - drawParams.dy1);

            // Make sprites in the distance appear darker
            if (objects.settings.renderLighting() && intersection.distance > 100) {
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
            drawWalls(vscan, angle);
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
    
    // Calculates the opacity for the black overlay image that is used to make objects in the distance appear darker
    var calcDistanceOpacity = function(distance) 
    {
        var colorDivider = parseFloat(distance / 200); 
        colorDivider = (colorDivider > 5) ? 5 : colorDivider;
        
        return parseFloat(1 - 1 / colorDivider);
    };
    
    /*
    // Method:      Raycaster.RenderEngine.calcVSliceDrawParams
    // Description:
    //   Once we know the distance to a wall or sprite, this function calculates the parameters 
    //   that are required to draw the vertical slice for it.
    //   It also accounts for leaving away pixels of the object if it exceeds the size of the viewport
    //
    // Input parameters:
    // - vscan:             the vertical scanline number
    // - distance:          distance to object to draw
    // - objectHeight:      orginal height of the object to draw
    // - texture:           Image object containing the texture or sprite
    // - yoff:              Y-offset used for positioning sprites
    // - repeatingTexture:  Wether the texture should repeat or be stretched
    //
    // The following parameters are calculated:
    // - dy1:   Starting point of the slice on the destination (the screen) 
    // - dy2:   End point of the slice on the destination
    // - sy1:   Starting point of the slice on the source (the texture image)
    // - sy2:   End point of the slice on the source
    */
    var calcVSliceDrawParams = function(vscan, distance, objectHeight, texture, yoff, repeatingTexture)
    {
        // Use distance to determine the size of the slice
        var height = Math.floor(objectHeight / distance * constants.distanceToViewport),
            params = new classes.VSliceDrawParams(),
            scanlineOffsetY = 0;
        
        // scanlineOffsetY offsets the drawing position of the vertical slice.
        // This is used for sprites that need to be placed at a certain height
        if (yoff) {
            // Prepare offset value to be into the horizonOffset calculation
            scanlineOffsetY = Math.floor(yoff / distance * constants.distanceToViewport);
        }
        
        // horizonOffset is used for aligning walls and objects correctly on the horizon.
        // Without this value, everything would always be vertically centered.
        // The correction for scanlineOffsetY (sprite positioning) is accounted for in this value.
        var horizonOffset = (height - Math.floor(constants.defaultWallHeight / distance * constants.distanceToViewport)) / 2 - scanlineOffsetY;
        
        // Determine where to start and end the scanline on the screen
        var scanlineEndY = parseInt((objects.centerOfScreen.y - horizonOffset) + height / 2),
            scanlineStartY = scanlineEndY - height;
        
        // Prevent the coordinates from being off-screen
        params.dy1 = scanlineStartY < 0 ? 0 : scanlineStartY;
        params.dy2 = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;
        
        // Determine the scale of the visible slice compared to its original size
        var scale = height / texture.height;
        
        // Now that we've determined the size and location of the scanline,
        // we calculate which part of the texture image we need to render onto the scanline
        // When part of the object is located outside of the screen we dont need to copy that part of the texture image.
        var srcStartY = 0,
            srcEndY = texture.height;
        
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
        
        params.sy1 = srcStartY;
        params.sy2 = srcEndY;
        
        return params.sy2 > params.sy1 ? params : false;
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