/*global Game, console, ROT */
/*jslint nomen: true*/

Game.Entity = function (properties) {
    'use strict';
    properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.Glyph.call(this, properties);
    // Instantiate any properties from the passed object
    this._name = properties.name || '';
    this._x = properties.x || 0;
    this._y = properties.y || 0;
    // Create an object which will keep track what mixins we have
    // attached to this entity based on the name property
    this._attachedMixins = {};
    // Setup the object's mixins
    var mixins = properties.mixins || [],
        i,
        key;
    for (i = 0; i < mixins.length; i = i + 1) {
        // Copy over all properties from each mixin as long
        // as it's not the name or the init property. We
        // also make sure not to override a property that
        // already exists on the entity.
        for (key in mixins[i]) {
            if (key !== 'init' && key !== 'name' && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
        }
        // Add the name of this mixin to our attached mixins
        this._attachedMixins[mixins[i].name] = true;
        // Finally call the init function if there is one
        if (mixins[i].init) {
            mixins[i].init.call(this, properties);
        }
    }
};
// Make entities inherit all the functionality from glyphs
Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.setName = function (name) {
    'use strict';
    this._name = name;
};
Game.Entity.prototype.setX = function (x) {
    'use strict';
    this._x = x;
};
Game.Entity.prototype.setY = function (y) {
    'use strict';
    this._y = y;
};
Game.Entity.prototype.getName = function () {
    'use strict';
    return this._name;
};
Game.Entity.prototype.getX = function () {
    'use strict';
    return this._x;
};
Game.Entity.prototype.getY   = function () {
    'use strict';
    return this._y;
};
Game.Entity.prototype.hasMixin = function (obj) {
    'use strict';
    // Allow passing the mixin itself or the name as a string
    if (typeof obj === 'object') {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[name];
    }
};
