/*
//  Namespace:      Raycaster.Objects
//  Description:    Instances of global objects and variables used throughout the application
*/
Raycaster.Objects = 
{
    // Defines player parameters
    player: 
    {
        x: 85,
        y: 70,
        angle: new Raycaster.Classes.Angle(335)
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
            return document.getElementById("chkFloor").checked;
        },
        renderSprites: function() {
            return document.getElementById("chkSprites").checked;
        }
    },
    
    // Definition of keyboard buttons
    keys: {
        arrowLeft: new Raycaster.Classes.KeyButton(37),
        arrowUp: new Raycaster.Classes.KeyButton(38),
        arrowRight: new Raycaster.Classes.KeyButton(39),
        arrowDown: new Raycaster.Classes.KeyButton(40),
        lessThan: new Raycaster.Classes.KeyButton(188),
        greaterThan: new Raycaster.Classes.KeyButton(190),
        esc: new Raycaster.Classes.KeyButton(27),
        shift: new Raycaster.Classes.KeyButton(16)
    },
    
    centerOfScreen: new Raycaster.Classes.Point(Raycaster.Constants.screenWidth / 2, Raycaster.Constants.screenHeight / 2),
    
    context: null,          // Reference to the canvas context
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
