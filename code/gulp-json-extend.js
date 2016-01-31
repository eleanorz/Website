'use strict';

var extend = require('util')._extend;

var through = require('through2');
var ext = require('gulp-util').replaceExtension;
var PluginError = require('gulp-util').PluginError;
var path = require('path');
var fs = require('fs');

module.exports = function(extension){

  function JsonExtend(file, enc, cb){
    if(file.isStream()){
      return cb(new PluginError('gulp-json-extend', 'Streaming not supported'));
    }

    if(file.isBuffer()){
      try {
        var contents = JSON.parse(file.contents);
        var json = path.resolve(process.cwd(), extension);

        extend(contents, JSON.parse(fs.readFileSync(extension, 'utf8')));

        file.contents = new Buffer(JSON.stringify(contents));
      } catch(e) {
        return cb(new PluginError('gulp-json-extend', e));
      }
    }
    cb(null, file);
  }

  return through.obj(JsonExtend);
};