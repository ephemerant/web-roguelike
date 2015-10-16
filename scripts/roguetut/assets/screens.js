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
    _map: null,
    _centerX: 0,
    _centerY: 0,
    move: function (dX, dY) {
        'use strict';
        // Positive dX means movement right
        // negative means movement left
        // 0 means none
        this._centerX = Math.max(0,
                                 Math.min(this._map.getWidth() - 1,
                                          this._centerX + dX));
        // Positive dY means movement down
        // negative means movement up
        // 0 means none
        this._centerY = Math.max(0,
                                 Math.min(this._map.getHeight() - 1,
                                          this._centerY + dY));
    },
    enter: function () {
        'use strict';
        // Create a map based on our size parameters
        var map = [],
            mapWidth = 250,
            mapHeight = 250,
            x,
            y,
            generator;
        for (x = 0; x < mapWidth; x = x + 1) {
            // Create the nested array for the y values
            map.push([]);
            // Add all the tiles
            for (y = 0; y < mapHeight; y = y + 1) {
                map[x].push(Game.Tile.nullTile);
            }
        }
        // Setup the map generator
        generator = new ROT.Map.Uniform(mapWidth, mapHeight,
            {timeLimit: 5000});
        // Smoothen it one last time and then update our map
        generator.create(function (x, y, v) {
            if (v === 0) {
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
        var screenWidth = Game.getScreenWidth(),
            screenHeight = Game.getScreenHeight(),
        // Make sure the x-axis doesn't go to the left of the left bound
            topLeftX = Math.max(0, this._centerX - (screenWidth / 2)),
        // Make sure the y-axis doesn't above the top bound
            topLeftY = Math.max(0, this._centerY - (screenHeight / 2)),
            x,
            y,
            glyph;
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
        // Iterate through all visible map cells
        for (x = topLeftX; x < topLeftX + screenWidth; x = x + 1) {
            for (y = topLeftY; y < topLeftY + screenHeight; y = y + 1) {
                // Fetch the glyph for the tile and render it to the screen
                // at the offset position.
                glyph = this._map.getTile(x, y).getGlyph();
                display.draw(
                    x - topLeftX,
                    y - topLeftY,
                    glyph.getChar(),
                    glyph.getForeground(),
                    glyph.getBackground()
                );
            }
        }
        // Render the cursor
        display.draw(
            this._centerX - topLeftX,
            this._centerY - topLeftY,
            '@',
            'white',
            'black'
        );
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
            // Movement
            if (inputData.keyCode === ROT.VK_A) {
                this.move(-1, 0);
            } else if (inputData.keyCode === ROT.VK_D) {
                this.move(1, 0);
            } else if (inputData.keyCode === ROT.VK_W) {
                this.move(0, -1);
            } else if (inputData.keyCode === ROT.VK_S) {
                this.move(0, 1);
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
