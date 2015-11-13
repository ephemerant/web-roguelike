/*globals define*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        /**
         * @module creatures
         */

        //array of spritesheets
        _sprites: ['Armor.png', 'Potion.png'],

        _items_area1: ['potion'],

        /**
         * Choose a random item from a pool, based on the level given
         * @param  {number} level the current floor
         * @return {string}       returns the chosen item's name
         */
        _pickItem: function (level) {
            if (level >= 1 && level <= 5) { //pick a random item from section 1
                return this._items_area1[Math.floor(Math.random())];
            }
            return (this._items_area1[Math.floor(Math.random())]); //If calculation breaks then just return area1
        },

        /**
         * gives an item to the caller based on the level given.
         * @param  {number} level the current floor
         * @param  {number} x     the x value of where to place the item
         * @param  {number} y     the y value of where to place the item
         * @return {item}       returns the selected item back to the caller
         */
        _putItem: function (level, x, y) {
            var itemName = this._pickItem(level);
            if (itemName === 'potion') {
                return this.potion(x, y);
            }
        },

        /**
         * An item creation factory
         * @param  {string} name   name of the item
         * @param  {string} sprite name of the spritesheet to use
         * @param  {number} frame  what frame from the spritesheet to use
         * @param  {number} str    the strength value of the item (where applicable)
         * @param  {number} def    the defense value of the item (where applicable)
         * @param  {number} x      the x location of the item in the dungeon
         * @param  {number} y      the y location of the item in the dungeon
         * @return {item}        returns the created item back to the caller
         */
        _generic: function (name, sprite, frame, str, def, x, y) {
            return {
                name: name,
                sprite: sprite,
                frame: frame,
                x: x,
                y: y,

                /**
                 * the player tries to use the item
                 * @param  {creature} player the player
                 * @return {number}        1 if item used, 0 if item unused (or unusable);
                 */
                use: function (player) {

                }
            };
        },

        /**
         * creates a potion item
         * @param  {number} x the x position of the item in the dungeon
         * @param  {nubmer} y the y position of the item in the dungeon
         * @return {item}   returns the item to the caller
         */
        potion: function (x, y) {
            return this._generic('Health Potion', 'potion', 1, 0, 0, x, y);
        }
    };
});