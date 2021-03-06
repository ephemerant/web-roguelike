/*globals require*/
// Load modules
require.config({
    baseUrl: 'js/lib',
    paths: {
        'Phaser': 'phaser.min',
        'lodash': 'lodash.min',
        'ROT': 'rot.min',
        'jasmine': 'jasmine',
        'jasmine-html': 'jasmine-html',
        'jasmine-boot': 'boot',
        'creatures': '../app/creatures',
        'items': '../app/items',
        'dungeon': '../app/dungeon',
        'preload': '../app/preload',
        'start': '../app/start',
        'boot': '../app/boot',
        'gameover': '../app/game_over',
        'creator': '../app/creator'
    },
    // shim: makes external libraries compatible with requirejs (AMD)
    shim: {
        'jasmine-html': {
            deps: ['jasmine']
        },
        'jasmine-boot': {
            deps: ['jasmine', 'jasmine-html']
        }
    }
});

require(['jasmine-boot'], function () {
    'use strict';
    require(['../app/tests'], function () {
        //trigger Jasmine
        window.onload();
    });
});