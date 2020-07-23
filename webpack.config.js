const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const webpack = require("webpack");

const devMode = process.env.node_env === "development" ? "source-map" : "";

module.exports = {
    mode: "none",
    entry: {
        index:'./src/js/app.js'
    },
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: devMode,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                loaders: ["style-loader","css-loader"]
            },
            {
                test: /\.(jpe?g|png|gif)$/i,
                loader:"file-loader",
                options:{
                    name:'[name].[ext]',
                    outputPath:'assets/images/'
                    //the images will be emited to dist/assets/images/ folder
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                mangle: {
                    toplevel: true,
                    //
                    //properties: true
                    //
                },
                allowEmpty: true,
            },
        })],
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery",
            "window.$": "jquery"
        })
    ],
    stats: 'errors-warnings'
};
