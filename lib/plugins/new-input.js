ig.module(
    'plugins.new-input'
)
.requires(
    'impact.input'
)
.defines(function(){

ig.Input.inject(
{
    avoided_entities: [],
    add_avoided_entities: function(entities) {
        this.avoided_entities = this.avoided_entities.concat(entities);
    },
    is_avoided: function(x, y) {
        for (var i = 0; i < this.avoided_entities.length; i++) {
            var entity = this.avoided_entities[i];
            if (x >= entity.pos.x && x <= entity.pos.x + entity.size.x
                && y >= entity.pos.y && y <= entity.pos.y + entity.size.y) {
                return true;        
            }
        }
        return false;            
    },
    
    keydown: function(event) {
        if( event.type == 'touchstart' || event.type == 'mousedown' ) {
            var pos = this.pos;
            var ev = event.touches ? event.touches[0] : event;
            var x = (ev.clientX - pos.left) / this.scale.x;
            var y = (ev.clientY - pos.top) / this.scale.y;
            if (this.is_avoided(x, y)) {
                return;
            }
        }
        this.parent(event);
        //event.stopPropagation();
        //event.preventDefault();    
    },
    
    keyup: function( event ) {
        if( event.type == 'touchend' || event.type == 'mouseup' ) {            
            var pos = this.pos;
            //var ev = event.touches ? event.touches[0] : event;  
            var ev = event.changedTouches ? event.changedTouches[0] : event;              
            if (ev) {            
                var x = (ev.clientX - pos.left) / this.scale.x;
                var y = (ev.clientY - pos.top) / this.scale.y;
                if (this.is_avoided(x, y)) {
                    return;
                }
            }
            else {
                console.log('event null');
                console.log(event.clientX);
            }
        }
        this.parent(event);        
    },
      
});    
    
});
