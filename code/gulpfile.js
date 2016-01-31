var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    csso        = require('gulp-csso'),
    data        = require('gulp-data'),
    uglify          = require('gulp-uglify'),
    jade            = require('gulp-jade'),
    jadetemplate    = require('./gulp-jade-template'),
    concat      = require('gulp-concat'),
    livereload  = require('gulp-livereload'), // Livereload plugin needed: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
    tinylr      = require('tiny-lr'),
    express     = require('express'),
    app         = express(),
    marked      = require('marked'), // For :markdown filter in jade
    path        = require('path'),
    server      = tinylr();
    rename      = require('gulp-rename');

var markdown = require('gulp-markdown-to-json');
var clean = require('gulp-clean');
//var extend = require('gulp-extend');
var cat  = require('gulp-cat');
var extend = require("./gulp-json-extend");
var copy = require("gulp-copy");

// --- Basic Tasks ---


'clean'
{
  gulp.task('clean', function () {
    return gulp.src('../build/', {read: false})
      .pipe(clean({force: true}));
  });
}

'css'
{
  gulp.task('css', function() {
    return gulp.src('source/stylesheets/*.scss')
      .pipe( 
        sass( { 
          includePaths: ['src/assets/stylesheets'],
          errLogToConsole: true
        } ) )
      //.pipe( csso() )
      .pipe( gulp.dest('../build/assets/') )
      .pipe( livereload( server ));
  });
}

'js'
{
  gulp.task('js', function() {
    return gulp.src('source/scripts/*.js')
      .pipe( uglify() )
      //.pipe( concat('all.min.js'))
      .pipe( gulp.dest('../build/assets/'))
      .pipe( livereload( server ));
  });
}

'public'
{
  gulp.task('public', function() {
    return gulp.src('source/public/*')
      .pipe( copy('../build/assets/', { prefix: 2 } ) )
      .pipe( livereload( server ));
  });
}

gulp.task('application', function() {
  return gulp.src('../writing/application/*.md')
    .pipe(markdown())
    .pipe(extend('../writing/application/index.json'))
    //.pipe(cat())
    .pipe(jadetemplate({
      template: './source/templates/default.jade',
      pretty: true
    }))
    .pipe(gulp.dest('../build/application/'))
    .pipe(rename({extname:'.html'}))
    .pipe(livereload(server));
});

gulp.task('editorial', function() {
  return gulp.src('../writing/editorial/*.md')
    .pipe(markdown())
    .pipe(extend('../writing/editorial/index.json'))
    //.pipe(cat())
    .pipe(jadetemplate({
      template: './source/templates/default.jade',
      pretty: true
    }))
    .pipe(gulp.dest('../build/editorial/'))
    .pipe(rename({extname:'.html'}))
    .pipe(livereload(server));
});

gulp.task('pages', function() {
  return gulp.src('./source/pages/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('../build/'))
    .pipe(livereload(server));
});

'express'
{
  gulp.task('express', function() {
    app.use(express.static(path.resolve('../build')));
    app.use(function(req, res, next){
      res.status(404);

      // default to plain-text. send()
      res.type('txt').send('Not found');
    });
    app.listen(1337);
    gutil.log('Listening on port: 1337');
});
}

'watch'
{
  gulp.task('watch', function () {
    server.listen(35729, function (err) {
      if (err) {
        return console.log(err);
      }

      gulp.watch('./source/stylesheets/*.scss',['css']);

      gulp.watch('./source/scripts/*.js',['js']);

      gulp.watch('./source/pages/*',['pages']);

      gulp.watch('./source/templates/*.jade',['application', 'editorial']);
      
      gulp.watch('../writing/application/*',['application']);

      gulp.watch('../writing/editorial/*',['editorial']);
    });
  });
}

// Default Task
gulp.task('default', ['js','css', 'public',
  'application', 'editorial', 'pages',
  'express','watch']);




