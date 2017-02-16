const webpack = require('webpack')
const { resolve } = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV
const __DEV__  = NODE_ENV !== 'production'
const SRC_DIR  = resolve('./src')
const REL_DIR  = resolve('./release')

module.exports = {
    target: 'web',
    devtool: 'source-map',
    entry: {
        'static/client': [ 'babel-polyfill', 'client/index.js' ],
    },
    resolve: {
        modules: [ SRC_DIR, 'node_modules' ],
        extensions: [ '.js', '.jsx', '.json' ]
    },
    output: {
        path: REL_DIR,
        publicPath: '/',
        filename: '[name].js',
        pathinfo: true
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                include: SRC_DIR,
                loader: 'babel'
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            },
            {
                test: /\.(jpg|jpeg|gif|png)$/,
                exclude: /node_modules/,
                loader:'url-loader?limit=1024&name=images/[name].[ext]'
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                exclude: /node_modules/,
                loader: 'url-loader?limit=1024&name=fonts/[name].[ext]'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin("bundle.css"),
        new HtmlWebpackPlugin({
            title: 'Reactive Chat',
            filename: 'index.html',
            template: 'index.tpl.ejs',
            bundleCss: 'bundle.css'
        }),
        new webpack.DefinePlugin({
            __DEV__    : JSON.stringify(__DEV__),
            __CLIENT__ : JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
            'process.env': {
                'NODE_ENV': JSON.stringify(NODE_ENV)
            }
        })
    ].concat(
        __DEV__ ? [] : [
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: false,
                comments: false,
                compress: {
                    warnings: false,
                    dead_code: true,
                    unused: true,
                    join_vars: true,
                    drop_console: true
                }
            })
        ]
    )
}
