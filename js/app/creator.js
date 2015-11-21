/*globals define*/

define(['Phaser'], function (Phaser) {
    'use strict';

    var Creator = {

        create: function () {
            var sprites = this.add.sprite(0, 50, 'spriteCard'),

                style = {
                    font: 'bold 20pt "Lucida Sans Typewriter"',
                    fill: 'white',
                    align: 'center'
                },
                // Create a label to use as a button
                rogue_button = this.add.text(80, 50, 'Rogue', style),
                paladin_button = this.add.text(240, 50, 'Paladin', style),
                warrior_button = this.add.text(400, 50, 'Warrior', style),
                engineer_button = this.add.text(560, 50, 'Engineer', style),
                mage_button = this.add.text(720, 50, 'Mage', style);

            rogue_button.inputEnabled = true;
            rogue_button.events.onInputUp.add(this.createRogue, this);
            rogue_button.anchor.setTo(0.5);

            paladin_button.inputEnabled = true;
            paladin_button.events.onInputUp.add(this.createPaladin, this);
            paladin_button.anchor.setTo(0.5);

            warrior_button.inputEnabled = true;
            warrior_button.events.onInputUp.add(this.createWarrior, this);
            warrior_button.anchor.setTo(0.5);

            engineer_button.inputEnabled = true;
            engineer_button.events.onInputUp.add(this.createEngineer, this);
            engineer_button.anchor.setTo(0.5);

            mage_button.inputEnabled = true;
            mage_button.events.onInputUp.add(this.createMage, this);
            mage_button.anchor.setTo(0.5);
        },

        /**
         * Get ROT's current seed
         * @return {boolean}
         */
        player: {
            name: 'Player',
            hp: '',
            mp: '',
            str: '',
            def: '',
            crit: '',
            class: ''
        },

        createRogue: function () {
            this.player.hp = 20;
            this.player.mp = 20;
            this.player.str = 3;
            this.player.def = 1;
            this.player.crit = 50;
            this.player.class = 'rogue';

            this.startGame();
        },

        createPaladin: function () {
            this.player.hp = 30;
            this.player.mp = 15;
            this.player.str = 5;
            this.player.def = 3;
            this.player.crit = 20;
            this.player.class = 'paladin';

            this.startGame();
        },

        createWarrior: function () {
            this.player.hp = 28;
            this.player.mp = 10;
            this.player.str = 6;
            this.player.def = 3;
            this.player.crit = 20;
            this.player.class = 'warrior';

            this.startGame();
        },

        createEngineer: function () {
            this.player.hp = 25;
            this.player.mp = 20;
            this.player.str = 4;
            this.player.def = 2;
            this.player.crit = 30;
            this.player.class = 'engineer';

            this.startGame();
        },

        createMage: function () {
            this.player.hp = 20;
            this.player.mp = 30;
            this.player.str = 2;
            this.player.def = 1;
            this.player.crit = 40;
            this.player.class = 'mage';

            this.startGame();
        },

        startGame: function () {
            this.state.start('Game');
        }

    };

    return Creator;
});