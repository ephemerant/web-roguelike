/*globals define*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        /**
         * @module creatures
         */

        //array of spritesheets
        _sprites: ['Armor.png', 'Potion.png', 'LongWep.png', 'Map.png', 'Chest.png', 'Key.png'],

        _items_chest1: ['Old Map'],
        _items_area1: ['Health Potion', 'Antivenom', 'Old Map', 'Key'],

        /**
         * Choose a random item from a pool, based on the level given
         * @function _pickItem
         * @param  {number} level the current floor
         * @return {string}       returns the chosen item's name
         */
        _pickItem: function (level) {
            if (level >= 1 && level <= 5) { //pick a random item from section 1
                return this._items_area1[Math.floor(Math.random()* this._items_area1.length)];
            }
            return (this._items_area1[Math.floor(Math.random())]); //If calculation breaks then just return area1
        },

        _pickChest: function (type){
            if(type === 1){

            }
        },

        /**
         * gives an item to the caller based on the level given.
         * @function _putItem
         * @param  {number} level the current floor
         * @param  {number} x     the x value of where to place the item
         * @param  {number} y     the y value of where to place the item
         * @param  {boolean} isDrop     whether this is a monster dropping or not
         * @return {item}       returns the selected item back to the caller
         */
        _putItem: function (level, x, y, isDrop) {
            var itemName;
            if (isDrop ===false){
              itemName = this._pickItem(level);
            }
            else {
              if(Math.floor(Math.random()*10)=== 1){
                return this._chest(x, y, level);
              }
              else{
                itemName = this._pickItem(level);
              }
            }
            if (itemName === 'Health Potion') {
                return this.Potion(x, y);
            }
            if (itemName === 'Antivenom') {
              return this.Antivenom(x, y);
            }

            if (itemName === 'Old Map'){
              return this.OldMap(x, y);
            }

            if (itemName ==='Key'){
              return this.Key(x, y);
            }
        },

        /**
         * gives an item to the caller based on the level given.
         * @function spawnDrop
         * @param  {number} level the current floor
         * @param  {number} x     the x value of where to place the item
         * @param  {number} y     the y value of where to place the item
         * @return {item}       returns the selected item back to the caller
         */
        spawnDrop: function (name, dropchance, level) {
            if (Math.floor(Math.random() * dropchance) === 1) {
                return this._putItem(level, 0, 0, true);
            } else {
                return 'nothing';
            }
        },

        /**
         * Chest creation factory
         * @param  {number} x      x location of chest
         * @param  {number} y      y location of chest
         * @param  {number} level  what floor it is on
         * @return {chest}        returns a chest
         */
        _chest: function (x, y, level){
          return {
            x: x,
            y: y,
            opened: false,
            contents:this._pickChest(1)
          };
        },

        /**
         * An item creation factory
         * @function _generic
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
                 * @function use
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
                                  2: clears the map and deletes on return.
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

                  if (this.name === 'Old Map'){
                    returnarray.success = 1;
                    returnarray.removeType = 2;
                    return returnarray;
                  }
                  if (this.name === 'Key'){
                    returnarray.removeType = 1;
                    returnarray.explainFail = 'You cannot use a key, simply walk into a lock to use it.';
                    return returnarray;
                  }

                  returnarray.explainFail= "Oops we're not certain why you can't use this... sorry (you shouldn't see this message)";
                  return returnarray;
                }
            };
        },
//------------------------------------------------------------
//General Items
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

        Key: function(x, y){
          return this._generic('Key', 'key', 0, 0, 0, x, y);
        },
// ----------------------------------------------------------------------
//Special ITEMS
        OldMap: function (x, y){
          return this._generic('Old Map', 'map', 2, 0, 0, x, y);
        },
// ----------------------------------------------------------------------
// EQUIPABLE ITEMS
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
