define(['ROT', 'Phaser'], function(ROT, Phaser) {
  return{
    _sprites: ['Armor.png','Potion.png'],


    _generic: function(name, sprite, frame){
      return{
        name: name,
        sprite: sprite,
        frame: frame,

        pickup: function(player){

        },

        use: function(){
          
        }
      };
    }
  };
});
