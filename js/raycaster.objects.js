/*
//  Namespace:      Raycaster.Objects
//  Description:    Instances of global objects and variables used throughout the application
*/
Raycaster.Objects = 
{
    // Defines player parameters
    player: 
    {
        x: Raycaster.Constants.playerStartPos.x,
        y: Raycaster.Constants.playerStartPos.y,
        z: Raycaster.Constants.playerStartPos.z,
        angle: new Raycaster.Classes.Angle(Raycaster.Constants.playerStartAngle),
        height: 48,
        width: 0
    },
    
    // Settings checkboxes states
    settings:
    {
        renderTextures: function() {
            return document.getElementById("chkTextures").checked;
        },
        renderLighting: function() {
            return document.getElementById("chkLighting").checked;
        },
        renderMiniMap: function() {
            return document.getElementById("chkMiniMap").checked;
        },
        renderSky: function() {
            return document.getElementById("chkSky").checked;
        },
        renderFloor: function() {
            return false; //document.getElementById("chkFloor").checked;
        },
        renderSprites: function() {
            return document.getElementById("chkSprites").checked;
        },
        selectedLevel: function() {
            var selected = 0;
            
            if (location.hash) {
                var settings = location.hash.split("#")[1];
                var index = parseInt(settings.split(",")[0]);
                
                if (index) {
                    selected = index;
                }
            }
            
            return selected;
        },
        selectedResolution: function() {
            var selected = { w: 640, h: 480 };
            
            if (location.hash) {
                var settings = location.hash.split("#")[1];
                var res = parseInt(settings.split(",")[1]);
                
                if (res == 320) {
                    selected = { w: 320, h: 240 };
                    document.getElementById("ddlSize").selectedIndex = 1;
                }
                else {
                    document.getElementById("ddlSize").selectedIndex = 0;
                }
            }
            
            return selected;
        }
    },
    
    // Definition of keyboard buttons
    keys: {
        arrowLeft: Raycaster.Classes.KeyButton(37),
        arrowUp: Raycaster.Classes.KeyButton(38),
        arrowRight: Raycaster.Classes.KeyButton(39),
        arrowDown: Raycaster.Classes.KeyButton(40),
        lessThan: Raycaster.Classes.KeyButton(188),
        greaterThan: Raycaster.Classes.KeyButton(190),
        esc: Raycaster.Classes.KeyButton(27),
        shift: Raycaster.Classes.KeyButton(16),
        charR: Raycaster.Classes.KeyButton(82),
        charA: Raycaster.Classes.KeyButton(65),
        charZ: Raycaster.Classes.KeyButton(90),
        charQ: Raycaster.Classes.KeyButton(81),
        charW: Raycaster.Classes.KeyButton(87),
        charE: Raycaster.Classes.KeyButton(69),
        charS: Raycaster.Classes.KeyButton(83),
        charD: Raycaster.Classes.KeyButton(68),
        charX: Raycaster.Classes.KeyButton(88)
    },
    
    context: null,          // Reference to the canvas context
    bufferctx: null,
    gameloopInterval: null, // Reference to the interval that triggers the update functions
    redrawScreen: true,     // Wether it is necessary to redraw the scene
    textures: null,         // Array with texture Image objects
    sprites: null,          // Array with sprite Image objects
    skyImage: new Image(),  // Holds the image that is used for the sky background
    
    /*
    // Method:      loadResources
    // Description: Loads the texture and sprite images in memory
    // Parameters:  -
    // Returns:     -
    */
    loadResources: function() 
    {
        //need this when creating images in a different canvas
        //netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
        
        // Load texture images
        Raycaster.Objects.textures = new Array();
        for (var i = 0; i < Raycaster.Constants.texturesFiles.length; i++) {
            Raycaster.Objects.textures[i] = new Image();
            Raycaster.Objects.textures[i].src = Raycaster.Constants.texturesFiles[i];
            Raycaster.Objects.textures[i].onload = function() {
                Raycaster.Objects.redrawScreen = true;
            };
        }
        
        // Load sprite images
        Raycaster.Objects.sprites = new Array();
        for (var i = 0; i < Raycaster.Constants.spriteFiles.length; i++) {
            Raycaster.Objects.sprites[i] = new Image();
            Raycaster.Objects.sprites[i].src = Raycaster.Constants.spriteFiles[i];
        }
        
        // Load sky background image
        Raycaster.Objects.skyImage.src = Raycaster.Constants.skyImage;
        Raycaster.Objects.skyImage.onload = function() {
            Raycaster.Objects.redrawScreen = true;
        };
    }
}
