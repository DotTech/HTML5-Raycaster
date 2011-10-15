/*
//  Namespace:      Raycaster.Utils
//  Description:    Utility and helper methods
*/
Raycaster.Utils =
{
    // Return X and Y side length of a triangle with a sloped side of "distance" length
    getDeltaXY: function(angle, distance) 
    {
        return new Raycaster.Classes.Point(
            Math.cos(angle.radians) * distance,
            Math.sin(angle.radians) * distance
        );
    }
};