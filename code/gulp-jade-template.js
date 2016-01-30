'use strict';

var extend = require('util')._extend;

var through = require('through2');
var defaultJade = require('jade');
var ext = require('gulp-util').replaceExtension;
var PluginError = require('gulp-util').PluginError;
var path = require('path');

module.exports = function(options){
  var opts = extend({}, options);
  var jade = opts.jade || defaultJade;

  function CompileJade(file, enc, cb){
    opts.filename = file.path;

    if(file.data){
      opts.data = file.data;
    }

    file.path = ext(file.path, opts.client ? '.js' : '.html');

    if(file.isStream()){
      return cb(new PluginError('gulp-jade', 'Streaming not supported'));
    }

    if(file.isBuffer()){
      try {
        var compiled;
        var contents = String(file.contents);
        var template = path.resolve(process.cwd(), opts.template);
        compiled = jade.compileFile(template, opts)(JSON.parse(contents));
        file.contents = new Buffer(compiled);
      } catch(e) {
        return cb(new PluginError('gulp-jade', e));
      }
    }
    cb(null, file);
  }

  return through.obj(CompileJade);
};