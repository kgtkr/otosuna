module.exports = {
    entry: './app/app.ts',
    output: {
        path: __dirname + '/app',
        filename: 'bundle.js'
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        },
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    target: "atom",
    module: {
        loaders: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.json$/, loader: "json-loader" }
        ]
    }
};