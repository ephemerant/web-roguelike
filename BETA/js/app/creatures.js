/*globals define*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        _sprites: ['Reptile0.png', 'Reptile1.png'],
        
        _generic: function (name, hp, str, sprite, frame, x, y) {
            return {
                
                name: name,
                hp: hp,
                max_hp: hp,
                str: str,
                sprite: sprite,
                frame: frame,
                x: x,
                y: y,
                
                move: function (_x, _y) {
                    this.x += _x;
                    this.y += _y;
                },
                
                die: function () {},
                
                interact: function () {
                    //this function is for if the player runs into the creature without intent to attack.
                }
            };
        },
        
        snake: function (x, y) {
            return this._generic('Snake', 10, 5, 'reptile0', 35, x, y);
        }
    };
});