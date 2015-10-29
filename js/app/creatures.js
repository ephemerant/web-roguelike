define(['ROT', 'Phaser'], function(ROT, Phaser) {
  return {
    _sprites: ['Reptile0.png', 'Reptile1.png'],
    _generic: function(name, hp, str, sprite, frame) {
      return {
        name: name,
        hp: hp,
        max_hp: hp,
        str: str,
        sprite: sprite,
        frame: frame,
        x: 0,
        y: 0,
        move: function(x, y) {
          this.x += x;
          this.y += y;
        },
        die: function() {},
        interact: function() {
          //this function is for if the player runs into the creature without intent to attack.
        }
      };
    },
    snake: function() {
      return this._generic('Snake', 10, 5, 'Reptile0', 35);
    }
  };
});