/*
//  Namespace:      Raycaster.Constants
//  Description:    Definition of engine parameters and other constant values
*/
Raycaster.Constants =
{
    fieldOfView: 66,        // Field of view of the player (in degrees)
    screenWidth: 640,       // Width of the viewport
    screenHeight: 480,      // Height of the viewport
    angleBetweenRays: parseFloat(66 / 640), // Angle between casted rays
    movementStep: 9,        // How much the player moves each step
    turningStep: 3,         // How fast the player turns
    startFadingAt: 100,     // At what distance to start fading visibility
    playerStartAngle: 273,  // Angle player is viewing at on startup
    playerStartPos: {       // Location of player on startup
        x: 80,
        y: 160,
        z: 0
    },
    distanceToViewport: 0,  // This value is calculated once one startup
    noClipping: false,      // Allows player to walk through walls and objects
    displayDebugInfo: false,
    runningLocal: location.href.indexOf("file://") > -1,
    texturesFiles: [        // Image files for wall textures
        "img/bricks-brown.png",
        "img/bricks-gray.png",
        "img/painting.png",
        "img/wood.png",
        "img/floor.png",
    ],
    spriteFiles: [          // Image files for sprites
        "img/barrel.png",
        "img/barrel_mask.png",
        "img/pillar.png",
        "img/pillar_mask.png",
    ],
    skyImage: "img/sky.jpg",        // Background image (sky)
    debugFont: "bold 12px arial",   // Font for debug info
    glIntervalTimeout: 50           // Gameloop interval timeout
};