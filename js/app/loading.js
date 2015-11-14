/*globals define*/

define(['Phaser'], function (Phaser) {
    'use strict';
    var Loading = {
            preload: function () {
                this.load.image('load', 'assets/loading.png');
            },

            create: function () {
                this.state.start('Preload');
            }
        };
    return Loading;
});