/*globals define, console*/
/*jslint nomen: true */

define(['ROT', 'Phaser'], function (ROT, Phaser) {
    'use strict';
    return {
        _sprites: ['Reptile0.png', 'Reptile1.png', 'Undead0.png', 'Undead1.png', 'Humanoid0.png', 'Humanoid1.png'],
        _creatures_area1: ['skeleton', 'snake', 'fairy'], //Creature pool for area 1

        /**
         * [Picks a random crature from the proper creature pool.]
         * @param  {[integer]} level [What level of the dungeon the player is currently on]
         * @return {[string]}       [The name of the creature that has been picked to be placed]
         */
        _pickCreature: function (level) {
            if (level >= 1 && level <= 5) { //pick a random creature from section 1
                return this._creatures_area1[Math.floor(Math.random() * 3)];
            }
            return (this._creatures_area1[Math.floor(Math.random() * 2)]); //If calculation breaks then just return area1
        },

        /**
         * [Creates a creature that is to be put into the dungeon. It calls the _pickCreature function to randomly select
         * a creature. This function creates the randomly chosen enemy and returns that creature.]
         * @param  {[integer]} level [What level of the dungeon the player is currently on]
         * @param  {[integer]} x     [X coordinate of where the creature is to be placed.]
         * @param  {[integer]} y     [Y coordinate of where the creature is to be placed.]
         * @return {[creature]}       [The creature created is returned.]
         */
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
        /**
         * [A factory that creates an enemy based upon the data given]
         * @param  {string} name    [Creatures name]
         * @param  {integer} hp      [Health will also become the max_hp]
         * @param  {[integer]} str     [Strength]
         * @param  {[integer]} def     [Defense]
         * @param  {[integer]} crit    [Critical hit ratio]
         * @param  {[integer]} expgain [Experience point gain]
         * @param  {[string]} sprite  [Sprite sheet name]
         * @param  {[integer]} frame   [What frame from the spritesheet to use]
         * @param  {[integer]} x       [X coordinate of where the sprite is located in the dungeon]
         * @param  {[integer]} y       [Y coordinate of where the sprite is located in the dungeon]
         * @return {[creature]}         [The created creature object is returned to the caller]
         */
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
                /**
                 * [Moves the changes the x and y coordinate of the creature]
                 * @param  {[integer]} _x [Tells the creature where to move relative to its current position]
                 * @param  {[integer]} _y [Tells the creature where to move relative to its current position]
                 */
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
                /**
                 * [Performs any action that must be done upon death (ex. item drop)]
                 */
                die: function () {},
                /**
                 * [Performs any non attack action that the player may do to the creature (ex. talk)]
                 */
                interact: function () {
                    //This function is for if the player runs into the creature without intent to attack.
                },
                /**
                 * [Perform a special creature specific action that isnt an attack. (ex. fairy teleport)]
                 */
                special: function () {
                    //This is for any special move that the creature can perform, outside of the attack.
                },
                /**
                 * [The creature attacks the creature that is passed to it. Calculations are made to determine damage given.]
                 * @param  {[creature]} creature [The creature that is being attacked]
                 */
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
        /**
         * [A factory that creates the player based upon the data given]
         * @param  {[string]} name  [Name is 'Player' !!DO NOT CHANGE THIS!!
         * @param  {[integer]} hp    [Health of the player, will also become the max_hp]
         * @param  {[integer]} str   [Strength of the player]
         * @param  {[integer]} def   [Defense of the player]
         * @param  {[integer]} crit  [Critical hit ratio]
         * @param  {[string]} Class [Name of the class the player is]
         * @return {[creature]}       [Returns the created player to the caller]
         */
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
                /**
                 * [The playerattacks the creature that is passed to it. Calculations are made to determine damage given.]
                 * @param  {[creature]} creature [The creature that is being attacked]
                 */
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
        /*
         *The following functions create creatures by giving data to the factories.
         */
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