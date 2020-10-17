const exec = require('child_process').exec;
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    // devtool: 'eval-cheap-module-source-map',
    // devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, '../static/bg_stats'),
        filename: '[name].[contenthash].js',
        // filename: '[name].js',
    },
    optimization: {
        splitChunks: {
            chunks: 'all'
        },
        usedExports: true,
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                include: path.resolve(__dirname, 'src'),
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
                sideEffects: true,
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', {
                    loader: "less-loader",
                    options: {
                        javascriptEnabled: true
                    },
                }],
                sideEffects: true
            }
        ]
    },
    // externals: {
    //     "react-dom":"react-dom"
    // },
    plugins: [
        // {
        //     apply: (compiler) => {
        //         compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
        //             exec('post-build.bat', (err, stdout, stderr) => {
        //                 if (stdout) process.stdout.write(stdout);
        //                 if (stderr) process.stderr.write(stderr);
        //             });
        //         });
        //     }
        // },
        // new BundleAnalyzerPlugin(),
        new AntdDayjsWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'src/index.html',
            filename: '../../templates/bg_stats/index.html',
            inject: false,
        }),
    ]
};