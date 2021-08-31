'use strict';

/**
 * HtmlWebpackPlugin type definition
 * @typedef {Object} HtmlWebpackPlugin
 * @property {String} name
 * @property {Function} getHooks
 */

/**
 * Inject css files into the {template}.html using the HtmlWebpackPlugin hooks.
 * @class
 */
class HtmlInjector {

    /**
     * @var HtmlWebpackPlugin
     */
    static #htmlWebpackPlugin;

    #compiler;

    /**
     * @var {Compilation}
     */
    #compilation;

    /**
     * @class MediaQueriesSplitterPlugin #mediaQueriesSplitterPlugin
     */
    #mediaQueriesSplitterPlugin;

    /**
     * @param {HtmlWebpackPlugin} htmlWebpackPlugin
     */
    static set htmlWebpackPlugin( htmlWebpackPlugin  ) {
        if( htmlWebpackPlugin.name !== 'HtmlWebpackPlugin' )
            throw new Error('You should use HtmlWebpackPlugin (html-webpack-plugin) only.');

        HtmlInjector.#htmlWebpackPlugin = htmlWebpackPlugin;
    }

    static getHtmlWebpackPlugin() {
        if( typeof HtmlInjector.#htmlWebpackPlugin === 'undefined' ) {
            try {
                HtmlInjector.#htmlWebpackPlugin = require('html-webpack-plugin');
            }
            catch (err) {
                throw err;
            }
        }
        return HtmlInjector.#htmlWebpackPlugin;
    }

    static hasHooks() {
        return HtmlInjector.getHtmlWebpackPlugin()?.getHooks;
    }

    #getHooks() {
        return HtmlInjector
            .getHtmlWebpackPlugin()
            .getHooks(this.#compilation);
    }

    static #injectFile({filename, data /*pass by reference*/}) {
        const href = filename
            .replace(/^\/+|\/+$/g, '') // Remove single or consecutive leading and trailing slashes
            .replace(/^/, '/'); // Add forward slashes to the start of the string because this is how attributes.href expecting e.g /styles/main.17969c4313e1267cf464

        const media = href.match(/(\?.*)?-([0-9]+).css(\?.*)?$/i);

        data.headTags.push({
            tagName: 'link',
            voidTag: true,
            attributes: {
                href,
                rel: 'stylesheet',
                media: media ? `(min-width: ${media[2]}px)` : 'all'
            }
        });

        return {...data};
    }

    #injector(data, callback) {
        if (data.headTags.length) {
            const injectFilesToHtmlTemplate = (filename) => HtmlInjector.#injectFile({filename, data});
            this.#mediaQueriesSplitterPlugin
                .filesToInject
                .forEach( injectFilesToHtmlTemplate );
        }
        callback(null, data);
    }

    hookAlterAssetTagGroupsAsync( cb ) {
        this.#getHooks()
            .alterAssetTagGroups.tapAsync('MediaQueriesSplitterPlugin', cb );
    }

    /**
     *
     * @param {Compiler} compiler
     * @param {MediaQueriesSplitterPlugin} mediaQueriesSplitterPlugin
     */
    constructor( {compiler, mediaQueriesSplitterPlugin} ) {
        this.#compiler = compiler;
        this.#mediaQueriesSplitterPlugin = mediaQueriesSplitterPlugin;
        if ( HtmlInjector.hasHooks() ) {
            compiler.hooks.compilation.tap(
                'MediaQueriesSplitterPlugin',
                /** @type {Compilation} */ (compilation) => {
                    this.#compilation = compilation;
                    this.hookAlterAssetTagGroupsAsync( this.#injector.bind(this) );
                }
            );
        }
    }
}

module.exports = HtmlInjector;