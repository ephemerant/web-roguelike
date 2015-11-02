/*globals define, Promise*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        classes: ['Warrior', 'Engineer', 'Mage', 'Paladin', 'Rogue'],

        sprites: ['Warrior.png', 'Engineer.png', 'Mage.png', 'Paladin.png', 'Rogue.png'],

        player: function (name, hp, str, visibility, sprite, frame, x, y) {
            return {

                name: name,
                hp: hp,
                max_hp: hp,
                str: str,
                visibility: visibility,
                sprite: sprite,
                frame: frame,
                x: x,
                y: y,

                // Add (x, y) to the player's position if it is a valid move
                move: function (x, y) {
                    return new Promise(function (resolve, reject) {
                        if (this.isMoving || (x === 0 && y === 0)) {
                            resolve();
                            return;
                        }

                        if (x === 1) {
                            this.sprite.play('right');
                        } else if (x === -1) {
                            this.sprite.play('left');
                        } else if (y === 1) {
                            this.sprite.play('down');
                        } else if (y === -1) {
                            this.sprite.play('up');
                        }

                        this.x += x;
                        this.y += y;

                    });
                },

                die: function () {

                }

            };
        },

        // Classes
        Warrior: function (x, y) {
            return this.player('Warrior', 9, 8, 6, 'warrior', 35, x, y);
        },
        Engineer: function (x, y) {
            return this.player('Engineer', 8, 6, 7, 'engineer', 35, x, y);
        },
        Mage: function (x, y) {
            return this.player('Mage', 6, 5, 7, 'mage', 35, x, y);
        },
        Paladin: function (x, y) {
            return this.player('Paladin', 10, 7, 6, 'paladin', 35, x, y);
        },
        Rogue: function (x, y) {
            return this.player('Rogue', 6, 6, 9, 'rogue', 35, x, y);
        }

    };
});