define(['ROT', 'Phaser'], function(ROT, Phaser) {
  return {
    _sprites: ['Armor.png','Potion.png'],

    _items_area1: ['potion'],

    _pickItem: function (level) {
        if (level >= 1 && level <= 5) { //pick a random item from section 1
            return this._items_area1[Math.floor(Math.random() * 1)];
        }
        return (this._items_area1[Math.floor(Math.random() * 1)]); //If calculation breaks then just return area1
    },

    _putItem: function(level, x, y){
        var itemName = this._pickItem(level);
        if (itemName === 'potion'){
          return this.potion(x, y);
        }
    },


    _generic: function(name, sprite, frame, x, y){
      return{
        name: name,
        sprite: sprite,
        frame: frame,
        x: x,
        y: y,

        use: function(player){

        }
      };
    },

    potion: function(x, y){
      return this._generic('Health Potion', 'potion', 1, x, y);
    }
  };
});
