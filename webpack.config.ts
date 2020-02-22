const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: "./src/index.tsx",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            { 
                test: /\.tsx?$/, 
                use: "awesome-typescript-loader" 
            },
            {
                test: /\.(png|jpg|gif|mp3)$/,
                use: 'file-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ]
    },
    
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            title: '2D Platformer',
            template: 'index.html',
            filename: './index.html'
        })
    ]
};
