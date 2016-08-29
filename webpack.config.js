
var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var BowerWebpackPlugin = require("bower-webpack-plugin");
var I18nPlugin = require("i18n-webpack-plugin");

var _watchPath = "./src-webpack/";
var _outputRoot = __dirname+"/src/";


var languages = {
	"en": null
	, "cn": require(_watchPath+"static/js/i18n/cn.json")
};

var entry = {
    "index": _watchPath+"static/js/index.js"
    , "list": _watchPath+"static/js/list.js"
    , "view": _watchPath+"static/js/view.js"
};

var chunks = Object.keys(entry);

var config = {

    entry: entry

    , output: {
        path: _outputRoot + '/static/js/',
        filename: "[name].js"
    }

    , module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
            , { test: /\.json$/, loader: "json-loader" }
            , { test: /\.jsx$/, loader: "jsx-loader?insertPragma=React.DOM&harmony" }
			, { test: /\.tpl$/, loader: "underscore-template-loader" }
			, { test: /\.jpg$/, loader: "file-loader" },
			, { test: /\.png$/, loader: "url-loader?mimetype=image/png" }
        ]
        /*
        , postLoaders: [ {
            test: /\.js$/,
            exclude: /\/(node_modules|bower_components)\//,
            loader: 'autopolyfiller',
            query: { browsers: [ 'ie >= 7' ] }
        }] 
        */
    }
    , externals: {
        'react': 'React'
        , 'react-dom': 'ReactDOM'
        , 'jquery': '$'
        , 'zepto': '$'
    }
    , resolve: {
        extensions: ['', '.js', '.jsx']
        , alias: {
            'swfobject': __dirname + '/bower_components/swfobject-amd/swfobject.js'
        }

    }
    , plugins: [
        new BowerWebpackPlugin({
          excludes: /.*\.less/
        })
        , new CommonsChunkPlugin({
            name: 'vendors', 
            chunks: chunks, 
            minChunks: chunks.length 
        })
        , new webpack.ProvidePlugin({
          $:      "jquery"
          , jQuery: "jquery"
          , Zepto: "zepto"
          , React: "react"
          , ReactDOM: "react-dom"
        })
        , new ExtractTextPlugin('[name].css')
        , new webpack.HotModuleReplacementPlugin() 
        , new I18nPlugin(
            languages[ 'cn' ]
        )
    ]
}

/* 为每个监听页面编译生成新的html文件 */
foreachFolder(_watchPath,function(list){
	for(var i = 0,item; item = list[i++];){
        var filename = item[0];
		if(/\.html$/.test(filename)){
            var name = filename.slice(0, -5);
            if( !( name in entry ) ) continue;
            config.plugins.push(new HtmlWebpackPlugin({ 
				filename: _outputRoot + name + '.html', 
				template: _watchPath + name + '.html', 
				inject: true, 
				hash: true, 
				chunks: ['vendors', name]
			}));
		}
	}
});


module.exports = config;

/* 遍历目录中的文件通过数组返回 */
function foreachFolder(path, cb){
    var folder_exists = fs.existsSync(path);
    var fileList = [];
    if(folder_exists == true)
    {
       var dirList = fs.readdirSync(path);
       dirList.forEach(function(fileName){
            fileList.push([fileName, path , path+fileName]);
       });
    };
    return cb(fileList);
}

