/*
    HTML5 Raycaster Demo
    
    Just playing around with the canvas.
    Very basic raycasting engine with texture mapping support.
    Feel free to use for whatever you need it for.
    
    Version: 0.4
    Author: Ruud van Falier
    
    Changelog:
    (v0.2) Initial release.
    (v0.3) Redraw only when player has moved or settings have changed.
           Removed jQuery dependency (thanks to James Abley (https://github.com/jabley))
    (v0.4) Added quality setting which makes raycasting use lesser rays.
           Maps now consist of walls that are not blocks and dont have to be aligned on a grid.
    
    ruud@dottech.nl
    http://www.dottech.nl
*/

var raycaster = function()
{
    // Game constants
    var constants =
    {
        mapBlockSize: 40,    // Size of wallsGrid on the mini map
        wallSize: 64,       // Size of wallsGrid in the game world
        fieldOfView: 66,    // Field of view of the player (in degrees)
        screenWidth: 640,   // Width of the viewport
        screenHeight: 320,  // Height of the viewport
        angleBetweenRays: parseFloat(66 / 640), // Angle between casted rays
        movementStep: 10,   // How much the player moves each step
        turningStep: 5,     // How fast the player turns
        distanceToViewport: 0,
        texturesFiles: [
            "img/bluestone.png",
            "img/greystone.png",
            "img/colorstone.png",
            "img/eagle.png",
            "img/mossy.png",
            "img/purplestone.png",
            "img/redbrick.png",
            "img/wood.png",
        ]
    };
    
    // Define classes / structures
    var classes = 
    {
        // Point on the screen or on the map
        point: function(x, y) 
        {
            return { 
                x: x, 
                y: y 
            };
        },
        
        vector: function(x1, y1, x2, y2)
        {
            return {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };
        },
        
        // Defines a wall on the grid that is found during raycasting
        wall: function() 
        {
            return {
                x: 0,                   // X coordinate of this wall
                y: 0,                   // Y coordinate of this wall
                gridX: 0,               // X index of this wall on the wallsGrid array
                gridY: 0,               // Y index of this wall on the wallsGrid array
                intersectsWithX: false, // Ray intersected on the X-axis?
                intersectsWithY: false, // Ray intersected on the Y-axis?
                distance: 0,            // Distance to the wall
                textureIndex: 0,        // index of texture for this wall
                textureX: 0,            // X coordinate of the texture scanline to draw
            }
        },
        
        keyButton: function(code) 
        {
            return {
                code: code,
                down: false
            }
        },
        
        // Represents an angle and implements some helpers to manipulate the angle
        angle: function(degrees)
        {
            var _degrees;
            
            var setValue = function(v) {
                _degrees = parseFloat(v);
                
                if (_degrees < 0) {
                    _degrees += 359;
                }
                else if (_degrees > 359) {
                    _degrees -= 360;
                }
            }
            
            var getValue = function() {
                return parseFloat(_degrees);
            }
            
            var toRadians = function() {
                if (_degrees == 90) {
                    return Math.PI / 2;
                }
                else if (_degrees == 270) {
                    return 3 * Math.PI / 2;
                }
                return _degrees * (Math.PI / 180);
            };
            
            var turn = function(degrees) {
                setValue(_degrees + degrees);
            }
            
            var facingNorth = function() {
                return _degrees < 180 && _degrees > 0;
            }
            
            var facingSouth = function() {
                return _degrees > 180 && _degrees <= 359;
            }
            
            var facingEast = function() {
                return (_degrees < 90 && _degrees >= 0) || (_degrees > 270 && _degrees <= 359);
            }
            
            var facingWest = function() {
                return _degrees > 90 && _degrees < 270;
            }
            
            setValue(degrees);
            
            // Reveal public members
            return {
                setValue: setValue,         // Set the value of this angle
                getValue: getValue,         // Get the value of this angle
                turn: turn,                 // Turn the angle with n degrees
                toRadians: toRadians,       // Converts the angle from degrees to radians
                facingNorth: facingNorth,   // Does the angle face north?
                facingSouth: facingSouth,   // Does the angle face south?
                facingEast: facingEast,     // Does the angle face east?
                facingWest: facingWest      // Does the angle face west?
            }
        }
    };
    
    // Define objects used throughout the application 
    var objects =
    {
        // Defines player values
        player: 
        {
            x: 500,
            y: 500,
            angle: new classes.angle(110)
        },
        
        centerOfScreen: 
        {
            x: constants.screenWidth / 2,
            y: constants.screenHeight / 2
        },
        
        // Access the setting checkboxes
        settings:
        {
            renderTextures: function() {
                return document.getElementById("chkTextures").checked;
            },
            renderLighting: function() {
                return document.getElementById("chkLighting").checked;
            },
            renderShadow: function() {
                return document.getElementById("chkShadow").checked;
            },
            renderQuality: function() {
                var e = document.getElementById("ddlQuality");
                return parseInt(e.options[e.selectedIndex].value);
            }
        },
        
        // Define walls in the world, make sure they are connected and there are no holes left in it
        walls: [
            new classes.vector(128, 300, 640, 128),
            new classes.vector(640, 128, 1100, 168),
            new classes.vector(1100, 168, 1800, 900),
            new classes.vector(1800, 900, 1860, 1700),
            new classes.vector(1860, 1700, 1500, 1900),
            new classes.vector(1500, 1900, 300, 1800),
            new classes.vector(300, 1800, 128, 300),
            new classes.vector(1100, 468, 1600, 1300),
            new classes.vector(1600, 1300, 1440, 1300),
            new classes.vector(1440, 1300, 700, 700),
            new classes.vector(700, 700, 1100, 468),
        ],
        
        // The wallgrid will be generated to provide a quick way to search for approximate wall intersections
        wallsGrid: new Array(),
        
        // Definition of keyboard buttons
        keys: {
            arrowLeft: new classes.keyButton(37),
            arrowUp: new classes.keyButton(38),
            arrowRight: new classes.keyButton(39),
            arrowDown: new classes.keyButton(40),
            esc: new classes.keyButton(27)
        },
        
        // Reference to the canvas context
        context: null,
        
        gameloopInterval: null,
        
        redrawScreen: true,
                
        // Array with Image objects containing the textures
        textures: null,
        
        // Loads the texture images in memory
        loadTextures: function() 
        {
            objects.textures = new Array();
            for (var i = 0; i < constants.texturesFiles.length; i++) {
                objects.textures[i] = new Image();
                objects.textures[i].src = constants.texturesFiles[i];
            }
        },
        
        // Loops through all grids and finds walls that insersect with them
        loadWallsGrid: function()
        {
            // Create the empty grid
            for (var y = 0; y < 30; y++) {
                objects.wallsGrid[y] = new Array();
                for (var x = 0; x < 30; x++) {
                    objects.wallsGrid[y][x] = new Array();
                }
            }
            
            // Load the walls into a grid array that we use to speed up the raycasting
            for (var i in objects.walls) {
                var wall = objects.walls[i],
                    os = wall.y2 - wall.y1,
                    cs = wall.x2 - wall.x1,
                    y = wall.y1,
                    deltaY = os / cs;
                
                // Follow the line of the wall and mark the grid cells that it intersects with
                if (cs > 0) {
                    for (var x = wall.x1; x < wall.x1 + cs; x++) {
                        var ix = parseInt(x / constants.wallSize),
                            iy = parseInt(y / constants.wallSize);
                            
                        objects.wallsGrid[iy][ix][objects.wallsGrid[iy][ix].length] = new classes.point(x, parseInt(y));;
                        y += deltaY;
                    }
                }
                else if (cs < 0) {
                    for (var x = wall.x1; x > wall.x1 + cs; x--) {
                        var ix = parseInt(x / constants.wallSize),
                            iy = parseInt(y / constants.wallSize);
                            
                        objects.wallsGrid[iy][ix][objects.wallsGrid[iy][ix].length] = new classes.point(x, parseInt(y));;
                        y -= deltaY;
                    }
                }
            }
        }
    };

    // Contains all functions related to rendering
    var rendering = function()
    {
        /****************** / Namespaces / ******************/
        // Basic drawing functions
        var drawing = 
        {
            // Clear the screen
            clear: function() 
            {
                objects.context.clearRect(0, 0, objects.context.canvas.width, objects.context.canvas.height);
            },
            
            // Get rgb() color string
            colorRgb: function(r, g, b) 
            {
                return "rgb(" + r + ", " + g + ", " + b + ")";
            },
            
            // Get rgba() color string
            colorRgba: function(r, g, b, a) 
            {
                return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            },
            
            // Draws a circle
            circle: function(x, y, radius, color) 
            {
                objects.context.beginPath();
                objects.context.fillStyle = color;
                objects.context.arc(x, y, radius, 0, Math.PI*2, true);
                objects.context.fill();
                objects.context.closePath();
            },
            
            // Draws a square
            square: function(x, y, width, height, color)
            {
                objects.context.beginPath();
                objects.context.fillStyle = color;
                objects.context.fillRect(x, y, width, height);
                objects.context.closePath();
            },
            
            // Draws a line
            // Note: for some reason lineTo() and stroke() result in a semi-transparent line
            // If you want to be sure the line is of solid color, use lineSquare() instead
            line: function(x, y, x2, y2, color)
            {
                objects.context.beginPath();
                objects.context.moveTo(x, y);
                objects.context.lineTo(x2, y2);
                objects.context.strokeStyle = color;
                objects.context.stroke();
                objects.context.closePath();
            },
            
            lineSquare: function(x, y, x2, y2, color)
            {
                drawing.square(x, y, x2, y2 - y, color);
            }
        };
        
        // Raycasting functions
        var raycasting = function()
        {
            /****************** / Private methods / ******************/
            // Converts world coordinates to map coordinates (array indexes)
            var coordsToMap = function(coordX, coordY)
            {
                return new classes.point(parseInt(coordX / constants.wallSize), parseInt(coordY / constants.wallSize));
            };
            
            // Determines if specified world coordinates are out of bounds
            var isOutOfBounds = function(coordX, coordY)
            {
                var mapPoint = coordsToMap(coordX, coordY);
                return mapPoint.y < 0 || mapPoint.y >= objects.wallsGrid.length
                   || mapPoint.x < 0 || mapPoint.x >= objects.wallsGrid[0].length;
            };
            
            // Determines wether specified world coordinates contains a wall in the wallsGrid array
            var containsWall = function(coordX, coordY)
            {
                var mapPoint = coordsToMap(coordX, coordY);
                return !isOutOfBounds(coordX, coordY) && objects.wallsGrid[mapPoint.y][mapPoint.x].length > 0;
            };
            
            // Choose the nearest wall to the player from wallsGrid 
            var chooseNearest = function(angle, wallX, wallY)
            {
                if (wallX != null) {
                    wallX.distance = Math.abs(Math.abs(objects.player.x - wallX.x) / Math.cos(angle.toRadians()));
                }
                
                if (wallY != null) {
                    wallY.distance = Math.abs(Math.abs(objects.player.x - wallY.x) / Math.cos(angle.toRadians()));
                }
                
                if (wallX == null) {
                    return wallY;
                }
                else if (wallY == null) {
                    return wallX;
                }
                
                return (wallX.distance < wallY.distance) ? wallX : wallY;
            };
            
            /****************** / Public methods / ******************/
            // Use raycasting to find the nearest wall on the wallsGrid at the specified angle
            var findWallOnGrid = function(angle)
            {
                var angleTan = Math.tan(angle.toRadians()),
                    deltaX = constants.wallSize / angleTan,
                    deltaY = constants.wallSize * angleTan,
                    foundX = false,
                    foundY = false,
                    wallX = null,
                    wallY = null;
                
                if (angle.facingSouth()) {
                    deltaX = -deltaX;
                }
                
                if (angle.facingEast()) {
                    deltaY = -deltaY;
                }
                
                if (angle.facingNorth() || angle.facingSouth()) {
                    while (wallX == null || (!foundX && !isOutOfBounds(wallX.x, wallX.y))) {
                        if (wallX == null) {
                            wallX = new classes.wall();
                            wallX.intersectsWithX = true;
                            wallX.y = Math.floor(objects.player.y / constants.wallSize) * constants.wallSize;
                            wallX.y += angle.facingNorth() ? -0.001 : constants.wallSize;
                            wallX.x = objects.player.x + (objects.player.y - wallX.y) / angleTan;
                        }
                        else {
                            wallX.x = wallX.x + deltaX;
                            wallX.y += angle.facingNorth() ? -constants.wallSize : constants.wallSize;
                        }
                        
                        foundX = containsWall(wallX.x, wallX.y);
                    }
                }
                
                if (angle.facingWest() || angle.facingEast()) {
                    while (wallY == null || (!foundY && !isOutOfBounds(wallY.x, wallY.y))) {
                        if (wallY == null) {
                            wallY = new classes.wall();
                            wallY.intersectsWithY = true;
                            wallY.x = Math.floor(objects.player.x / constants.wallSize) * constants.wallSize;
                            wallY.x += angle.facingWest() ? -0.001 : constants.wallSize;
                            wallY.y = objects.player.y + (objects.player.x - wallY.x) * angleTan;
                        }
                        else {
                            wallY.y = wallY.y + deltaY;
                            wallY.x += angle.facingWest() ? -constants.wallSize : constants.wallSize;
                        }
                        
                        foundY = containsWall(wallY.x, wallY.y);
                    }
                }
                
                return chooseNearest(angle, wallX, wallY);
            };
            
            // Once we found a wall on the grid, we cast deeper into the grid (pixel-by-pixel) until we hit a vector wall intersection
            var findVectorWall = function(angle, wallOnGrid)
            {
                var angleTan = Math.tan(angle.toRadians()),
                    deltaX = 0.5 / angleTan,
                    deltaY = 0.5 * angleTan,
                    wall = new classes.wall(),
                    found = false;
                
                if (angle.facingSouth()) {
                    deltaX = -deltaX;
                }
                
                if (angle.facingEast()) {
                    deltaY = -deltaY;
                }
                
                // Determine starting point for pixel-perfect raycast
                var startX = objects.player.x + Math.floor(Math.cos(angle.toRadians()) * wallOnGrid.distance),
                    startY = objects.player.y - Math.floor(Math.sin(angle.toRadians()) * wallOnGrid.distance);
                
                //drawing.circle(10 + startX / parseFloat(constants.wallSize / constants.mapBlockSize),
                //               10 + startY / parseFloat(constants.wallSize / constants.mapBlockSize), 3, "rgb(255,0,0)");
                
                wall.y = startY;
                wall.x = startX;
                
                while (wall == null || !found) {
                    wall.x += deltaX;
                    wall.y += deltaY;
                    var gridindex = coordsToMap(parseInt(wall.x), parseInt(wall.y));
                    
                    if (gridindex.y >= 0 && gridindex.y < objects.wallsGrid.length && gridindex.x >= 0 && gridindex.x < objects.wallsGrid[0].length) {
                        
                        for (var i in objects.wallsGrid[gridindex.y][gridindex.x]) {
                            var points = objects.wallsGrid[gridindex.y][gridindex.x][i];
                            
                            if ((parseInt(wall.x) == points.x && parseInt(wall.y) == points.y) 
                                || (parseInt(wall.x - 1) == points.x && parseInt(wall.y) == points.y)
                                || (parseInt(wall.x - 1) == points.x && parseInt(wall.y - 1) == points.y)
                                || (parseInt(wall.x - 1) == points.x && parseInt(wall.y + 1) == points.y)                                
                                || (parseInt(wall.x + 1) == points.x && parseInt(wall.y + 1) == points.y)
                                || (parseInt(wall.x + 1) == points.x && parseInt(wall.y) == points.y)
                                || (parseInt(wall.x + 1) == points.x && parseInt(wall.y - 1) == points.y)) {
                                found = true;
                                
                                wall.distance = Math.abs(Math.abs(objects.player.x - wall.x) / Math.cos(angle.toRadians()));
                                wall.textureId = 1;
                                wall.textureX = 0;
                                wall.intersectsWithX = false;
                                
                                return wall;
                                console.log("FOOOOOOOOOUUUUUUUUUUUUUUND!");
                            }
                        }
                    }
                    else {
                    //if (wall.x < 10 || wall.y < 10)
                        found = true;
                    }
                }
                
                return wallOnGrid;
            };
            
            // Expose public members
            return {
                findWallOnGrid: findWallOnGrid,
                findVectorWall: findVectorWall
            };
        }();
        
        /****************** / Private methods / ******************/
        // Draw the mini map
        var drawMiniMap = function() 
        {
            // Map is smaller than world, determine shrink factor
            var shrinkFactor = parseFloat(constants.wallSize / constants.mapBlockSize),
                mapOffsetX = 10,
                mapOffsetY = 10,
                odd = false;
            
            // Draw white background
            drawing.square(mapOffsetX, mapOffsetY, 
                           objects.wallsGrid[0].length * constants.mapBlockSize, objects.wallsGrid.length * constants.mapBlockSize, 
                           drawing.colorRgb(255, 255, 255));
            
            // Draw the minimap
            for (var y = 0; y < objects.wallsGrid.length; y++) {
                for (var x = 0; x < objects.wallsGrid[0].length; x++) {
                    // Draw grid square
                    drawing.square(mapOffsetX + x * constants.mapBlockSize, mapOffsetY + y * constants.mapBlockSize, 
                                       constants.mapBlockSize, constants.mapBlockSize, 
                                       odd ? drawing.colorRgb(240, 240, 240) : drawing.colorRgb(255, 255, 255));
                    
                    // Draw wall square
                    if (objects.wallsGrid[y][x].length > 0) {
                        drawing.square(mapOffsetX + x * constants.mapBlockSize, mapOffsetY + y * constants.mapBlockSize, 
                                       constants.mapBlockSize, constants.mapBlockSize, 
                                       drawing.colorRgb(190, 190, 190));
                    }
                    
                    odd = !odd;
                }
                odd = !odd;
            }
            
            // Draw the walls
            for (var i in objects.walls) {
                var wall = objects.walls[i];
                drawing.line(mapOffsetX + wall.x1 / shrinkFactor, mapOffsetY + wall.y1 / shrinkFactor, 
                             mapOffsetX + wall.x2 / shrinkFactor, mapOffsetY + wall.y2 / shrinkFactor, drawing.colorRgb(0, 0, 0));
            }
            
            // Draw player
            var playerX = mapOffsetX + Math.floor(objects.player.x / shrinkFactor),
                playerY = mapOffsetY + Math.floor(objects.player.y / shrinkFactor);
                
            drawing.circle(playerX, playerY, constants.mapBlockSize / 2, drawing.colorRgb(255, 0, 0));
            
            
            var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2),
                rayStep = 10;
            
            // Visualize the raycasting on the map
            for (var i = 0; i < constants.screenWidth; i += rayStep) 
            {
                var wallOnGrid = raycasting.findWallOnGrid(angle),
                    wall = raycasting.findVectorWall(angle, wallOnGrid),
                    deltaX = Math.floor(Math.cos(angle.toRadians()) * (wall.distance / shrinkFactor)),
                    deltaY = Math.floor(Math.sin(angle.toRadians()) * (wall.distance / shrinkFactor));
                
                drawing.line(playerX, playerY, 
                             playerX + deltaX, playerY - deltaY, drawing.colorRgb(200, 200, 0));
                
                angle.turn(-constants.angleBetweenRays * rayStep);
            }
        };
        
        // Draw 3D representation of the world
        var drawWorld = function()
        {
            drawing.clear();
            drawing.square(0, 0, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(60, 60, 60));
            drawing.square(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(120, 120, 120));
            
            var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2);
            
            // Scanline width of 1px gives the best quality, but costs most performance
            var scanlineWidth = objects.settings.renderQuality();
            
            // Draw the world as vertical scanlines
            for (var i = 0; i < constants.screenWidth; i += scanlineWidth) 
            {
                var wallOnGrid = raycasting.findWallOnGrid(angle);
                var wall = raycasting.findVectorWall(angle, wallOnGrid);
                
                // Remove distortion (counter fishbowl effect)
                var distortRemove = new classes.angle(constants.fieldOfView / 2);
                distortRemove.turn(-constants.angleBetweenRays * i);
                wall.distance *= Math.cos(distortRemove.toRadians());

                // Use distance to determine the size of the wall slice
                var wallHeight = Math.floor(constants.wallSize / wall.distance * constants.distanceToViewport);
                
                // If a wall slice is larger than the viewport height, we only need the visible section
                // skipPixels indicates how many pixels from top and bottom towards the center can be skipped during rendering
                var skipPixels = wallHeight > constants.screenHeight ? (wallHeight - constants.screenHeight) / 2 : 0,
                    scanlineStartY = parseInt(objects.centerOfScreen.y - (wallHeight - skipPixels * 2) / 2),
                    scanlineEndY = parseInt(objects.centerOfScreen.y + (wallHeight - skipPixels * 2) / 2);
                
                // Prevent the coordinates from being off screen
                scanlineStartY = scanlineStartY < 0 ? 0 : scanlineStartY;
                scanlineEndY = scanlineEndY > constants.screenHeight ? constants.screenHeight : scanlineEndY;
                
                if (objects.settings.renderTextures()) {
                    // Determine which texture to use on this wall
                    var wallindex = new classes.point(parseInt(wall.y / constants.wallSize), parseInt(wall.x / constants.wallSize));
                    wall.textureIndex = objects.wallsGrid[parseInt(wall.y / constants.wallSize)][parseInt(wall.x / constants.wallSize)];
                    wall.textureX = wall.intersectsWithX 
                        ? parseInt(wall.x % constants.wallSize) 
                        : parseInt(wall.y % constants.wallSize);
                        
                    // The visible scale of a wall compared to its original size
                    var wallsGridcale = wallHeight / constants.wallSize;
                        
                    var offsetY = (skipPixels > 0) ? skipPixels / wallsGridcale : 0;
                    if (offsetY >= constants.wallSize / 2) {
                        offsetY = constants.wallSize / 2 - 1;
                    }
                    
                    // Draw the texture
                    /*objects.context.drawImage(objects.textures[wall.textureIndex], 
                                              wall.textureX, offsetY, scanlineWidth, constants.wallSize - offsetY * 2,
                                              i, scanlineStartY, scanlineWidth, scanlineEndY - scanlineStartY);*/
                }
                else {
                    // Draw without textures
                    drawing.lineSquare(i, scanlineStartY,  scanlineWidth, scanlineEndY, drawing.colorRgb(128, 0, 0));
                }
                
                // Make one side of the wallsGrid darker to create a shadow effect
                // This is achieved by drawing a black scanline with 50% opacity
                //if (objects.settings.renderShadow()) {
                //    if (wall.intersectsWithX) {
                //        drawing.lineSquare(i, scanlineStartY, scanlineWidth, scanlineEndY, drawing.colorRgba(0, 0, 0, 0.5))
                //    }
                //}
                
                // Make wallsGrid in the distance appear darker
                if (objects.settings.renderLighting()) {
                    if (wall.distance > 100) {
                        var colorDivider = parseFloat(wall.distance / 200); 
                        colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                        var opacity = parseFloat(1 - 1 / colorDivider);
                        
                        drawing.lineSquare(i, scanlineStartY, scanlineWidth, scanlineEndY, drawing.colorRgba(0, 0, 0, opacity))
                    }
                }
                
                // Move on to next scanline
                angle.turn(-constants.angleBetweenRays * scanlineWidth);
            }
        };
        
        /****************** / Public methods / ******************/
        // Tell renderer that a redraw is required
        var redraw = function()
        {
            objects.redrawScreen = true;
        }
        
        // Execute all rendering tasks
        var update = function()
        {
            if (objects.redrawScreen) {
                //drawWorld();
                drawMiniMap();
                objects.redrawScreen = false;
            }
        }
        
        // Expose public members
        return {
            redraw: redraw,
            update: update
        };
    }();
    
    // Contains all movement related functions
    var movement = function()
    {
        /****************** / Private methods / ******************/
        // Make the player turn by increasing its viewing angle
        var turn = function(angle)
        {
            objects.player.angle.turn(angle);
            rendering.redraw();
        };
        
        // Make the player walk forward or backwards
        var walk = function(forward)
        {
            step = forward ? constants.movementStep : -constants.movementStep;
            
            var deltaX = Math.cos(objects.player.angle.toRadians()) * step,
                deltaY = Math.sin(objects.player.angle.toRadians()) * step,
                newMapX = parseInt((objects.player.x + deltaX) / constants.wallSize),
                newMapY = parseInt((objects.player.y - deltaY) / constants.wallSize);
            
            if (objects.wallsGrid[newMapY][newMapX].length == 0) {
                objects.player.x += deltaX;
                objects.player.y -= deltaY;
            }
            
            rendering.redraw();
        };
        
        /****************** / Public methods / ******************/
        // Update movement
        var update = function()
        {
            if (objects.keys.arrowLeft.down) {
                turn(constants.turningStep);
            }
            
            if (objects.keys.arrowRight.down) {
                turn(-constants.turningStep);
            }
            
            if (objects.keys.arrowUp.down) {
                walk(true);
            }
            
            if (objects.keys.arrowDown.down) {
                walk(false);
            }
            
            if (objects.keys.esc.down) {
                clearInterval(objects.gameloopInterval);
            }
        }
        
        // Bind the arrow keydown events
        var init = function()
        {
            var keyDownHandler = function (e) {
                var keyCode = e.keyCode || e.which;
                
                for (var name in objects.keys) {
                    if (objects.keys[name].code == keyCode) {
                        objects.keys[name].down = true;
                    }
                }
            };
            
            var keyUpHandler = function (e) {
                var keyCode = e.keyCode || e.which;
                
                for (var name in objects.keys) {
                    if (objects.keys[name].code == keyCode) {
                        objects.keys[name].down = false;
                    }
                }
            };
            
            window.addEventListener('keydown', keyDownHandler, false);
            window.addEventListener('keyup', keyUpHandler, false);
            
            // Bind key icons for mobile support
            var keys = document.getElementsByClassName("keys");

            for (var i = 0, n = keys.length; i < n; ++i) {
                var key = keys[i];
                var keyCode = parseInt(key.getAttribute("data-code"), 0);
                key.addEventListener('mouseenter', function() {
                    keyDownHandler({ keyCode: keyCode });
                    return false;
                }, false);
                key.addEventListener('mouseleave', function() {
                    keyUpHandler({ keyCode: keyCode });
                    return false;
                }, false);
            }
            
            // Redraw when settings change
            document.getElementById("chkTextures").addEventListener('change', rendering.redraw);
            document.getElementById("chkLighting").addEventListener('change', rendering.redraw);
            document.getElementById("chkShadow").addEventListener('change', rendering.redraw);
            document.getElementById("ddlQuality").addEventListener('change', rendering.redraw);
        };
        
        return {
            init: init,
            update: update
        };
    }();
    
    // Initializes the raycaster application
    var init = function(canvasId) 
    {
        // Setup the canvas
        var canvas = document.getElementById(canvasId);
        objects.context = canvas.getContext("2d");
        
        constants.distanceToViewport = Math.round(constants.screenWidth / 2 / Math.tan(constants.fieldOfView / 2 * (Math.PI / 180)));
        
        // Load texture files
        objects.loadTextures();
        
        // Load the wall map
        objects.loadWallsGrid();
        
        // Bind keyboard events
        movement.init();
        
        // Start the gameloop
        objects.gameloopInterval = setInterval(function() {
            movement.update();
            rendering.update();
        }, 50);
    };
    
    return {
        init: init
    };
}();

document.addEventListener("DOMContentLoaded", function() {
    raycaster.init("screen");
}, true);