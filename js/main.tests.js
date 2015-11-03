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
    'dungeon': '../app/dungeon'
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

require(['jasmine-boot'], function() {
  require(['../app/tests'], function() {
    //trigger Jasmine
    window.onload();
  });
});