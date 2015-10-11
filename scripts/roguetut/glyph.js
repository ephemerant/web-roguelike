/*global Game */
/*jslint nomen: true*/

Game.Glyph = function (chr, foreground, background) {
    'use strict';
    // Instantiate properties to default if they weren't passed
    this._char = chr || ' ';
    this._foreground = foreground || 'white';
    this._background = background || 'black';
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function () {
    'use strict';
    return this._char;
};
Game.Glyph.prototype.getBackground = function () {
    'use strict';
    return this._background;
};
Game.Glyph.prototype.getForeground = function () {
    'use strict';
    return this._foreground;
};
