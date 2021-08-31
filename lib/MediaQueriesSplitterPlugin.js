'use strict';

const HtmlInjector = require('./HtmlInjector');
const CssFiles = require('./CssFiles');
const PrepareMediaQueries = require('./PrepareMediaQueries');
const MediaQueriesSplitter = require('./MediaQueriesSplitter');

/**
 * The main Webpack plugin of this module package.
 * @class
 * @typedef {Object} MediaQueriesSplitterPlugin
 */
class MediaQueriesSplitterPlugin {

    /**
     * @access private
     */
    #compilation;

    /**
     *
     * @type {Array<String>}
     * @access private
     */
    #filesToInject = [];

    /**
     *
     * @param {Number} mediaQuerySize
     * @param {Number} index
     *
     * @returns Number
     */
    static validateMediaQuerySize(mediaQuerySize, index = 0) {
        if (Number.isNaN(mediaQuerySize))
            throw new Error(`${MediaQueriesSplitterPlugin.name}: The media query size in index position ${index}, it's not a valid number, please add a valid number and build again.`);

        if (mediaQuerySize <= 0)
            throw new Error(`${MediaQueriesSplitterPlugin.name}: The media query size in index position ${index}, it's less than or equal to zero, please add a number greater than zero and build again.`);

        return mediaQuerySize;
    }

    /**
     * Any options should be passed in the constructor of your plugin,
     * (this is a public API of your plugin).
     *
     * @param {array} mediaQueries
     */
    constructor(mediaQueries = []) {
        this.mediaQueries = mediaQueries
            .map(mediaQuerySize => parseInt(mediaQuerySize))
            .filter(MediaQueriesSplitterPlugin.validateMediaQuerySize)
            .sort((a, b) => a - b);
    }

    /**
     *
     * @returns {Array<String>}
     */
    get filesToInject() {
        return this.#filesToInject;
    }

    /**
     * RawSource is one of the "sources" classes that should be used
     * to represent asset sources in compilation.
     *
     * @param {String} sourceCode
     */
    #getRawSourceInstance(sourceCode) {
        const {RawSource} = this.webpack.sources;
        return new RawSource(sourceCode);
    }

    /**
     * Adding new asset to the compilation, so it would be automatically
     * generated by the webpack in the output directory.
     *
     * @param {String} file
     * @param {String} source
     * @param {Boolean} update
     */
    #emitAsset({file, source, update = false}) {
        const fn = (update ? 'update' : 'emit').concat('Asset');
        this.#compilation[fn](file, this.#getRawSourceInstance(source));
    }

    /**
     *
     * @param {String} file
     * @param {String} source
     * @param {Boolean} assetNeedToBeUpdated
     */
    #createAssetByMediaQuery({file, source, update: assetNeedToBeUpdated}) {
        this.#emitAsset({
            file,
            source,
            update: assetNeedToBeUpdated
        });

        if (!assetNeedToBeUpdated)
            this.#filesToInject.push(file);
    }

    /**
     *
     * @param {CssFile} cssFile
     * @param {MediaQueriesSplitter} mediaQueriesSplitter
     */
    #createAssetsByMediaQueries({cssFile, mediaQueriesSplitter}) {
        const outputFiles = {...mediaQueriesSplitter.handle()};
        if (Object.keys(outputFiles).length) {

            for (let file in outputFiles) {

                const source = outputFiles[file];

                const assetNeedToBeUpdated = (cssFile.name === file);

                this.#createAssetByMediaQuery({file, source, update: assetNeedToBeUpdated});
            }
        }
    }

    /**
     *
     * @param {Object} assets -  object that contains all assets in the compilation
     *                  the keys of the object are pathnames of the assets
     *                  and the values are file sources.
     */
    #addAssets(assets) {
        const cssFiles = new CssFiles({
            compilation: this.#compilation,
            assets
        });

        if (cssFiles.haveFiles()) {

            const loopEachCssFile = ( cssFile ) => {
                const prepareMediaQueries = new PrepareMediaQueries({
                    cssFile,
                    mediaQueries: [...this.mediaQueries]
                });

                const mediaQueriesSplitter = new MediaQueriesSplitter({
                    cssFile,
                    prepareMediaQueries,
                });

                this.#createAssetsByMediaQueries({
                    cssFile,
                    mediaQueriesSplitter
                });
            };

            cssFiles.each( loopEachCssFile );
        }
    }

    /**
     *
     * @param {String} pluginName
     */
    #processAssets(pluginName) {
        const options = {
            name: pluginName || MediaQueriesSplitterPlugin.name,
            // Using one of the later asset processing stages to ensure
            // that all assets were already added to the compilation by other plugins.
            stage: this.webpack.Compilation.PROCESS_ASSETS_STAGE_DERIVED
        };

        this.#compilation
            .hooks
            .processAssets
            .tap(options, this.#addAssets.bind(this));
    }

    apply(compiler) {
        const pluginName = MediaQueriesSplitterPlugin.name;

        // webpack module instance can be accessed from the compiler object,
        // this ensures that correct version of the module is used
        // (do not require/import the webpack or any symbols from it directly).
        this.webpack = compiler.webpack;

        new HtmlInjector({
            compiler,
            mediaQueriesSplitterPlugin: this
        });

        // Tapping to the "thisCompilation" hook in order to further tap
        // to the compilation process on an earlier stage.
        compiler
            .hooks
            .thisCompilation
            .tap(pluginName, (compilation) => {
                this.#compilation = compilation;
                this.#processAssets(pluginName);
            });
    }
}

module.exports = MediaQueriesSplitterPlugin;