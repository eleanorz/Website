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
var fs = require('fs');

var aws = JSON.parse(fs.readFileSync('awsaccess.secret'));
var s3 = require('gulp-s3-upload')(aws);

// --- Basic Tasks ---
var renameCase = function(){
	return rename(function(path){
		path.basename = path.basename.toLowerCase();
		if (path.basename != 'index') {
			path.extname = '';
		}
	})
};

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

gulp.task('philosophy', function() {
	return gulp.src('../writing/philosophy/*.md')
		.pipe(markdown())
		.pipe(extend('../writing/philosophy/index.json'))
		.pipe(jadetemplate({
			template: './source/templates/default.jade',
			pretty: true
		}))
		.pipe(renameCase())
		.pipe(gulp.dest('../build/philosophy/'))
		.pipe(livereload(server));
});

gulp.task('technology', function() {
	return gulp.src('../writing/technology/*.md')
		.pipe(markdown())
		.pipe(extend('../writing/technology/index.json'))
		.pipe(jadetemplate({
			template: './source/templates/default.jade',
			pretty: true
		}))
		.pipe(renameCase())
		.pipe(gulp.dest('../build/technology/'))
		.pipe(livereload(server));
});

gulp.task('application', function() {
	return gulp.src('../writing/application/*.md')
		.pipe(markdown())
		.pipe(extend('../writing/application/index.json'))
		.pipe(jadetemplate({
			template: './source/templates/default.jade',
			pretty: true
		}))
		.pipe(renameCase())
		.pipe(gulp.dest('../build/application/'))
		.pipe(livereload(server));
});

gulp.task('editorial', function() {
	return gulp.src('../writing/editorial/*.md')
		.pipe(markdown())
		.pipe(extend('../writing/editorial/index.json'))
		.pipe(jadetemplate({
			template: './source/templates/default.jade',
			pretty: true
		}))
		.pipe(renameCase())
		.pipe(gulp.dest('../build/editorial/'))
		.pipe(livereload(server));
});

gulp.task('about', function() {
	return gulp.src('../writing/about/*.md')
		.pipe(markdown())
		.pipe(extend('../writing/about/index.json'))
		.pipe(jadetemplate({
			template: './source/templates/default.jade',
			pretty: true
		}))
		.pipe(renameCase())
		.pipe(gulp.dest('../build/about/'))
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
		app.use(function(req, res, next) {
			if (req.path.indexOf('.') === -1) {
				var file = path.resolve(process.cwd(), '../build', '.' + req.path + '.html');
				fs.stat(file, function(err, stats) {
					if (!err && stats && stats.isFile())
						req.url += '.html';
					next();
				});
			}
			else
				next();
		});
		app.use(function(req, res, next) {
			if (req.path.indexOf('.') === -1) {
				var file = path.resolve(process.cwd(), '../build', '.' + req.path);
				fs.stat(file, function(err, stats) {
					if (!err && stats && stats.isFile()) {

						fs.readFile(file, function(err, data) {
							res.type('text/html');
							res.send(data);
						});
					}
					else
						next();
				});
			}
			else
				next();
		});
		app.use(express.static(path.resolve('../build')));
		app.use(function(req, res, next){
			res.status(404);

			console.log(__dirname + '/../build/error.html');

			// respond with html page
			if (req.accepts('html')) {
				res.sendFile(path.resolve(process.cwd(), '../build/error.html'));
				return;
			}

			// respond with json
			if (req.accepts('json')) {
				res.send({ error: 'Not found' });
				return;
			}

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

			gulp.watch('./source/templates/*.jade',
				['philosophy', 'technology', 'application', 'editorial', 'about']);

			gulp.watch('../writing/philosophy/*',['philosophy']);
			
			gulp.watch('../writing/technology/*',['technology']);

			gulp.watch('../writing/application/*',['application']);

			gulp.watch('../writing/editorial/*',['editorial']);

			gulp.watch('../writing/about/*',['about']);

		});
	});
}

gulp.task('upload', function() {
	return gulp.src("../build/**")
		.pipe(s3({
			Bucket: 'aaronsun',
			ACL: 'public-read',
			charset: 'utf-8',
			mimeTypeLookup: function(original_keyname) {
				console.log(original_keyname);
				if (original_keyname.indexOf('.') === -1) {
					return original_keyname + '.html';
				}
				return original_keyname;
			},
		}));
});

// Default Task
gulp.task('default', ['js','css', 'public',
	'philosophy', 'technology', 'application', 'editorial', 'about', 'pages',
	'express','watch']);




