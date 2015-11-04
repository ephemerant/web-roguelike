/*globals define, console*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        _sprites: ['Reptile0.png', 'Reptile1.png', 'Undead0.png', 'Undead1.png'],
        _creatures_area1: ['skeleton', 'snake'], //Creature pool for area 1

        //picks a creature from the creature pool
        _pickCreature: function (level) {
            if (level >= 1 && level <= 5) { //pick a random creature from section 1
                return this._creatures_area1[Math.floor(Math.random() * 2)];
            }
            return (this._creatures_area1[Math.floor(Math.random() * 2)]); //If calculation breaks then just return area1
        },

        //Returns a creature to push
        _putCreature: function (level, x, y) {
            var creatureName = this._pickCreature(level);
            if (creatureName === 'skeleton') {
                return this.skeleton(x, y);
            } else {
                return this.snake(x, y); //If all else fails put snake
            }
        },

        _generic: function (name, hp, str, def, sprite, frame, x, y) {
            return {
                name: name,
                hp: hp,
                max_hp: hp,
                str: str,
                def: def,
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
                    if (name === 'Skeleton' && isDead === 1) { //Skeletons may revive each turn
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
                attack: function () {
                    //This is called when the creature attacks
                },
                getHurt: function (damage) {
                    //This is called when the creature is hurt
                    this.damage -= this.def; //Subtract the creatures defense from the damage
                    this.hp -= damage; //apply damage to hp
                    console.log('hp ' + this.hp);
                    if (this.hp <= 0) {
                        this.hp = 0;
                        this.isDead = 1;
                        this.frame = 0;
                    }
                }
            };
        },
        snake: function (x, y) {
            return this._generic('Snake', 8, 5, 1, 'reptile0', 43, x, y);
        },
        skeleton: function (x, y) {
            return this._generic('Skeleton', 15, 4, 0, 'undead0', 24, x, y);
        }
    };
});