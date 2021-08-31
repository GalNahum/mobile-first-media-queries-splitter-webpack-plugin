'use strict';

/**
 * CssFile class Object
 * Responsible for the css file object documentend dictionary.
 *
 * @class
 * @typedef {Object} CssFile
 */
class CssFile {

    /**
     * The css file suffix hash.
     * You can name it via the [contenthash]
     *      e.g: main.[contenthash].css | main.7969c4313e1267cf464.css
     *
     * @since 1.0.0
     * @var {String}
     * @access private
     */
    #contenthash;

    /**
     * The css file contents.
     * Keep the css file contents as a plain string.
     *
     * @since 1.0.0
     * @var {String}
     * @access private
     * @example - '.body { color: red; } .my-css-class { color: black } ...'
     */
    #contents;

    /**
     * The css file name as a relative path.
     * File name determined by the MiniCssExtractPlugin @property <filename>
     *     e.g: ...{ plugins:[ new MiniCssExtractPlugin({ filename: 'styles/[name].[contenthash].css' }) ]}
     *
     * @since 1.0.0
     * @var {String}
     * @access private
     * @example - /styles/main.7969c4313e1267cf464.css
     */
    #name;

    /**
     * Create css file documentend object dictionary.
     *
     * @param {Compilation} compilation
     * @param {String} cssFilePathName
     */
    constructor({compilation, cssFilePathName}) {

        const {contenthash} = compilation.assetsInfo.get(cssFilePathName);

        this.#contenthash = contenthash;

        const asset = compilation.getAsset(cssFilePathName);

        this.#name = asset.name;

        this.#contents = asset.source.source();
    }

    /**
     * Retrieve css file [contenthash].
     *
     * @returns String
     */
    get contenthash() {
        return this.#contenthash;
    }

    /**
     * Retrieve css file name as a relative path.
     *
     * @returns String
     */
    get name() {
        return this.#name;
    }

    /**
     * Retrieve css file contents as a plain string.
     *
     * @returns String
     */
    get contents() {
        return this.#contents;
    }
}


module.exports = CssFile;
