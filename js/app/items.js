/*globals define*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        /**
         * @module creatures
         */

        //array of spritesheets
        _sprites: ['Armor.png', 'Potion.png', 'LongWep.png'],

        _items_area1: ['Health Potion', 'Antivenom'],

        /**
         * Choose a random item from a pool, based on the level given
         * @param  {number} level the current floor
         * @return {string}       returns the chosen item's name
         */
        _pickItem: function (level) {
            if (level >= 1 && level <= 5) { //pick a random item from section 1
                return this._items_area1[Math.floor(Math.random()* this._items_area1.length)];
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
            if (itemName === 'Health Potion') {
                return this.Potion(x, y);
            }
            if (itemName === 'Antivenom') {
              return this.Antivenom(x, y);
            }
        },

        spawnDrop: function (name, dropchance, level) {
            if (Math.floor(Math.random() * dropchance) === 1) {
                return this._putItem(level, 0, 0);
            } else {
                return 'nothing';
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
                str: str,
                def: def,
                x: x,
                y: y,

                /**
                 * the player tries to use the item
                 * @param  {creature} player the player
                 * @return {array} returns results of function (each variable is explained in code)
                 */
                use: function (player) {
                  var returnarray = {
                    success: 0, // 1 if item is used, 0 if item cannot be used
                    explainFail: '', // if the item cannot be used, this is where the reason is explained
                    removeType: 0, /*this tells the game how to handle the item after this function is called.
                                  0: (default) the item will be removed from inventory after use
                                  1: the item will remain in the inventory after use.
                                  */
                    playSound: ''// tells the game what sound should be played (if any)
                  };
                  if (this.name === 'Health Potion'){
                    player.hp+= 15;
                    if (player.hp > player.max_hp){
                      player.hp = player.max_hp;
                    }
                    returnarray.success = 1;
                    returnarray.playSound = 'potion';
                    return returnarray;
                  }

                  if (this.name === 'Antivenom'){
                    if (player.isPoisoned === 1){
                      player.isPoisoned = 0;
                      player.poisonTimer = 0;
                      returnarray.success = 1;
                      returnarray.playSound = 'potion';
                      return returnarray;
                    }
                    else{
                      returnarray.explainFail = 'You are not poisoned.';
                      return returnarray;
                    }
                  }

                  returnarray.explainFail= "Oops we're not certain why you can't use this... sorry (you shouldn't see this message)";
                  return returnarray;
                }
            };
        },

        /**
         * creates a potion item
         * @param  {number} x the x position of the item in the dungeon
         * @param  {nubmer} y the y position of the item in the dungeon
         * @return {item}   returns the item to the caller
         */
        Potion: function (x, y) {
            return this._generic('Health Potion', 'potion', 1, 0, 0, x, y);
        },

        /**
         * creates an antivenom item
         * @param  {number} x the x position of the item in the dungeon
         * @param  {nubmer} y the y position of the item in the dungeon
         * @return {item}   returns the item to the caller
         */
        Antivenom: function(x, y){
          return this._generic('Antivenom', 'potion', 5, 0, 0, x, y);
        },

        /**
         * creates a wood armor item
         * @param  {number} x the x position of the item in the dungeon
         * @param  {nubmer} y the y position of the item in the dungeon
         * @return {item}   returns the item to the caller
         */
        WoodArmor: function (x, y) {
            return this._generic('Wooden Armor', 'armor', 0, 0, 1, x, y);
        },

        /**
         * creates a stone spear item
         * @param  {number} x the x position of the item in the dungeon
         * @param  {nubmer} y the y position of the item in the dungeon
         * @return {item}   returns the item to the caller
         */
        StoneSpear: function (x, y) {
            return this._generic('Stone Spear', 'longwep', 1, 1, 0, x, y);
        }
    };
});
