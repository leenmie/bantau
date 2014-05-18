ig.module( 
	'game.play' 
)
.requires(
	'impact.game',
	'impact.font',
	'impact.input',
	'impact.background-map',
	'plugins.utils',
	'plugins.touch-button',
	'plugins.new-input',
	'game.entities'
)
.defines(function(){

TURN_WAITING_TIME = 30;
DEFAULT_MISSILE_AMOUNT = 20;

BanTauGame = ig.Game.extend({
	name: "PlayingScene",
	background: null,
	bullet: null,
	gun: null,
    gun_last_rad: 0,
    current_damage: 100,
    max_hp: 10000,
    current_hp: 10000,
    health_bar: null,
    missile_amount: DEFAULT_MISSILE_AMOUNT,
    max_ship: 5,
    ship_list: [],
    crate_list: [],
    missiles: [],
    playing: true,
    summon_rate: 0.5,
    summon_interval: 2,
    summon_crate_rate: 0.7,
    summon_crate_interval: 2,
	cursor: null,
	scale: {x:1, y:1},
	dialog: null,
	font: new ig.Font('media/freemono.font.png'),
    init: function() {
        this.drawBackground();
        this.drawGun();
        //this.drawEnemy();
        this.drawHealthBar();
        this.init_input();         
        //scale calculation
        var internalWidth = parseInt(ig.system.canvas.offsetWidth) || ig.system.realWidth;
        var internalHeight = parseInt(ig.system.canvas.offsetHeight) || ig.system.realHeight;
        var s_w = ig.system.scale * (internalWidth / ig.system.realWidth);
        var s_h = ig.system.scale * (internalHeight / ig.system.realHeight);
        this.scale = {x: s_w, y: s_h};
        
        this.ready_game();
    },
    
    init_input: function() {
        this.cursor = this.spawnEntity(CursorEntity, 0, 0);
        this.bull_eye = this.spawnEntity(BullEyeEntity, 0, 0);
        ig.input.bind(ig.KEY.MOUSE1, 'shoot');
        ig.input.bind(ig.KEY.SPACE, 'missile');
       
        var image_button_missile = new ig.Image('media/graphics/interface/button_missile.png');
        this.buttons = new ig.TouchButtonCollection([
            new ig.TouchButton('missile', {left: 0, bottom: 0}, 100, 100, image_button_missile, 0 ),
        ]);
        this.buttons.align();
        ig.input.add_avoided_entities(this.buttons.buttons);
        
        var image_button_replay = new ig.Image('media/graphics/interface/button_replay.png');
        this.button_replay = new ig.TouchButtonCollection([
            new ig.TouchButton('replay', {left: (ig.system.width - 50)/2, top: (ig.system.height - 50)/2}, 50, 50, image_button_replay, 0 ),    
        ]);
        this.button_replay.align();
    },
    
    start_game: function() {
        this.current_hp = 10000;        
        //this.health_bar.current_hp = this.current_hp;        
        this.health_bar.reset();
        this.health_bar.current_hp = this.current_hp;
        this.missile_amount = DEFAULT_MISSILE_AMOUNT;
        //this.health_bar.current_hp = this.current_hp;
        this.playing = true;
        this.drawEnemy();
        this.call_summon_crate();        
    },
    
    stop_game: function() {
        this.playing = false;
        for (var i = 0; i < this.ship_list.length; i++) {
            this.ship_list[i].explode();
        }
    },
    
    drawBackground: function() {
        var data = [
            [1, 1],
        ];
        var bg = new ig.BackgroundMap(640, data, 'media/graphics/game/ocean_tile.png');
        var as = new ig.AnimationSheet('media/graphics/game/bg_sea.png', 640, 480);
        bg.anims[0] = new ig.Animation(as, 1, [0]); 
        this.background = bg;                       
        this.backgroundMaps.push(bg);
        //this.background = new ig.Image('media/graphics/game/bg_sea.png');
    },
    
    drawGun: function() {
        this.gun = this.spawnEntity(MachineGunEntity, 262, 410);
        var shot_entity = this.spawnEntity(MachineGunShotEntity, 264, 385);
        shot_entity.stop_fire();
        this.gun.shot_entity = shot_entity;
        this.bullet = this.spawnEntity(MachineGunBulletEntity, 240, 410);
        this.bullet.kill();
    },
    
    drawEnemy: function() {
        this.oil_rig = this.spawnEntity(OilRigEntity, 250, 220);
        this.ship_list.push(this.oil_rig);
        this.call_summon_ship();        
    },
    
    drawHealthBar: function() {
        var health_bar = new HealthBarEntity();
        var x = ig.system.width - health_bar.size.x;
        var y = ig.system.height - health_bar.size.y;
        health_bar.pos.x = x;
        health_bar.pos.y = y;
        this.entities.push(health_bar);       
        var down_health_bar = this.spawnEntity(HealthValueEntity, x+20, y+5);
        //down_health_bar.current_hp = GAME.my_stake;
        down_health_bar.max_hp = this.max_hp;
        down_health_bar.current_hp = this.current_hp;
        this.health_bar = down_health_bar;        
    },
        
    update_gun_angle: function(rad) {
        if (this.gun_last_rad != rad) {
            var convert_angle = (rad + Math.PI/2)/5;
            this.gun.currentAnim.angle = convert_angle;
            this.gun.shot_entity.currentAnim.angle = convert_angle;
            this.gun_last_rad = rad;
        }
    },
    
    call_summon_ship: function() {
        if (!this.playing) {
            return;
        }
        var r = Math.random();
        if (r < this.summon_rate) {
            this.summon_ship();    
        }
        var _this = this;
        setTimeout(
            function() {
                _this.call_summon_ship();
            }, 
            _this.summon_interval * 1000
        );
        this.ship_attack();
    },
        
    ship_attack: function() {
        for (var i = 0; i < this.ship_list.length; i++) {
            if (this.ship_list[i].name != "oilrig") {
                this.ship_list[i].shoot();
            }
        }    
    },
    
    summon_ship: function() {
        var class_list = [HelicopterEntity, ShipAtlantaEntity, FighterEntity];
        if (!this.oil_rig._killed) {
            if (this.ship_list.length < this.max_ship) {
                var x = [0, 600].random();
                var y = getRandomInt(260, 270);
                var ship = this.spawnEntity(class_list.random(), x, y);                
                this.ship_list.splice(0,0,ship);
            }
        }
    },
    
    call_summon_crate: function() {
        if (!this.playing) {
            return;
        }
        var r = Math.random();
        if (r < this.summon_crate_rate) {
            this.summon_crate();    
        }
        var _this = this;
        setTimeout(
            function() {
                _this.call_summon_crate();
            }, 
            _this.summon_crate_interval * 1000
        );
    },
    
    summon_crate: function() {
        var x = getRandomInt(0, ig.system.width - 50);
        var y = 0;
        var crate = this.spawnEntity(CrateEntity, x, y);    
        this.crate_list.push(crate);
    },
    
    
    receive_damage: function(damage) {
        var x = getRandomInt(0, 500);
        var y = getRandomInt(200, 300);
        //this.spawnEntity(GlassEntity, x, y);
        this.current_hp -= damage;
        if (this.health_bar) {
            this.health_bar.current_hp = this.current_hp;
        }
    },

    clean_dead_missile: function() {
        var i = 0;
        while (i < this.missiles.length) {
            if (this.missiles[i]._killed) {
                this.missiles.splice(i, 1);
            }
            i++;
        }    
    },

    clean_dead_ship: function() {
        var i = 0;
        while (i < this.ship_list.length) {
            if (this.ship_list[i]._killed) {
                this.ship_list.splice(i, 1);
            }
            i++;
        }    
    },
    
    fire_missile: function() {
        if (this.missile_amount >0) {
            var missile = this.spawnEntity(MissileEntity, 320, 550);
            missile.shootTo(this.bull_eye.pos.x, this.bull_eye.pos.y); 
            this.missiles.push(missile); 
            this.missile_amount -= 1;
        }
    },
    
    update_missiles: function() {
        this.clean_dead_missile();
        var i = 0;
        var j = 0;
        for (i = 0; i < this.missiles.length; i++) {
            for (j=0; j< this.ship_list.length; j++) {
                if (this.missiles[i].touches(this.ship_list[j])) {
                    if (!this.missiles[i].exploded) {
                        var missile = this.missiles[i];
                        var ship = this.ship_list[j];
                        var rad = missile.currentAnim.angle;
                        var x1 = missile.pos.x + missile.size.x * Math.cos(rad);
                        var y1 = missile.pos.y + missile.size.y * Math.sin(rad);
                        var x2 = ship.pos.x + ship.size.x / 2;
                        var y2 = ship.pos.y + ship.size.y / 2;
                        var distant = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
                        if (distant < 40) {
                            this.ship_list[j].getShot(this.missiles[i].damage);
                            this.missiles[i].explode();
                            break;
                        }
                    }
                }
                var distance = this.missiles[i].distanceTo(this.ship_list[j]);
                if (distance <= 150) {
                    if (!this.missiles[i].target && !this.missiles[i].exploded) {
                        this.missiles[i].lock_target(this.ship_list[j]);                        
                    }                                        
                }                
            }        
        }    
    },
    
    lose_game: function() {
        this.stop_game();
        var x = (ig.system.width - 300) / 2;
        var y = (ig.system.height - 140) / 2;
        var dialog = this.spawnEntity(DialogEntity, x, y);        
        dialog.text = "You are defeated.";
        this.sortEntities();
        this.dialog = dialog;
    },
    
    win_game: function() {
        this.stop_game();
        var x = (ig.system.width - 300) / 2;
        var y = (ig.system.height - 140) / 2;
        var dialog = this.spawnEntity(DialogEntity, x, y);        
        dialog.text = "You are victorious.";
        this.sortEntities();
        this.dialog = dialog;
    },
    
    ready_game: function() {
        this.stop_game();
        var x = (ig.system.width - 300) / 2;
        var y = (ig.system.height - 140) / 2;
        var dialog = this.spawnEntity(DialogEntity, x, y);        
        dialog.text = "Are you ready?";
        this.sortEntities();
        this.dialog = dialog;
    },
    
    update_game_status: function() {
        if (!this.playing) {
            return;
        }
        if (this.current_hp <=0) {
            this.lose_game();
        }
        if (this.oil_rig) {
            if (this.oil_rig._killed) {
                this.win_game();
            }
            if (this.oil_rig.HP < 50000 && this.oil_rig.HP > 20000) {
                this.max_ship = 10;
                this.summon_interval = 1.5;
            }
            else if (this.oil_rig.HP < 20000) {
                this.max_ship = 15;
                this.summon_interval = 0.7;
                this.summon_rate = 0.8;
            }
        }
    },
    
    update: function() {
        if (this.cursor) {
            var x = ig.input.mouse.x;
            var y = ig.input.mouse.y;
            this.cursor.pos.x = x - 16;
            this.cursor.pos.y = y - 16;
            this.bull_eye.pos.x = x;
            this.bull_eye.pos.y = y;
            var rad = this.gun.angleTo(this.cursor);
            this.update_gun_angle(rad);
            if (this.gun.shooting) {
                if (this.bullet._killed) {
                    this.bullet = this.spawnEntity(MachineGunBulletEntity, 240, 380); 
                    this.bullet.currentAnim.angle = rad;  
                    /*var x = this.cursor.pos.x;
                    var y = this.cursor.pos.y;*/
                    this.bullet.moveTo(x - (this.bullet.size.x/2), y, 1/this.bullet.speed);
                    var used = false;
                    for (var i = 0; i<this.ship_list.length; i++) {
                        if (this.bull_eye.touches(this.ship_list[i])) {
                            this.ship_list[i].getShot(this.current_damage);
                            this.spawnEntity(ExplosionEntity, x - 21 , y - 21);
                            used = true;                            
                            break;
                        }
                    }
                    
                    for (var i = 0; i<this.crate_list.length; i++) {
                        if (this.bull_eye.touches(this.crate_list[i])) {
                            if (this.crate_list[i].crate_type == "hp") {
                                this.current_hp = Math.min(this.current_hp + 500, this.max_hp); 
                                this.health_bar.current_hp = this.current_hp;                               
                            }
                            else if (this.crate_list[i].crate_type == "missile") {
                                this.missile_amount += 10;
                            }
                            this.crate_list[i].kill();
                            this.crate_list.splice(i, 1);
                            
                            this.spawnEntity(ExplosionEntity, x - 21 , y - 21);
                            used = true;                            
                            break;
                        }
                    }
                    
                    /*if (!used) {
                        if (this.bull_eye.touches(this.oil_rig)) {
                            //console.log('shot');
                            this.oil_rig.getShot(this.current_damage);
                            this.spawnEntity(ExplosionEntity, x - 21 , y - 21);
                        }
                    }*/
                }
            }
        }
        if (this.gun) {            
            if (ig.input.pressed('shoot')) {
                this.gun.fire();                                        
            }
            if (ig.input.released('shoot')) {
                this.gun.stop_fire();
            }
        }
        if (ig.input.pressed('missile')) {
                this.fire_missile();
        }
        if (ig.input.pressed('replay')) {                
            if (this.dialog) {
                this.start_game();
                this.dialog.kill();
                this.dialog = null;
            }
        }
        //this.summon_ship();
        this.clean_dead_ship();
        this.update_missiles();       
        this.update_game_status(); 
        this.parent();
    },
    
    draw: function() {        
        this.parent();
        if (this.buttons) {
            this.buttons.draw();
        }
        if (this.dialog) {
            if (this.button_replay) {
                this.button_replay.draw();
            }
        }
        this.font.draw(String(this.missile_amount), 50, ig.system.height -30);
    }
});

});

