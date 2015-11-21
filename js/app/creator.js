/*globals define*/

define(['Phaser'], function (Phaser) {
    'use strict';

    var Creator = {

        create: function () {
            this.add.button(0, 0, 'scroll', this.createRogue, this);
            this.add.button(160, 0, 'scroll', this.createPaladin, this);
            this.add.button(320, 0, 'scroll', this.createWarrior, this);
            this.add.button(480, 0, 'scroll', this.createEngineer, this);
            this.add.button(640, 0, 'scroll', this.createMage, this);
                
            this.add.sprite(0, 50, 'spriteCard');
        },

        /**
         * the player object with paramaters needed to call _makePlayer in creatures.js
         */
        player: {
            name: 'Player',
            hp: '',
            mp: '',
            str: '',
            def: '',
            crit: '',
            vision: '',
            class: ''
        },

        /**
         * the Rouge Class
         * features lower health and defense, average health, magic, and strength, and high critical chance
         */
        createRogue: function () {
            this.player.hp = 20;
            this.player.mp = 20;
            this.player.str = 3;
            this.player.def = 1;
            this.player.crit = 5;
            this.player.vision = 10;
            this.player.class = 'rogue';

            this.startGame();
        },
        
        /**
         * the Paladin Class
         * features lower critical chance, average magic and strength, and high health and defense
         */
        createPaladin: function () {
            this.player.hp = 30;
            this.player.mp = 15;
            this.player.str = 4;
            this.player.def = 3;
            this.player.crit = 2;
            this.player.vision = 6;
            this.player.class = 'paladin';

            this.startGame();
        },
        
        /**
         * the Warrior Class
         * features lower magic and critical chance, average defense, and high health and strength. 
         */
        createWarrior: function () {
            this.player.hp = 28;
            this.player.mp = 10;
            this.player.str = 6;
            this.player.def = 2;
            this.player.crit = 2;
            this.player.vision = 5;
            this.player.class = 'warrior';

            this.startGame();
        },
        
        /**
         * the Engineer Class
         * features average health, magic, strength, defense, and critical chance
         */
        createEngineer: function () {
            this.player.hp = 25;
            this.player.mp = 20;
            this.player.str = 4;
            this.player.def = 2;
            this.player.crit = 3;
            this.player.vision = 7;
            this.player.class = 'engineer';

            this.startGame();
        },
        
        /**
         * the Mage Class
         * features lower health, strength, and defense, high magic and critical chance
         */
        createMage: function () {
            this.player.hp = 20;
            this.player.mp = 30;
            this.player.str = 2;
            this.player.def = 1;
            this.player.crit = 4;
            this.player.vision = 8;
            this.player.class = 'mage';

            this.startGame();
        },
        
        /**
         * changes the game to the Game state
         * @function startGame
         */
        startGame: function () {
            this.state.start('Game');
        }

    };

    return Creator;
});