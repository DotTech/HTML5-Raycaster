/*
    HTML5 Raycaster Demo
    
    Author:     Ruud van Falier (ruud@dottech.nl)
    Version:    0.7
    Released:   -
    
    Demo:       http://www.dottech.nl/raycaster/
    Git:        https://github.com/Stribe/HTML5-Raycaster
    
    This is a very basic raycasting engine running on a HTML5 canvas.
    Currently supports non-orthogonal walls, texture mapping and sprite rendering.
    FPS has dropped quite severely since sprites were added and i hope to be able
    to improve on this after planned analysis and implemention of sectors.
    The old (orthogonal walls) version is available from the v0.3 branch.
    
    Feel free to use it for whatever you need it for.
    
    See readme.txt for revision log!
*/

/*
// Namespace:   Raycaster
// Description: All parts of the application are stored in the Raycaster namespace
//              Each child namespace has its own js file which is included on startup
// Properties:  engine
// Methods:     start(canvasId) (void)
*/
var Raycaster = function() 
{
    // Define include files
    var jsfolder = "js/",
        includes = [
        "raycaster.constants.js", "raycaster.classes.js", "raycaster.objects.js", 
        "raycaster.objects.level.walltest.js", "raycaster.drawing.js", "raycaster.utils.js", 
        "raycaster.raycasting.js", "raycaster.renderengine.js", "raycaster.movement.js"
    ];
    
    // Include all our javascript files
    for (var i in includes) {
        document.write('<script type="text/javascript" src="' + jsfolder + includes[i] + '"></script>');
    }
    
    // Public reference to the RenderEngine instance
    var engine = null;
    
    // Initialization method of the Raycaster application
    var start = function(canvasId) 
    {
        // Setup the canvas
        var canvas = document.getElementById(canvasId);
        Raycaster.Objects.context = canvas.getContext("2d");
        
        // Load texture and sprite files
        Raycaster.Objects.loadResources();
        
        // Create an instance of the RenderEngine
        Raycaster.engine = new Raycaster.RenderEngine();
        
        // Bind keyboard events
        Raycaster.Movement.init();
        
        // Gameloop
        Raycaster.Objects.gameloopInterval = setInterval(function() {
            Raycaster.Movement.update();
            Raycaster.engine.update();
        }, Raycaster.Constants.glIntervalTimeout);
    };
    
    return {
        engine: engine,
        start: start
    };
}();

document.addEventListener("DOMContentLoaded", function() {
    Raycaster.start("raycaster");
    
    if (location.href.substr(0, 7) == "file://") {
        document.getElementById("introduction").style.display = "none";
    }
}, true);