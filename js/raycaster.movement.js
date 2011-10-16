/*
//  Namespace:      Raycaster.Drawing
//  Description:    Contains all movement related functions
//
//  Public methods: init()
//                  update()
*/
Raycaster.Movement = function()
{
    var player = Raycaster.Objects.player;
    
    /****************** / Private methods / *****************/
    // Returns closest intersection (wall or sprite) at specified angle.
    // This is used for collision detection.
    var findIntersection = function(angle)
    {
        if (Raycaster.Constants.noClipping) {
            return false;
        }
        
        var objects = Raycaster.Raycasting.findObjects(angle);
        
        if (objects.length > 0) {
            return objects[objects.length - 1];
        }
        
        return false;
    }
    
    // Make the player turn by increasing its viewing angle
    var turn = function(angle)
    {
        player.angle.turn(angle);
        Raycaster.engine.redraw();
    };
    
    // Make the player walk forward or backwards
    var walk = function(forward)
    {
        step = forward ? Raycaster.Constants.movementStep : -Raycaster.Constants.movementStep;
        
        var delta = Raycaster.Raycasting.getDeltaXY(player.angle, step);
        
        var angle = forward 
            ? player.angle 
            : new Raycaster.Classes.Angle(player.angle.degrees + 180);
            
        var intersection = findIntersection(angle);
        
        if (!intersection || intersection.distance > 50) {
            player.x = Math.round(player.x + delta.x);
            player.y = Math.round(player.y - delta.y);
        }
        
        Raycaster.engine.redraw();
    };
    
    // Elevate player up or down
    var elevate = function(up)
    {
        step = up ? Raycaster.Constants.movementStep : -Raycaster.Constants.movementStep;
        player.z += step;
        
        // Prevent player from going under ground
        if (player.z < 0) {
            player.z = 0;
        }
        
        Raycaster.engine.redraw();
    };
    
    // Make player strafe left or right
    var strafe = function(left)
    {
        var angle = left 
            ? new Raycaster.Classes.Angle(player.angle.degrees + 90)
            : new Raycaster.Classes.Angle(player.angle.degrees - 90);
        
        var delta = Raycaster.Raycasting.getDeltaXY(angle, Raycaster.Constants.movementStep);
            intersection = findIntersection(angle);
        
        if (!intersection || intersection.distance > 20) {
            player.x = Math.round(player.x + delta.x);
            player.y = Math.round(player.y - delta.y);
        }
        
        Raycaster.engine.redraw();
    };
    
    /****************** / Public methods / *****************/
    // Update movement
    var update = function()
    {
        // Turn left
        if (Raycaster.Objects.keys.arrowLeft.pressed || Raycaster.Objects.keys.charQ.pressed) {
            turn(Raycaster.Constants.turningStep);
        }
        // Turn right
        else if (Raycaster.Objects.keys.arrowRight.pressed || Raycaster.Objects.keys.charE.pressed) {
            turn(-Raycaster.Constants.turningStep);
        }
        
        // Walk forward
        if (Raycaster.Objects.keys.arrowUp.pressed || Raycaster.Objects.keys.charW.pressed) {
            walk(true);
        }
        // Walk backward
        else if (Raycaster.Objects.keys.arrowDown.pressed || Raycaster.Objects.keys.charS.pressed) {
            walk(false);
        }
        
        // Strafe left
        if (Raycaster.Objects.keys.charA.pressed) {
            strafe(true);
        }
        // Strafe right
        else if (Raycaster.Objects.keys.charD.pressed) {
            strafe(false);
        }
        
        // Stop gameloop interval
        if (Raycaster.Objects.keys.esc.pressed) {
            clearInterval(Raycaster.Objects.gameloopInterval);
        }
        
        // Reverse player angle
        if (Raycaster.Objects.keys.charR.pressed) {
            Raycaster.Objects.player.angle.setValue(Raycaster.Objects.player.angle.degrees - 180);
            Raycaster.Objects.keys.charR.pressed = false;
            Raycaster.engine.redraw();
        }
        
        if (Raycaster.Objects.keys.charZ.pressed) {
            elevate(true);
        }
        
        if (Raycaster.Objects.keys.charX.pressed) {
            elevate(false);
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
        
        // Handler for keydown events
        var keyDownHandler = function (e) 
        {
            var keyCode = e.keyCode || e.which;

            for (var name in Raycaster.Objects.keys) {
                if (Raycaster.Objects.keys[name].code == keyCode) {
                    Raycaster.Objects.keys[name].pressed = true;
                    preventDefault(e);
                }
            }
        };
        
        // Handler for keyup events
        var keyUpHandler = function (e) 
        {
            var keyCode = e.keyCode || e.which;
            
            for (var name in Raycaster.Objects.keys) {
                if (Raycaster.Objects.keys[name].code == keyCode) {
                    Raycaster.Objects.keys[name].pressed = false;
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
        document.getElementById("chkTextures").addEventListener('change', Raycaster.engine.redraw);
        document.getElementById("chkLighting").addEventListener('change', Raycaster.engine.redraw);
        document.getElementById("chkMiniMap").addEventListener('change', Raycaster.engine.redraw);
        document.getElementById("chkSky").addEventListener('change', Raycaster.engine.redraw);
        //document.getElementById("chkFloor").addEventListener('change', Raycaster.engine.redraw);
        document.getElementById("chkSprites").addEventListener('change', Raycaster.engine.redraw);
        document.getElementById("ddlLevel").addEventListener('change', function() {
            location.hash = document.getElementById("ddlLevel").selectedIndex;
            location.reload();
        });
    };
    
    return {
        update: update,
        init: init
    };
}();