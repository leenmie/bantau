ig.module( 
	'plugins.utils' 
)
.defines(function(){

getRandomInt = function (min, max) {
    /*
     * get a random int from [A, B] (inclusive A and B)
     */
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

getRandomArbitrary = function (min, max) {
    /*
     * get a random real from [A, B) (exclusive B)
     */
    return Math.random() * (max - min) + min;
};

calculate_angle = function(from_x, from_y, to_x, to_y) {
    /*
     * calculate angle between Ox and vector AB
     */
	var dx = to_x - from_x;
	var dy = to_y - from_y;	
	var rad = 0;
	rad = Math.atan(dy/dx);
	if (dx < 0 && dy < 0) {
		rad = rad + Math.PI;
	}
	if (dx < 0 && dy >= 0) {
		rad = rad - Math.PI;	
	if (dx > 0 && dy < 0) {
		rad = 2*Math.PI + rad;
	}
	return rad;	
};

calculate_distant = function(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));   
};

});
