<div align="center">
  <h1>Mobile First Media Queries Splitter Webpack Plugin</h1>
  <p>A Webpack plugin that splits your CSS main file into several CSS files based on media queries sizes, and automatically inject them into your index.html by the current media queries Mobile-First loading order approach.</p>
</div

> ⚠ Please note, the plugin checks for Media Queries in `px` unit only.

## What the plugin solves?
Let's assume your final CSS file looks like this:

**main.css**

```css
body {
  background-color: green;
}

@media (min-width:768px) and (max-width:991px) {
    body {
        background-color:red
    }
}

@media (min-width:992px) and (max-width:1199px) {
    body {
        background-color:blue;
    }
}

```

Now, after you will run a build command, you will get an `index.html` file that looks like this:

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Index.html file example</title>
    <link href="/assets/css/main.css" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/js/runtime.bundle.js"></script>
    <script src="/assets/js/main.bundle.js"></script>
  </body>
</html>
```

And what's the problem here? <br />
The problem is that you are loading a single CSS file (`main.css`), which contains settings that will not always need to be loaded.<br />
e.g If the user is browsing from a mobile device whose width is 480px, this user should not experience a browsing slowdown only because
the CSS file is too inflated.<br />
Instead, what is right to do is to divide the CSS file into separate files, which will load asynchronously and contain only the settings that the user really needs.

**main.css**

```css
body {
  background-color: green;
}
```

**main.768.css**

```css
@media (min-width:768px) and (max-width:991px) {
    body {
        background-color:red
    }
}
```

**main.992.css**

```css
@media (min-width:992px) and (max-width:1199px) {
    body {
        background-color:blue;
    }
}
```

And your new `index.html` file should look like this (and yes, the plugin takes care of that too!):

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Index.html file example</title>
    <link href="/assets/css/main.css" rel="stylesheet" />
    <link href="/assets/css/main.768.css" rel="stylesheet" media="(min-width: 768px)" />
    <link href="/assets/css/main.992.css" rel="stylesheet" media="(min-width: 992px)" />
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/js/runtime.bundle.js"></script>
    <script src="/assets/js/main.bundle.js"></script>
  </body>
</html>
```
## Let's get started

To begin, you'll need to install `mobile-first-media-queries-splitter-webpack-plugin`, `html-webpack-plugin`, and `mini-css-extract-plugin`.

```bash
npm install --save-dev mobile-first-media-queries-splitter-webpack-plugin html-webpack-plugin mini-css-extract-plugin
```
> ⚠ Please note, the plugin will not work properly if you do not use one of the plugins mentioned above, it is only meant to work with them.

Now, add the plugin to your `webpack` production config file. For example:

**webpack.production.js**

```js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MobileFirstMediaQueriesSplitterPlugin = require('mobile-first-media-queries-splitter-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  module: {
    rules: [
        {
            test: /\.css$/i,
            use: [MiniCssExtractPlugin.loader, "css-loader"],
        }
    ],
  },
  plugins: [
      new MiniCssExtractPlugin(),
      new MobileFirstMediaQueriesSplitterPlugin([768, 992]),
      new HtmlWebpackPlugin()
  ]
};
```

## Parameters

### Plugin Parameters

|                               Name                                |         Type         |                Default                | Description                                                                   |
| :---------------------------------------------------------------: | :------------------: | :-----------------------------------: | :---------------------------------------------------------------------------- |
|                    **[`mediaQueries`](#filename)**                    | `Array[]<INT>` |             `[]`              | Determines media queries sizes.                      |

#### `mediaQueries`

Type: `Array[]<INT>`
Default: `[]`

Determines media queries sizes.

E.G: 
```js
const mediaQueries = [768, 992];
const plugins = [ new MobileFirstMediaQueriesSplitterPlugin(mediaQueries) ];
...
```

## Dependence
- [mini-css-extract-plugin](https://www.npmjs.com/package/mini-css-extract-plugin)
- [html-webpack-plugin](https://www.npmjs.com/package/html-webpack-plugin)

### Please note, this plugin meant to be simple as possible, there is no fancy options in it, does not know how to handle grandiose Media Query rules, or different units from PX, just splits CSS Media Queries by the mobile first approach, KEEP IT SIMPLE!

### More Media Query Plugins

- [Media Query Plugin](https://github.com/SassNinja/media-query-plugin)
- [Media Query Splitting Plugin](https://github.com/mike-diamond/media-query-splitting-plugin)

## Credits

Parts of the plugin were written using code snippets written by others.

- [gulp-media-queries-splitter](https://www.npmjs.com/package/gulp-media-queries-splitter)
- [html-webpack-injector](https://www.npmjs.com/package/html-webpack-injector)

## License

[MIT](./LICENSE)
