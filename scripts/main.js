function random(lower, upper) {
  return Math.round(Math.random() * (upper - lower) + lower);
}

ROT.RNG.setSeed(random(0, 10000));

var tileSet = document.createElement("img");
tileSet.src = "resources/Objects/Tile.png";

var map = new ROT.Map.Digger(0, 0, {
  roomWidth: [3, 7],
  roomHeight: [3, 7],
  corridorLength: [2, 10],
  dugPercentage: 0.3
});

var display = new ROT.Display({
  layout: "tile",
  tileWidth: 16,
  tileHeight: 16,
  bg: "transparent",
  tileSet: tileSet,
  tileMap: {
    ".": [96, 32],
    "#": [0, 32]
  }
});

document.body.appendChild(display.getContainer());

tileSet.onload = function() {
  map.create(function(x, y, wall) {
    display.draw(x, y, wall ? "#" : ".");
  });
};