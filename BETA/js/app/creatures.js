/*globals define, console*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        _sprites: ['Reptile0.png', 'Reptile1.png', 'Undead0.png', 'Undead1.png', 'Humanoid0.png', 'Humanoid1.png'],
        _creatures_area1: ['skeleton', 'snake', 'fairy'], //Creature pool for area 1

        //picks a creature from the creature pool
        _pickCreature: function (level) {
            if (level >= 1 && level <= 5) { //pick a random creature from section 1
                return this._creatures_area1[Math.floor(Math.random() * 3)];
            }
            return (this._creatures_area1[Math.floor(Math.random() * 2)]); //If calculation breaks then just return area1
        },

        //Returns a creature to push
        _putCreature: function (level, x, y) {
            var creatureName = this._pickCreature(level);
            if (creatureName === 'skeleton') {
                return this.skeleton(x, y);
            } else if (creatureName === 'fairy') {
                return this.fairy(x, y);
            } else {
                return this.snake(x, y); //If all else fails put snake
            }
        },

        _generic: function (name, hp, str, def, crit, expgain, sprite, frame, x, y) {
            return {
                name: name,
                hp: hp,
                max_hp: hp,
                str: str,
                def: def,
                crit: crit, //The lower this value is the higher the chance of a critical hit
                expgain: expgain,
                sprite: sprite,
                frame: frame,
                x: x,
                y: y,
                isDead: 0,
                move: function (_x, _y) {
                    if (isDead === 0) { //cannot move if dead
                        this.x += _x;
                        this.y += _y;
                    }
                    if (this.name === 'Skeleton' && this.isDead === 1) { //Skeletons may revive each turn
                        var revive = Math.floor(Math.random() * 10);
                        if (revive === 1) {
                            this.isDead = 0;
                        }
                    }
                },
                die: function () {},
                interact: function () {
                    //This function is for if the player runs into the creature without intent to attack.
                },
                special: function () {
                    //This is for any special move that the creature can perform, outside of the attack.
                },
                attack: function (creature) {
                    //This is called when the creature attacks
                    var damage = this.str;
                    if (Math.floor(Math.random() * this.crit) === 1) {
                        damage *= 2; // Critical Hit double the damage.

                        console.log('CRITICAL HIT!');
                    }
                    if (this.name === 'Snake' && Math.floor(Math.random() * 5) === 1) {
                        creature.isPoisoned = 1;
                        creature.poisonTimer = 10;
                        console.log('Player poisoned');
                    }
                    damage -= creature.def;
                    creature.hp -= damage;

                    console.log('Creature did ' + damage + ' damage');
                    console.log('Player health now ' + creature.hp);

                    if (creature.hp <= 0) {
                        creature.hp = 0;
                        creature.isDead = 1;
                        creature.frame = 0;
                    }
                }
            };
        },
        _makePlayer: function (name, hp, str, def, crit, Class) {
            return {
                name: name,
                level: 1,
                exp: 0,
                hp: hp,
                max_hp: hp,
                str: str,
                def: def,
                crit: crit, //The lower this value is the higher the chance of a critical hit
                isPoisoned: 0,
                poisonTimer: 0,
                charClass: Class, //The class of the character 'rogue, warrior etc'
                isDead: 0, //Not sure if necessary

                attack: function (creature) {
                    var damage = this.str;
                    if (Math.floor(Math.random() * this.crit) === 1) {
                        damage *= 2; // Critical Hit double the damage.
                    }
                    damage -= creature.def;
                    creature.hp -= damage;

                    console.log('Player did ' + damage + ' damage');
                    console.log('Monster health is now ' + creature.hp);

                    if (creature.hp <= 0) {
                        creature.hp = 0;
                        creature.isDead = 1;
                        creature.frame = 0;
                        this.exp += (creature.expgain - (this.level * 2));

                        if (this.exp >= 100) { //Leveling up system ;D
                            this.exp -= 100;
                            this.level += 1;
                            this.str += 2;
                            this.def += 1;
                            this.hp += 3;
                        }
                    }
                },

                turnTick: function () {
                    if (this.poisonTimer >= 1) {
                        this.poisonTimer -= 1;
                        this.hp -= 1;
                        console.log('Player suffers from poison' + ' hp now ' + this.hp);
                        if (this.poisonTimer === 0) {
                            this.isPoisoned = 0;
                            console.log('Player no longer poisoned');
                        }
                    }
                    if (this.hp <= 0) {
                        this.hp = 0;
                        this.isDead = 1;
                    }
                }
            };
        },

        snake: function (x, y) {
            return this._generic('Snake', 8, 5, 1, 20, 10, 'reptile0', 43, x, y);
        },
        skeleton: function (x, y) {
            return this._generic('Skeleton', 15, 4, 0, 20, 10, 'undead0', 24, x, y);
        },
        fairy: function (x, y) {
            return this._generic('Fairy', 25, 4, 0, 20, 10, 'humanoid0', 34, x, y);
        },
        player: function () {
            return this._makePlayer('Player', 30, 5, 1, 20, 'Warrior');
        }
    };
});