'use strict';

const CssFile = require('./CssFile');

class CssFiles {

    /**
     *
     * @param {Compilation} compilation
     * @param {Object} assets
     */
    constructor({compilation, assets}) {
        this.compilation = compilation;
        this.files = Object.keys(assets).filter(file => /\.css(\?.*)?$/i.test(file) && file);
    }

    /**
     *
     * @returns {Boolean}
     */
    haveFiles() {
        return this.files.length > 0;
    }

    /**
     *
     * @param {Function<CssFile>} cb
     */
    each(cb) {
        if (this.haveFiles() && typeof cb === 'function') {
            this.files.forEach((cssFilePathName) => {
                const cssFile = new CssFile({
                    cssFilePathName,
                    compilation: this.compilation,
                });
                cb(cssFile);
            });
        }
    }
}

module.exports = CssFiles;
