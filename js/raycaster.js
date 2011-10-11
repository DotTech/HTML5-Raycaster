/*
    HTML5 Raycaster Demo
    
    Author:     Ruud van Falier (ruud@dottech.nl)
    Version:    0.5
    Demo:       http://www.dottech.nl/raycaster/
    Git:        https://github.com/Stribe/HTML5-Raycaster
    
    This is a very basic raycasting engine running on a HTML5 canvas.
    Currently supports non-orthogonal walls and texture mapping.
    The old (orthogonal walls) version is available from the v0.3 branch.
    
    Feel free to use it for whatever you need it for.
    
    Changelog:
    (v0.2) Initial release.
           Uses "wolfenstein" technique to render the world.
           Has a grid-bases level and supports only orthogonal walls.
    (v0.3) Redraw only when player has moved or settings have changed.
           Removed jQuery dependency (thanks to James Abley, https://github.com/jabley)
    (v0.4) Added quality setting which makes raycasting use lesser rays.
           Attempted to implement non-orthogonal walls, but it was a failed attempt
    (v0.5) Raycasting engine is rewritten and now supports non-orthogonal walls.
           Strafing implemented.
           Quality settings removed because it needs fixing.
    
    Planned features:
    - Sectors
    - Variable height walls
    - Sprites    
*/

var raycaster = function()
{
    // Game constants
    var constants =
    {
        defaultWallHeight: 64,
        fieldOfView: 66,    // Field of view of the player (in degrees)
        screenWidth: 640,   // Width of the viewport
        screenHeight: 320,  // Height of the viewport
        angleBetweenRays: parseFloat(66 / 640), // Angle between casted rays
        movementStep: 9,    // How much the player moves each step
        turningStep: 3,     // How fast the player turns
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
        
        wall: function(x1, y1, x2, y2, textureId)
        {
            return {
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                textureId: textureId
            };
        },
        
        intersection: function() 
        {
            return {
                x: 0,                   // X coordinate of this wall
                y: 0,                   // Y coordinate of this wall
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
            };

            var getQuadrant = function() {
                if (_degrees >= 0 && _degrees < 90) {
                    return 1;
                }
                if (_degrees >= 90 && _degrees < 180) {
                    return 2;
                }
                if (_degrees >= 180 && _degrees < 270) {
                    return 3;
                }
                if (_degrees >= 270 && _degrees < 360) {
                    return 4;
                }
            };

            setValue(degrees);
            
            // Reveal public members
            return {
                setValue: setValue,         // Set the value of this angle
                getValue: getValue,         // Get the value of this angle
                turn: turn,                 // Turn the angle with n degrees
                toRadians: toRadians,       // Converts the angle from degrees to radians
                getQuadrant: getQuadrant    // Determine to which quadrant of a circle the angle is facing
            }
        }
    };
    
    // Define objects used throughout the application 
    var objects =
    {
        // Defines player values
        player: 
        {
            x: 150,
            y: 250,
            angle: new classes.angle(272)
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
            /*renderShadow: function() {
                return document.getElementById("chkShadow").checked;
            },
            renderQuality: function() {
                var e = document.getElementById("ddlQuality");
                return parseInt(e.options[e.selectedIndex].value);
            }*/
        },
        
        // Define walls in the world, make sure they are connected and there are no holes left in it
        walls: [
            // Walls surrounding the level
            new classes.wall(100, 10, 700, 10, 1),
            new classes.wall(10, 100, 10, 700, 1),
            new classes.wall(10, 100, 100, 10, 1),
            new classes.wall(790, 100, 790, 700, 1),
            new classes.wall(700, 10, 790, 100, 1),
            new classes.wall(100, 790, 700, 790, 1),
            new classes.wall(790, 700, 700, 790, 1),
            new classes.wall(10, 700, 100, 790, 1),
            
            // Colored stones west
            new classes.wall(100, 420, 200, 700, 2),
            new classes.wall(100, 420, 120, 400, 2),
            new classes.wall(120, 400, 160, 400, 2),
            new classes.wall(160, 400, 180, 420, 2),
            new classes.wall(180, 420, 200, 460, 2),
            new classes.wall(200, 460, 400, 640, 2),
            new classes.wall(400, 640, 420, 680, 2),
            new classes.wall(420, 680, 420, 700, 2),
            new classes.wall(420, 700, 390, 730, 2),
            new classes.wall(390, 730, 200, 700, 2),
            
            // Wooden walls in the middle
            new classes.wall(300, 300, 340, 300, 7),
            new classes.wall(340, 300, 380, 320, 7),
            new classes.wall(380, 320, 420, 360, 7),
            new classes.wall(420, 360, 400, 440, 7),
            new classes.wall(400, 440, 400, 470, 7),
            new classes.wall(400, 470, 430, 510, 7),
            new classes.wall(430, 510, 500, 530, 7),
            new classes.wall(500, 530, 560, 530, 7),
            new classes.wall(560, 530, 580, 500, 7),
            new classes.wall(580, 500, 560, 280, 7),
            new classes.wall(560, 280, 500, 220, 7),
            new classes.wall(500, 220, 340, 190, 7),
            new classes.wall(340, 190, 300, 300, 7),
        ],
        
        // Definition of keyboard buttons
        keys: {
            arrowLeft: new classes.keyButton(37),
            arrowUp: new classes.keyButton(38),
            arrowRight: new classes.keyButton(39),
            arrowDown: new classes.keyButton(40),
            esc: new classes.keyButton(27),
            shift: new classes.keyButton(16)
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
            // Determine wether an intersection is located in the quadrant we are looking at
            var correctQuadrant = function(intersection, angle)
            {
                var deltaX = objects.player.x - intersection.x,
                    deltaY = objects.player.y - intersection.y,
                    quadrant = 0;
                
                if (deltaX <= 0 && deltaY >= 0) quadrant = 1;
                if (deltaX > 0 && deltaY > 0) quadrant = 2;
                if (deltaX > 0 && deltaY <= 0) quadrant = 3;
                if (deltaX <= 0 && deltaY < 0) quadrant = 4;
                
                return quadrant == angle.getQuadrant();
            }
            
            /****************** / Public methods / ******************/
            // Calculate intersection point on a line (wall)
            // Formula found here: http://paulbourke.net/geometry/lineline2d/
            var getIntersection = function(line, angle) 
            {
                // Ray line
                var px1 = objects.player.x,
                    py1 = objects.player.y,
                    px2 = objects.player.x + Math.cos(angle.toRadians()),
                    py2 = objects.player.y - Math.sin(angle.toRadians());
                
                // Some number we need to solve our equation
                var f1 = ((line.x2 - line.x1) * (py1 - line.y1) - (line.y2 - line.y1) * (px1 - line.x1)) /
                         ((line.y2 - line.y1) * (px2 - px1) - (line.x2 - line.x1) * (py2 - py1));
                
                // Calculate where the ray intersects with the line
                var i = new classes.intersection();
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
                var deltaX = objects.player.x - i.x,
                    deltaY = objects.player.y - i.y;
                
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    i.distance = Math.abs(deltaX / Math.cos(angle.toRadians()));
                }
                else {
                    i.distance = Math.abs(deltaY / Math.sin(angle.toRadians()));
                }
                
                return i;
            };
            
            // Find the wall that is closest to the player
            var findWall = function(angle)
            {
                var intersection = false,
                    index = 0;
                
                for (var i = 0; i < objects.walls.length; i++) {
                    // Find intersection point on current wall
                    var c = getIntersection(objects.walls[i], angle);
                    
                    // If wall distance is less than previously found walls, use it
                    if (!intersection || c.distance < intersection.distance) {
                        intersection = c;
                        index = i;
                    }
                }
                
                // Texture mapping
                // Determine which scanline of the texture to draw for this intersection
                var wallLine = objects.walls[index],
                    lengthToIntersection = Math.sqrt(Math.pow(Math.abs(wallLine.x1 - intersection.x), 2) + Math.pow(Math.abs(wallLine.y1 - intersection.y), 2));
                
                intersection.textureIndex = objects.walls[index].textureId;
                intersection.textureX = parseInt(lengthToIntersection % constants.defaultWallHeight);
                
                return intersection;
            }
            
            // Expose public members
            return {
                findWall : findWall
            };
        }();
        
        /****************** / Private methods / ******************/
        // Draw the mini map
        var drawMiniMap = function() 
        {
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
            for (var i in objects.walls) {
                var wall = objects.walls[i];
                drawing.line(mapOffsetX + wall.x1 / shrinkFactor, mapOffsetY + wall.y1 / shrinkFactor, 
                             mapOffsetX + wall.x2 / shrinkFactor, mapOffsetY + wall.y2 / shrinkFactor, drawing.colorRgb(0, 0, 0));
            }
            
            // Draw player
            var playerX = Math.floor(objects.player.x / shrinkFactor),
                playerY = Math.floor(objects.player.y / shrinkFactor);
             
            drawing.circle(mapOffsetX + playerX, mapOffsetY + playerY, 3, drawing.colorRgb(255, 0, 0));
            
            // Visualize the raycasting on the map
            var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2),
                rayStep = 10;
            
            for (var i = 0; i < constants.screenWidth; i += rayStep) 
            {
                var intersection = raycasting.findWall(angle),
                    deltaX = Math.floor(Math.cos(angle.toRadians()) * (Math.abs(intersection.distance) / shrinkFactor)),
                    deltaY = Math.floor(Math.sin(angle.toRadians()) * (Math.abs(intersection.distance) / shrinkFactor));
                
                drawing.line(mapOffsetX + playerX, mapOffsetY + playerY, 
                             playerX + deltaX, playerY - deltaY, drawing.colorRgb(200, 200, 0));
                
                angle.turn(-constants.angleBetweenRays * rayStep);
            }
        };
        
        // Draw 3D representation of the world
        var drawWorld = function()
        {
            drawing.clear();
            
            // Draw solid floor and ceiling
            drawing.square(0, 0, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(60, 60, 60));
            drawing.square(0, constants.screenHeight / 2, constants.screenWidth, constants.screenHeight / 2, drawing.colorRgb(120, 120, 120));
            
            var angle = new classes.angle(objects.player.angle.getValue() + constants.fieldOfView / 2);
            
            // Scanline width of 1px gives the best quality, but costs most performance
            var scanlineWidth = 1; //objects.settings.renderQuality();
            
            // Draw the world as vertical scanlines
            for (var i = 0; i < constants.screenWidth; i += scanlineWidth) 
            {
                var intersection = raycasting.findWall(angle);
                
                if (intersection) {
                
                    // Remove distortion (counter fishbowl effect)
                    var distortRemove = new classes.angle(constants.fieldOfView / 2);
                    distortRemove.turn(-constants.angleBetweenRays * i);
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
                        objects.context.drawImage(objects.textures[intersection.textureIndex], 
                                                  intersection.textureX, offsetY, scanlineWidth, constants.defaultWallHeight - offsetY * 2,
                                                  i, scanlineStartY, scanlineWidth, scanlineEndY - scanlineStartY);
                    }
                    else {
                        // Draw without textures
                        drawing.lineSquare(i, scanlineStartY,  scanlineWidth, scanlineEndY, drawing.colorRgb(128, 0, 0));
                    }

                    // Make walls in the distance appear darker
                    if (objects.settings.renderLighting()) {
                        if (intersection.distance > 100) {
                            var colorDivider = parseFloat(intersection.distance / 200); 
                            colorDivider = (colorDivider > 5) ? 5 : colorDivider;
                            var opacity = parseFloat(1 - 1 / colorDivider);
                            
                            drawing.lineSquare(i, scanlineStartY, scanlineWidth, scanlineEndY, drawing.colorRgba(0, 0, 0, opacity))
                        }
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
                drawWorld();
                drawMiniMap();
                objects.redrawScreen = false;
            }
        }
        
        // Expose public members
        return {
            redraw: redraw,
            update: update,
            raycasting: raycasting
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
                deltaY = Math.sin(objects.player.angle.toRadians()) * step;
            
            var angle = forward ? objects.player.angle : new classes.angle(objects.player.angle.getValue() + 180),
                intersection = rendering.raycasting.findWall(angle);
                
            if (!intersection || intersection.distance > 50) {
                objects.player.x = Math.round(objects.player.x + deltaX);
                objects.player.y = Math.round(objects.player.y - deltaY);
            }
            
            rendering.redraw();
        };
        
        // Make player strafe left or right
        var strafe = function(left)
        {
            var angle = left 
                ? new classes.angle(objects.player.angle.getValue() + 90)
                : new classes.angle(objects.player.angle.getValue() - 90);
            
            var deltaX = Math.cos(angle.toRadians()) * constants.movementStep,
                deltaY = Math.sin(angle.toRadians()) * constants.movementStep,
                intersection = rendering.raycasting.findWall(angle);
                
            if (!intersection || intersection.distance > 20) {
                objects.player.x = Math.round(objects.player.x + deltaX);
                objects.player.y = Math.round(objects.player.y - deltaY);
            }
            
            rendering.redraw();
        };
        
        /****************** / Public methods / ******************/
        // Update movement
        var update = function()
        {
            if (objects.keys.arrowLeft.down) {
                if (objects.keys.shift.down) {
                    strafe(true);
                }
                else {
                    turn(constants.turningStep);
                }
            }
            
            if (objects.keys.arrowRight.down) {
                if (objects.keys.shift.down) {
                    strafe(false);
                }
                else {
                    turn(-constants.turningStep);
                }
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
            // Prevents default event handling
            var preventDefault = function(e) 
            {
                e.preventDefault 
                    ? e.preventDefault() 
                    : e.returnValue = false;
            };
            
            // Handle keydown events
            var keyDownHandler = function (e) 
            {
                var keyCode = e.keyCode || e.which;
                
                for (var name in objects.keys) {
                    if (objects.keys[name].code == keyCode) {
                        objects.keys[name].down = true;
                        preventDefault(e);
                    }
                }
            };
            
            // Handle keyup events
            var keyUpHandler = function (e) 
            {
                var keyCode = e.keyCode || e.which;
                
                for (var name in objects.keys) {
                    if (objects.keys[name].code == keyCode) {
                        objects.keys[name].down = false;
                        preventDefault(e);
                    }
                }
            };
            
            window.addEventListener("keydown", keyDownHandler, false);
            window.addEventListener("keyup", keyUpHandler, false);
            
            // Bind key icons to mobile devices which have no keyboard
            var keys = document.getElementsByClassName("keys");

            for (var i = 0, n = keys.length; i < n; ++i) {
                var key = keys[i];
                var keyCode = parseInt(key.getAttribute("data-code"), 0);
                
                (function(k, kc) {
                    k.addEventListener("mouseover", function() {
                        keyDownHandler({ keyCode: kc });
                        return false;
                    }, false);
                    k.addEventListener("mouseout", function() {
                        keyUpHandler({ keyCode: kc });
                        return false;
                    }, false);
                }(key, keyCode));
            }
            
            // Redraw when settings change
            document.getElementById("chkTextures").addEventListener('change', rendering.redraw);
            document.getElementById("chkLighting").addEventListener('change', rendering.redraw);
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
        
        // Bind keyboard events
        movement.init();
        
        // Start the gameloop
        objects.gameloopInterval = setInterval(function() {
            movement.update();
            rendering.update();
        }, 50);
    };
    
    return {
        init: init,
        objects: objects
    };
}();

document.addEventListener("DOMContentLoaded", function() {
    raycaster.init("screen");
}, true);