var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserify = require('gulp-browserify');

gulp.task('default', function(){
    console.log(`this is working?`);
    //gulp.watch('js/*.js', ['lint']);

    browserSync.init({
        server: {
            baseDir: "./"
        }
    })
    // gulp.src(css/styles.css)
    //     .pipe(autoprefixer({
    //         browsers: ['last 2 versions'],
    //         cascade: false
    //     }))
    //     .pipe(gulp.dest('dist'))
});


gulp.task('scripts', function() {
    // Single entry point to browserify
    gulp.src('js/sw.js')
        .pipe(browserify({
          insertGlobals : true,
          debug : !gulp.env.production
        }))
        .pipe(gulp.dest('dist/bundle.js'))
});

