ig.module(
	'plugins.touch-button'
)
.requires(
	'impact.system',
	'impact.input',
	'impact.image'
)
.defines(function(){ "use strict";


ig.TouchButton = ig.Class.extend({	
	action: 'undefined',
	image: null,
	tile: 0,
	pos: {x: 0, y: 0},
	size: {x: 0, y: 0},
	area: {x1: 0, y1:0, x2: 0, y2:0},

	pressed: false,	
	touchId: 0,
	anchor: null,
	
	init: function( action, anchor, width, height, image, tile ) {
		this.action = action;
		this.anchor = anchor;
		this.size = {x: width, y: height};
		
		this.image = image || null;
		this.tile = tile || 0;
	},
	
	align: function( w, h ) {
		if( 'left' in this.anchor ) {
			this.pos.x = this.anchor.left;
		}
		else if( 'right' in this.anchor ) {
			this.pos.x = w - this.anchor.right - this.size.x;
		}
		if( 'top' in this.anchor ) {
			this.pos.y = this.anchor.top;
		}
		else if( 'bottom' in this.anchor ) {
			this.pos.y = h - this.anchor.bottom - this.size.y;
		}
		
		var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
		var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;
		var s_w = ig.system.scale * (internalWidth / ig.system.realWidth);
		var s_h = ig.system.scale * (internalHeight / ig.system.realHeight);
		this.area = {
			x1: this.pos.x * s_w, y1: this.pos.y * s_h, 
			x2: (this.pos.x + this.size.x) * s_w, y2: (this.pos.y + this.size.y) * s_h};
	},
	
	touchStart: function( ev ) {
		if( this.pressed ) { return; }
		
		var pos = {left: 0, top: 0};
		if( ig.system.canvas.getBoundingClientRect ) {
			pos = ig.system.canvas.getBoundingClientRect();
		}
		
		for( var i = 0; i < ev.touches.length; i++ ) {
			var touch = ev.touches[i];
			if( this.checkStart(touch.identifier, touch.clientX - pos.left, touch.clientY - pos.top) ) {
				return;
			}
		}
	},
	
	touchEnd: function( ev ) {
		if( !this.pressed ) { return; }
		
		for( var i = 0; i < ev.changedTouches.length; i++ ) {
			if( this.checkEnd(ev.changedTouches[i].identifier) ) {
				return;
			}
		}
	},
	
	touchStartMS: function( ev ) {
		if( this.pressed ) { return; }
		
		var pos = {left: 0, top: 0};
		if( ig.system.canvas.getBoundingClientRect ) {
			pos = ig.system.canvas.getBoundingClientRect();
		}		
		this.checkStart(ev.pointerId, ev.clientX - pos.left, ev.clientY - pos.top);
	},
	
	touchEndMS: function( ev ) {
		if( !this.pressed ) { return; }
		
		this.checkEnd(ev.pointerId);
	},
	
	checkStart: function( id, x, y ) {
		if( 
			x > this.area.x1 && x < this.area.x2 &&
			y > this.area.y1 && y < this.area.y2
		) {
			this.pressed = true;
			this.touchId = id;
			ig.input.actions[this.action] = true;
			if( !ig.input.locks[this.action] ) {
				ig.input.presses[this.action] = true;
				ig.input.locks[this.action] = true;
			}
			return true;
		}
		
		return false;
	},
	
	checkEnd: function( id ) {
		if( id === this.touchId ) {
			this.pressed = false;
			this.touchId = 0;
			ig.input.delayedKeyup[this.action] = true;				
			return true;
		}
		
		return false;
	},
	
	draw: function() {
		if( this.image ) { 
			this.image.drawTile( this.pos.x, this.pos.y, this.tile, this.size.x, this.size.y );
		}
	}
});



ig.TouchButtonCollection = ig.Class.extend({
	buttons: [],
	
	init: function( buttons ) {
		this.buttons = buttons;
		
		/*document.addEventListener('touchstart', this.touchStart.bind(this), false);
		document.addEventListener('touchend', this.touchEnd.bind(this), false);
		
		document.addEventListener('MSPointerDown', this.touchStartMS.bind(this), false);
		document.addEventListener('MSPointerUp', this.touchEndMS.bind(this), false);
		document.addEventListener('mousedown', this.touchStartMS.bind(this), false);
		document.addEventListener('mouseup', this.touchEndMS.bind(this), false);
		document.body.style.msTouchAction = 'none';*/
		var canvas = ig.system.canvas;
		canvas.addEventListener('touchstart', this.touchStart.bind(this), false);
        canvas.addEventListener('touchend', this.touchEnd.bind(this), false);
        
        canvas.addEventListener('MSPointerDown', this.touchStartMS.bind(this), false);
        canvas.addEventListener('MSPointerUp', this.touchEndMS.bind(this), false);
        canvas.addEventListener('mousedown', this.touchStartMS.bind(this), false);
        canvas.addEventListener('mouseup', this.touchEndMS.bind(this), false);
        canvas.style.msTouchAction = 'none';
	},
	
	touchStart: function(ev) {
		ev.preventDefault();
		
		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[i].touchStart( ev );
		}
	},
	
	touchEnd: function(ev) {
		ev.preventDefault();
		
		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[i].touchEnd( ev );
		}
	},
	
	touchStartMS: function(ev) {
		ev.preventDefault();
		
		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[i].touchStartMS( ev );
		}
	},
	
	touchEndMS: function(ev) {
		ev.preventDefault();
		
		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[i].touchEndMS( ev );
		}
	},
	
	align: function() {
		var w = ig.system.width || window.innerWidth;
		var h = ig.system.height || window.innerHeight;
		
		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[i].align( w, h );
		}
	},
	
	draw: function() {
		for( var i = 0; i < this.buttons.length; i++ ) {
			this.buttons[i].draw();
		}
	}
});


});
