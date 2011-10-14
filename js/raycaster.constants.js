/*
//  Namespace:      Raycaster.Constants
//  Description:    Definition of engine parameters and other constant values
*/
Raycaster.Constants =
{
    defaultWallHeight: 64,
    fieldOfView: 66,    // Field of view of the player (in degrees)
    screenWidth: 640,   // Width of the viewport
    screenHeight: 320,  // Height of the viewport
    angleBetweenRays: parseFloat(66 / 640), // Angle between casted rays
    movementStep: 9,    // How much the player moves each step
    turningStep: 3,     // How fast the player turns
    distanceToViewport: 0,
    noClipping: false,  // Allows player to walk through walls and objects
    texturesFiles: [
        "img/bluestone.png",
        "img/greystone.png",
        "img/colorstone.png",
        "img/eagle.png",
        "img/mossy.png",
        "img/purplestone.png",
        "img/redbrick.png",
        "img/wood.png"
    ],
    spriteFiles: [
        "img/barrel.png",
        "img/barrel_mask.png",
        "img/pillar.png",
        "img/pillar_mask.png",
    ],
    skyImage: "img/sky.jpg",
    debugFont: "bold 12px arial",
    glIntervalTimeout: 50
};