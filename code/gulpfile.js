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

// --- Basic Tasks ---
gulp.task('clean', function () {
  return gulp.src('../build/', {read: false})
    .pipe(clean({force: true}));
});

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

gulp.task('js', function() {
  return gulp.src('source/scripts/*.js')
    .pipe( uglify() )
    //.pipe( concat('all.min.js'))
    .pipe( gulp.dest('../build/assets/'))
    .pipe( livereload( server ));
});

gulp.task('templates', function() {
  return gulp.src('../writing/**/*.md')
    .pipe(markdown())
    .pipe(jadetemplate({
      template: './source/templates/default.jade',
      pretty: true
    }))
    .pipe(gulp.dest('../build/'))
    .pipe(rename({extname:'.html'}))
    .pipe(livereload(server));
});

gulp.task('express', function() {
  app.use(express.static(path.resolve('../build')));
  app.listen(1337);
  gutil.log('Listening on port: 1337');
});

gulp.task('watch', function () {
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err);
    }

    gulp.watch('./source/stylesheets/*.scss',['css']);

    gulp.watch('./source/scripts/*.js',['js']);

    gulp.watch('./source/templates/*.jade',['templates']);
    
    gulp.watch('../writing/**/*.md',['templates']);
  });
});

// Default Task
gulp.task('default', ['js','css','templates','express','watch']);