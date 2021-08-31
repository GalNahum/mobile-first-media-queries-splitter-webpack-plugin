'use strict';

class PrepareMediaQueries {

    #filename = '';

    #mediaQueries = [];

    constructor({cssFile, mediaQueries = []}) {
        this.#filename = cssFile.name.split(/\.css(\?.*)?$/i)[0]; // e.g styles/main.17969c4313e1267cf464;
        this.#mediaQueries = [...mediaQueries];
        this.#mediaQueries.unshift(this.#mediaQueries[0] - 1);
    }

    #addCssExtension(mediaQuery) {
        let filename = this.#filename;
        if (mediaQuery) {
            filename = filename.concat('.').concat(mediaQuery.toString());
        }
        return filename.concat('.css');
    }

    static addPxSuffix(str) {
        return str.concat('px');
    }

    #getPreparedFilename(mediaQuery) {
        return this.#addCssExtension(mediaQuery);
    }

    #generateOutput(mediaQuery) {
        const filename = this.#getPreparedFilename(mediaQuery);
        return (media) => {
            return {
                filename,
                media
            }
        }
    }

    #mapMediaQueries( mediaQuery, index ) {
        const generateOutput = this.#generateOutput(index > 0 && mediaQuery);
        const min = PrepareMediaQueries.addPxSuffix(mediaQuery.toString());
        const isFirstLoop = (index === 0);
        const isLastLoop = (index === this.#mediaQueries.length - 1);
        if (isFirstLoop) {
            /*output = {
                filename,
                media: ['none', {minUntil: min}]
            };*/
            return generateOutput(['none', {minUntil: min}])
        } else if (isLastLoop) { // last
            /*output = {
                filename,
                media: [{min}]
            };*/
            return generateOutput([{min}])
        } else {
            /*output = {
                filename,
                media: [{
                    min,
                    minUntil: `${this.mediaQueries[index + 1] - 1}px`
                }]
            }*/
            return generateOutput([{
                min,
                minUntil: `${this.#mediaQueries[index + 1] - 1}px`
            }]);
        }
    }

    prepare() {
        return this.#mediaQueries.map( this.#mapMediaQueries.bind(this) );
    }
}

module.exports = PrepareMediaQueries;
