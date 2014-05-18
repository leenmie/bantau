ig.module( 
	'game.entities' 
)
.requires(
	'impact.entity',
	'impact.animation',
	'plugins.newentity',
	'plugins.utils'
)
.defines(function(){

MachineGunEntity = ig.Entity.extend({
    name: "machinegun",
    size: {x: 117, y:84},
    pivot: {x: 58, y: 84},
    shot_entity: null,
    shooting: false,    
    animSheet: new ig.AnimationSheet('media/graphics/game/machine_gun.png', 117, 84),
    
    init: function(x, y, settings) {
            this.addAnim('idle', 1, [0]);
            this.addAnim('fire', 0.1, [0,1]);
            this.parent(x, y, settings);
    },
    
    fire: function() {
        this.currentAnim = this.anims.fire;
        this.shooting = true;
        if (this.shot_entity) {
            this.shot_entity.fire();
        }                
    },
    stop_fire: function() {
        this.currentAnim = this.anims.idle;
        this.shooting = false;
        if (this.shot_entity) {
            this.shot_entity.stop_fire();
        }
    },
    
	update:function() {		
		this.parent();
	}
});

MachineGunBulletEntity = ig.Entity.extend({
    name: "machinegunbullet",
    size: {x: 140, y:20},
    speed: 100, //100 bullets per second
    shot_entity: null,
    sound: new ig.Sound('media/sounds/submachine_gun.ogg'),
    animSheet: new ig.AnimationSheet('media/graphics/game/machine_gun_bullet.png', 140, 20),
    
    init: function(x, y, settings) {
            //this.addAnim('idle', 1, [0]);
            this.addAnim('fire', 1/this.speed, [0,1,2,3,4], true);
            this.parent(x, y, settings);
            this.sound.volume = 0.5;
    },    
    
    moveTo: function(x, y, duration) {
        this.parent(x, y, 0.1);
        this.sound.play();
    },
    
    stopMoving: function() {
        this.parent();
        this.kill();
    }
    
});

EnemyGunBulletEntity = ig.Entity.extend({
    name: "enemygunbullet",
    size: {x: 60, y:43},
    speed: 100, //100 bullets per second
    sound: new ig.Sound('media/sounds/gun_ricochet.ogg'),
    animSheet: new ig.AnimationSheet('media/graphics/game/bullet1.png', 60, 43),
    
    init: function(x, y, settings) {
            this.addAnim('fire', 1/this.speed, [0,1,2,3], true);
            this.parent(x, y, settings);
            this.sound.volume = 0.5;
    },    
    
    moveTo: function(x, y, duration) {
        var rad = calculate_angle(this.pos.x, this.pos.y, x, y);
        this.currentAnim.angle = rad;
        this.parent(x, y, duration);
        this.sound.play();        
    },
    
    stopMoving: function() {
        this.parent();
        this.kill();    
    },
    
    update:function() {     
        this.parent();
    }
});



MachineGunShotEntity = ig.Entity.extend({
    name: "machineshot",
    size: {x: 117, y:130},
    pivot: {x: 58, y:65},
    visible: true,
    animSheet: new ig.AnimationSheet('media/graphics/game/machine_gun_shot.png', 117, 130),
    
    init: function(x, y, settings) {
            this.addAnim('fire', 0.1, [0,1]);
            this.parent(x, y, settings);
    },
    
    fire: function() {
        this.visible = true;
    },
    stop_fire: function() {
        this.visible = false;
    },
    
    draw: function() {
        if (this.visible) {
            this.parent();
        }    
    },
    
    update:function() {     
        this.parent();
    }
});

CursorEntity = ig.Entity.extend({
    name: "machinegun",
    size: {x: 32, y:32},
    shot_entity: null,
    animSheet: new ig.AnimationSheet('media/graphics/game/cursor.png', 32, 32),
    
    init: function(x, y, settings) {
            this.addAnim('idle', 1, [0]);
    },    
    update:function() {     
        this.parent();
    }
});

BullEyeEntity = ig.Entity.extend({
    name: "bulleye",
    size: {x: 1, y: 1},  
    draw: function() {
        var ctx = ig.system.context;
        ctx.beginPath();
        ctx.lineWidth="6";
        ctx.strokeStyle="red";
        ctx.rect(this.pos.x, this.pos.y ,1, 1); 
        ctx.stroke();
    }      
});

HealthBarEntity = ig.Entity.extend({
    name: "bar",
    size: {x: 100, y: 22},
    animSheet: new ig.AnimationSheet('media/graphics/interface/health_bar.png', 100, 22),
    
    init: function(x, y, settings) {
        this.addAnim('idle', 1, [0]);
        this.parent(x, y, settings);
    }
});

HealthValueEntity = ig.Entity.extend({
    name: "bar",
    size: {x: 76, y: 14},
    font: new ig.Font('media/freemono.font.png'),
    animSheet: new ig.AnimationSheet('media/graphics/interface/health_value.png', 76, 14),
    zIndex: 999,
    init: function(x, y, settings) {
        this.addAnim('idle', 0.2, [0]);
        this.parent(x, y, settings);
    },
    max_hp : 100,
    current_hp : 100,    
    percent: 1,
    visible: true,
    setHP: function(hp) {
        this.current_hp = hp;
    },
    draw: function() {        
		if (this.visible) {
			var percent = (this.current_hp / this.max_hp).round(1);
			this.percent = percent;
			percent = (percent > 1 ? 1 : percent);
			if (percent <= 1) {									
    			if (this.scale.x > percent) {
    				this.scale.x -= 0.01;            
    			}			
    			if (this.scale.x < percent) {				
    				this.scale.x += 0.01;            
    			}
    			if (this.scale.x <= 0.01) {
    				this.visible = false;					
    			}
			}
			this.parent();
		}
		this.font.draw(String(this.current_hp), this.pos.x + 5, this.pos.y - 1);
    },
    reset: function() {
		this.visible = true;
		this.scale.x = 1;
		this.current_hp = this.max_hp;
		var _x = this.pos.x;
		var _y = this.pos.y;
		this.parent(_x, _y);
		//this.pos.x = _x;
		//this.pos.y = _y;
	}
    
});

EnemyEntity = ig.Entity.extend({
    maxHP: 1000,
    HP: 1000,
    percent: 1,
    damage: 100,
    attack_rate: 1,
    accuracy: 1,
    sound_explosion: new ig.Sound('media/sounds/explosion2.ogg'),
    collides: ig.Entity.COLLIDES.PASSIVE,
    limit_movement: {x: [0,640], y: [210, 230]},
    limit_speed: {x: [100, 300], y: [5, 10]},
    getShot: function(damage) {
        if (this.HP == -2) {
            return;
        }
        if (this.HP > 0) {
            this.HP -= damage;
        }
        if (this.HP <= 0) {
            this.HP = -1;
        }
    },
    checkAttack: function() {
        var r = Math.random();
        if (r < this.attack_rate) {
            return true;
        }
        return false;
    },
    
    shoot: function() {
        if (this.checkAttack()) {
            var game = ig.game;
            var bullet = game.spawnEntity(EnemyGunBulletEntity, this.pos.x, this.pos.y);
            bullet.moveTo(320, 480, 0.2);
            var r = Math.random();
            if (r < this.accuracy) {
                game.receive_damage(this.damage);
            }        
        }
    },
    
    explode: function() {
        var _this = this;
        setTimeout(function(){
            _this.kill();
        }, 500);                    
    },
    
    moving: function() {
        var s_x1 = this.limit_speed.x[0];
        var s_x2 = this.limit_speed.x[1];
        var x1 = this.limit_movement.x[0];
        var x2 = this.limit_movement.x[1];
        var velx = getRandomInt(s_x1, s_x2);
        var r = Math.random();
        if (r>0.5) {
            velx = -velx;
        }
        if (this.pos.x < x1) {
            velx = Math.abs(velx);
            this.vel.x = 0;
        }
        if (this.pos.x > x2) {
            velx = -Math.abs(velx);
            this.vel.x = 0;
        }
        
        this.accel.x = velx;
        
        var s_y1 = this.limit_speed.y[0];
        var s_y2 = this.limit_speed.y[1];
        var y1 = this.limit_movement.y[0];
        var y2 = this.limit_movement.y[1];
        
        var vely = getRandomInt(s_y1, s_y2);
        r = Math.random();
        if (r>0.5) {
            vely = -vely;
        }
        if (this.pos.y < y1) {
            vely = Math.abs(vely);
            this.vel.y = 0;
        }
        if (this.pos.y > y2) {
            vely = -Math.abs(vely);
            this.vel.y = 0;
        }        
        this.accel.y = vely;        
    },
        
    update: function() {
        this.parent();
        this.percent = this.HP/this.maxHP;
        if (this.HP == -1) {
            this.explode();
            this.HP = -2;
        }
        this.moving();
    },
    draw: function() {
        this.parent();        
        if (this.percent > 0) {
            var ctx = ig.system.context;
            ctx.beginPath();
            ctx.lineWidth="5";
            var color = "green";
            if (this.percent < 0.3) {
                color = "red";
            }
            else if (this.percent < 0.6) {
                color = "yellow";
            }
            ctx.strokeStyle=color;
            ctx.moveTo(this.pos.x, this.pos.y);
            ctx.lineTo(this.pos.x + (this.size.x*this.percent), this.pos.y);
            ctx.stroke(); 
        }
    }            
});

OilRigEntity = EnemyEntity.extend({
    name: "oilrig",
    maxHP: 100000,
    HP: 100000,
    attack_rate: 0,
    accuracy: 0,
    collides: ig.Entity.COLLIDES.NEVER,
    size: {x: 200, y:123},
    visible: true,
    animSheet: new ig.AnimationSheet('media/graphics/game/oil_rig.png', 200, 123),
    sound_explosion: new ig.Sound('media/sounds/explosion1.ogg'),
    timer: new ig.Timer(),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 0.5, [7, 6, 5]);
        this.addAnim('drown', 0.1, [4, 3, 2, 1, 0], true);        
        this.setScale(0.5, 0.5);
        this.maxVel.x = 100;
        this.timer.set(1);      
    },
    
    explode: function() {
        this.currentAnim = this.anims.drown;
        var _this = this;
        setTimeout(function() {
            var as = new ig.AnimationSheet('media/graphics/game/explosion2.png', 230, 258);
            var anim = new ig.Animation(as, 0.2, [0, 1, 2, 3, 4, 5, 6], true);
            //_this.setScale(1, 1);
            _this.currentAnim = anim;
            _this.sound_explosion.play();
        }, 200);
        this.parent();
    },
        
    draw: function() {
        if (this.visible) {
            this.parent();
        }    
    },
    
    moving: function() {
        var velx = getRandomInt(100, 300);
        var r = Math.random();
        if (r>0.5) {
            velx = -velx;
        }
        if (this.pos.x < 100) {
            velx = Math.abs(velx);
            this.vel.x = 0;
        }
        if (this.pos.x > 550) {
            velx = -Math.abs(velx);
            this.vel.x = 0;
        }
        
        this.accel.x = velx;
        
        var vely = getRandomInt(1, 5);
        r = Math.random();
        if (r>0.5) {
            vely = -vely;
        }
        if (this.pos.y < 220) {
            vely = Math.abs(vely);
            this.vel.y = 0;
        }
        if (this.pos.y > 225) {
            vely = -Math.abs(vely);
            this.vel.y = 0;
        }
        
        this.accel.y = vely;        
    },
    
    update:function() {
        this.parent();
        if (this.timer.delta() >= 0) {     
            this.moving();
            this.timer.reset();
        }                
    }
});

ShipAtlantaEntity = EnemyEntity.extend({
    name: "shipatlanta",
    maxHP: 1000,
    HP: 1000,
    attack_rate: 0.5,
    accuracy: 0.5,
    collides: ig.Entity.COLLIDES.ACTIVE,
    limit_movement: {x: [0,600], y: [240, 270]},
    size: {x: 400, y: 90},
    visible: true,
    animSheet: new ig.AnimationSheet('media/graphics/game/ship_atlanta.png', 400, 90),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 1, [0]);
        this.setScale(0.3, 0.3);
        this.maxVel.x = 100;
    },
    explode: function() {
        var as = new ig.AnimationSheet('media/graphics/game/explosion3.png', 54, 74);
        var anim = new ig.Animation(as, 0.2, [0, 1, 2, 3, 4, 5], true);            
        this.currentAnim = anim;
        this.pos.x = this.pos.x + 30;
        this.pos.y = this.pos.y - 30;
        this.collides = ig.Entity.COLLIDES.NEVER,
        this.setScale(1, 1);
        this.sound_explosion.play();
        this.parent();
    }    
});

FighterEntity = EnemyEntity.extend({
    name: "fighter",
    maxHP: 1000,
    HP: 1000,
    attack_rate: 0.9,
    accuracy: 1,
    collides: ig.Entity.COLLIDES.NEVER,
    limit_movement: {x: [0,600], y: [0, 140]},
    limit_speed: {x: [200, 300], y: [5, 10]},
    size: {x: 635, y: 250},
    sound_flying: new ig.Sound('media/sounds/fighter.ogg'),
    visible: true,
    timer: new ig.Timer(),
    animSheet: new ig.AnimationSheet('media/graphics/game/fighter_sprite.png', 635, 250),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.setScale(0.2, 0.2);
        this.addAnim('side', 1, [1], true);
        this.addAnim('front', 1, [0], true);        
        this.maxVel.x = 300;
        this.timer.set(2);
        this.sound_flying.volume = 0.3;
        this.start_move();
    },
    
    shoot: function() {
        //this.currentAnim = this.anims.front;
        this.parent();
    },
    
    explode: function() {
        var as = new ig.AnimationSheet('media/graphics/game/explosion3.png', 54, 74);
        var anim = new ig.Animation(as, 0.2, [0, 1, 2, 3, 4, 5], true);            
        this.currentAnim = anim;
        this.pos.x = this.pos.x + 30;
        this.pos.y = this.pos.y - 30;
        this.collides = ig.Entity.COLLIDES.NEVER,
        this.setScale(1, 1);
        this.sound_explosion.play();
        this.parent();
    },
    moving: function() {
        
    },
    start_move: function() {
        this.currentAnim = this.anims.side;
        var x = -200;
        var y = getRandomInt(20, 200);
        this.currentAnim.flip.x = true;
        if (this.pos.x < ig.system.width / 2) {
            x = ig.system.width + 200;
            this.currentAnim.flip.x = false;
        }
        var duration = getRandomArbitrary(1, 2);            
        this.moveTo(x, y, duration); 
        this.sound_flying.play();
                   
    },
    
    stopMoving: function() {
        this.parent();
        if (!this._killed) {    
            this.start_move();
        }
    }

});

HelicopterEntity = EnemyEntity.extend({
    name: "helicopter",
    maxHP: 1000,
    HP: 1000,
    attack_rate: 0.8,
    accuracy: 0.8,
    collides: ig.Entity.COLLIDES.ACTIVE,
    limit_movement: {x: [0,600], y: [0, 270]},
    limit_speed: {x: [100, 300], y: [50, 100]},
    size: {x: 133, y: 45},
    visible: true,
    timer: new ig.Timer(),
    animSheet: new ig.AnimationSheet('media/graphics/game/helicopter.png', 133, 45),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('idle', 0.1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        this.setScale(0.8, 0.8);
        this.maxVel.x = 200;
        this.timer.set(3);
    },
    moving: function() {
        this.parent();
        if (this.timer.delta() >= 0) {
            this.timer.reset();
            var r = Math.random();
            if (r < 0.5) {
                this.currentAnim.flip.x = true;
            }
            else {
                this.currentAnim.flip.x = false;
            }
        }
    },
    explode: function() {
        var as = new ig.AnimationSheet('media/graphics/game/explosion3.png', 54, 74);
        var anim = new ig.Animation(as, 0.2, [0, 1, 2, 3, 4, 5], true);            
        this.currentAnim = anim;
        this.pos.x = this.pos.x + 30;
        this.pos.y = this.pos.y - 30;
        this.collides = ig.Entity.COLLIDES.NEVER,
        this.setScale(1, 1);
        this.sound_explosion.play();
        this.parent();
    }    
});


ExplosionEntity = ig.Entity.extend({
    size: {x: 42, y: 42},
    animSheet: new ig.AnimationSheet('media/graphics/game/explosion.png', 42, 42),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('explode', 0.1, [0, 1, 2, 3, 4, 5, 6, 7, 8], true);
    },
    update: function() {
        this.parent();
        if (this.currentAnim.frame == 8) {
            this.kill();
        }
    }
});

GlassEntity = ig.Entity.extend({
    size: {x: 320, y: 141},
    animSheet: new ig.AnimationSheet('media/graphics/game/glass.png', 320, 141),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('crack', 1, [0], true);
        var _this = this;
        setTimeout(function() {
            _this.kill();
        }, 2000);
    },
});

MissileEntity = ig.Entity.extend({
    size: {x: 141, y: 46},
    animSheet: new ig.AnimationSheet('media/graphics/game/missile.png', 141, 46),
    target: null,
    exploded: false,
    damage: 1000,
    speed: 0.5,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        var frames = [];
        for (var i = 0; i < 24; i++) {
            frames.push(i);
        }
        this.addAnim('fly', 0.05, frames, false);
        this.anims.fly.pivot = {x: 0, y: this.size.y / 2};
        this.setScale(0.2, 0.2);
    },
    
    shootTo: function(x, y) {
        var rad = calculate_angle(this.pos.x, this.pos.y, x, y);
        this.currentAnim.angle = rad;
        var x1 = this.size.x * Math.cos(rad);
        var y1 = this.size.y * Math.sin(rad);
        var distant = calculate_distant(this.pos.x, this.pos.y, x - x1, y - y1);
        var speed = distant / 800;
        this.moveTo(x - x1, y - y1, speed);
        //console.log(x1, y1, rad);
        //console.log(this.size);        
        /*setTimeout(function() {
            _this.explode();
        }, 800);*/
    },
    
    stopMoving: function() {
        this.parent();
        if (!this.exploded) {
            this.explode();
        }    
    },
    
    lock_target: function(target) {
        this.target = target;
    },

    explode: function() {
        if (!this._killed && (!this.exploded)) {
            this.setScale(1, 1);
            var as = new ig.AnimationSheet('media/graphics/game/explosion.png', 42, 42);
            var anim = new ig.Animation(as, 0.05, [0, 1, 2, 3, 4, 5, 6, 7, 8], true);            
            this.currentAnim = anim;        
            this.exploded = true;
            this.target = null;
            this.stopMoving();
        }
    },    
    
    update: function() {
        this.parent();        
        if (!this.exploded) {
            /*var distant = Math.sqrt(Math.pow(this.pos.x - 320, 2) + Math.pow(this.pos.y - 480, 2));
            var scale = 1 / (distant/100);
            if (scale < 1) {
                this.setScale(scale, scale);
            }*/
            if (this.target) {
                if (this.target._killed) {
                    this.stopMoving();
                }
                else if (this.target.pos.x < 0 || this.target.pos.x > ig.system.width) {
                    this.stopMoving();
                }                
                else {
                    this.shootTo(
                        this.target.pos.x + this.target.size.x/2, 
                        this.target.pos.y + this.target.size.y/2
                    );
                }
            }
        }
        else {
            if (this.currentAnim.frame == 8) {
                this.kill();
            }
        }
    }    
    
});

CrateEntity = ig.Entity.extend({
    name: "crate",
    size: {x: 67, y: 67},
    animSheet: new ig.AnimationSheet('media/graphics/game/crate_sprite.png', 67, 67),
    crate_type: null,
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('crate', 1, [0], true);
        this.addAnim('missile', 1, [1], true);
        this.addAnim('hp', 1, [2], true);
        var scale = getRandomArbitrary(0.5,1);
        this.setScale(scale, scale);
        this.accel.y = 200;
        this.maxVel.y = 1000;
        var r = Math.random();
        var crate_type = 'hp';
        if (r < 0.5) {
            crate_type = 'missile';
        }
        this.crate_type = crate_type;
        this.currentAnim = this.anims[crate_type];
    },
    
    update: function() {
        this.parent();
        if (this.pos.y > ig.system.height) {
            this.kill();
        }
    },    
});


DialogEntity = ig.Entity.extend({
    name: "dialog",
    zIndex: 10000,
    size: {x: 300, y:141},
    font: new ig.Font('media/freemono.font.png'),
    text: "Text",
    animSheet: new ig.AnimationSheet('media/graphics/interface/dialog.png', 300, 141),
    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.addAnim('dialog', 1, [0], true);       
    },
    draw: function() {
        this.parent();
        this.font.draw(this.text, this.pos.x + this.size.x / 2 , this.pos.y + 23, ig.Font.ALIGN.CENTER);
    }
});

});
