'use strict';

const cssParse = require('css-parse');
const cssStringify = require('css-stringify');

/**
 *
 * @class
 * @typedef {Object} MediaQueriesSplitter
 */
class MediaQueriesSplitter {

    static findNextNonCommentStylesheetRule(rules, currentIndex) {
        let nextRule = false;
        while (typeof rules[++currentIndex] !== 'undefined') {
            if (rules[currentIndex].type !== 'comment') {
                nextRule = rules[currentIndex];
                break;
            }
        }
        return nextRule;
    }

    constructor({cssFile, prepareMediaQueries}) {
        this.contents = cssFile.contents.toString();
        this.options = [...prepareMediaQueries.prepare()];
    }

    static #generateOutputFiles( outputFiles ) {
        for (let filename in outputFiles) {
            outputFiles[filename] = cssStringify({
                type: 'stylesheet',
                stylesheet: {rules: outputFiles[filename]}
            });
        }
        return outputFiles;
    }

    handle() {
        let outputFiles = {};

        let rules = cssParse(this.contents).stylesheet.rules;

        rules.forEach((rule, ruleIndex) => {
            let _rule = rule;

            // Check whether the current rule is a comment, keep it with the next non-comment rule (if there is any)
            if (rule.type === 'comment') {
                _rule = MediaQueriesSplitter.findNextNonCommentStylesheetRule(rules, ruleIndex);

                if (!_rule) {
                    _rule = rule;
                }
            }

            // Only add the rule to the list if it's a @media rule, and if it's the matching rule. Or, add it if no specific media query was specified
            if (!Array.isArray(this.options)) {
                this.options = [this.options];
            }

            this.options.forEach((option) => {

                if (!option.media || !option.filename) {
                    return;
                }

                if (!Array.isArray(option.media)) {
                    option.media = [option.media];
                }

                option.media.every((optionMedia) => {

                    let outputFile = '',
                        isMediaWidthRule = false,
                        ruleMediaMin = null,
                        ruleMediaMax = null;

                    if (_rule.type === 'media' && _rule.media) {
                        ruleMediaMin = _rule.media.match(/\(min-width:\s*([0-9]+)px\)/);
                        ruleMediaMax = _rule.media.match(/\(max-width:\s*([0-9]+)px\)/);

                        if ((ruleMediaMin && ruleMediaMin[1]) || (ruleMediaMax && ruleMediaMax[1])) {
                            isMediaWidthRule = true;

                            ruleMediaMin = ruleMediaMin ? ruleMediaMin[1] : 0;
                            ruleMediaMax = ruleMediaMax ? ruleMediaMax[1] : 0;
                        }
                    }

                    if (typeof optionMedia === 'string') {
                        if (optionMedia === 'all' || (optionMedia === 'none' && !isMediaWidthRule)) {
                            outputFile = option.filename;
                        }
                    } else if (typeof optionMedia === 'object' && isMediaWidthRule) {
                        let optionMediaMin = optionMedia.min ? parseInt(optionMedia.min, 10) : 0,
                            optionMediaMinUntil = optionMedia.minUntil ? parseInt(optionMedia.minUntil, 10) : 0,
                            optionMediaMax = optionMedia.max ? parseInt(optionMedia.max, 10) : 0;

                        if (!optionMediaMinUntil && optionMediaMax) {
                            optionMediaMinUntil = optionMediaMax;
                        }

                        try {
                            let ruleMeetsOptionMediaMin = optionMediaMin ? ruleMediaMin && ruleMediaMin >= optionMediaMin : true,
                                ruleMeetsOptionMediaMinUntil = optionMediaMinUntil && ruleMediaMin ? ruleMediaMin < optionMediaMinUntil : true,
                                ruleMeetsOptionMediaMax = optionMediaMax && ruleMediaMax ? ruleMediaMax < optionMediaMax : true;

                            if (ruleMeetsOptionMediaMin && ruleMeetsOptionMediaMinUntil && ruleMeetsOptionMediaMax) {
                                outputFile = option.filename;
                            }
                        } catch (error) {
                        }
                    }

                    if (outputFile) {
                        if (typeof outputFiles[outputFile] === 'undefined') {
                            outputFiles[outputFile] = [];
                        }

                        outputFiles[outputFile].push(rule);

                        //Return false to break the loop, to prevent the current rule to be added to the same file multiple times
                        return false;
                    }

                    return true;
                });
            });
        });

        return MediaQueriesSplitter.#generateOutputFiles( outputFiles );
    }
}

module.exports = MediaQueriesSplitter;
