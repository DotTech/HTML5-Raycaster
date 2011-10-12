/*
//  Namespace:      Raycaster.Objects
//  Description:    Instances of global objects and variables used throughout the application
*/
Raycaster.Objects = 
{
    // Defines player values
    player: 
    {
        x: 150,
        y: 250,
        angle: new Raycaster.Classes.Angle(85)
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
        renderMiniMap: function() {
            return document.getElementById("chkMiniMap").checked;
        },
        renderSky: function() {
            return document.getElementById("chkSky").checked;
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
    skyImage: new Image(),
    
    // Loads the texture and sprite images in memory
    loadResources: function() 
    {
        Raycaster.Objects.textures = new Array();
        for (var i = 0; i < Raycaster.Constants.texturesFiles.length; i++) {
            Raycaster.Objects.textures[i] = new Image();
            Raycaster.Objects.textures[i].src = Raycaster.Constants.texturesFiles[i];
            Raycaster.Objects.textures[i].onload = function() {
                Raycaster.Objects.redrawScreen = true;
            };
        }
        
        Raycaster.Objects.sprites = new Array();
        for (var i = 0; i < Raycaster.Constants.spriteFiles.length; i++) {
            Raycaster.Objects.sprites[i] = new Image();
            Raycaster.Objects.sprites[i].src = Raycaster.Constants.spriteFiles[i];
        }
        
        Raycaster.Objects.skyImage.src = Raycaster.Constants.skyImage;
        Raycaster.Objects.skyImage.onload = function() {
            Raycaster.Objects.redrawScreen = true;
        };
    }
}
