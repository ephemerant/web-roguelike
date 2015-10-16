/*global Game, console, ROT */
/*jslint nomen: true*/

Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function () {
        'use strict';
        console.log("Entered start screen.");
    },
    exit: function () {
        'use strict';
        console.log("Exited start screen.");
    },
    render: function (display) {
        'use strict';
        // Render our prompt to the screen
        display.drawText(1, 1, "%c{yellow}Javascript Roguelike");
        display.drawText(1, 2, "Press [Enter] to start!");
    },
    handleInput: function (inputType, inputData) {
        'use strict';
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
};

// Define our playing screen
Game.Screen.playScreen = {
    enter: function () {
        'use strict';
        var map = [],
            x,
            y,
            generator;
        for (x = 0; x < 80; x = x + 1) {
            // Create the nested array for the y values
            map.push([]);
            // Add all the tiles
            for (y = 0; y < 24; y = y + 1) {
                map[x].push(Game.Tile.nullTile);
            }
        }
        // Setup the map generator
        generator = new ROT.Map.Uniform(80, 24);
        // update our map
        generator.create(function (x, y, v) {
            if (v === 1) {
                map[x][y] = Game.Tile.floorTile;
            } else {
                map[x][y] = Game.Tile.wallTile;
            }
        });
        // Create our map from the tiles
        this._map = new Game.Map(map);
    },
    exit: function () {
        'use strict';
        console.log("Exited play screen.");
    },
    render: function (display) {
        'use strict';
        // Iterate through all map cells
        var x,
            y,
            glyph;
        for (x = 0; x < this._map.getWidth(); x = x + 1) {
            for (y = 0; y < this._map.getHeight(); y = y + 1) {
                // Fetch the glyph for the tile and render it to the screen
                glyph = this._map.getTile(x, y).getGlyph();
                display.draw(x, y,
                    glyph.getChar(),
                    glyph.getForeground(),
                    glyph.getBackground());
            }
        }
    },
    handleInput: function (inputType, inputData) {
        'use strict';
        if (inputType === 'keydown') {
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            }
        }
    }
};

// Define our winning screen
Game.Screen.winScreen = {
    enter: function () {
        'use strict';
        console.log("Entered win screen.");
    },
    exit: function () {
        'use strict';
        console.log("Exited win screen.");
    },
    render: function (display) {
        'use strict';
        // Render our prompt to the screen
        var i,
            r,
            g,
            b,
            background;
        for (i = 0; i < 22; i = i + 1) {
            // Generate random background colors
            r = Math.round(Math.random() * 255);
            g = Math.round(Math.random() * 255);
            b = Math.round(Math.random() * 255);
            background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    },
    handleInput: function (inputType, inputData) {
        'use strict';
        // Nothing to do here      
    }
};

// Define our winning screen
Game.Screen.loseScreen = {
    enter: function () {
        'use strict';
        console.log("Entered lose screen.");
    },
    exit: function () {
        'use strict';
        console.log("Exited lose screen.");
    },
    render: function (display) {
        'use strict';
        // Render our prompt to the screen
        var i;
        for (i = 0; i < 22; i = i + 1) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    },
    handleInput: function (inputType, inputData) {
        'use strict';
        // Nothing to do here      
    }
};
