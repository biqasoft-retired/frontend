// THIS IS GULP 4

var gulp = require('gulp');

var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var cleanCSS = require('gulp-clean-css');

var clean = require('gulp-clean');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');

var git = require('gulp-git');
var replace = require('gulp-replace');

var gitRevision = {};

gulp.task('gitRevision', function (done) {
    git.revParse({args: 'HEAD'}, function (err, hash) {
        gitRevision = hash;
        if (err) {
            console.log('err: ' + err);
        } else {
            console.log('current git hash: ' + hash);
        }
        done();
    });
});

gulp.task('clean', function () {
    return gulp.src(['build/*'], {read: false})
        .pipe(clean());
});

gulp.task('usemin', function () {
    return gulp.src('index.html')
        .pipe(usemin({
            css: [cleanCSS(), 'concat'],
            html: [minifyHtml({empty: true})],
            js: [uglify({mangle: true})]
        }))
        .pipe(replace('GLOBAL_CONSTANTS.GIT_REVISION=null', 'GLOBAL_CONSTANTS.GIT_REVISION="' + gitRevision + '"'))
        .pipe(gulp.dest('./build/'));
});

gulp.task('copyRobotsTxt', function () {
    return gulp.src(['./robots.txt']).pipe(gulp.dest('./build'));
});

gulp.task('copyBrowserconfig', function () {
    return gulp.src(['./browserconfig.xml']).pipe(gulp.dest('./build'));
});

gulp.task('copyManifest', function () {
    return gulp.src(['./manifest.json']).pipe(gulp.dest('./build'));
});

gulp.task('copySafariPinned', function () {
    return gulp.src(['./assets/favicon/safari-pinned-tab.svg']).pipe(gulp.dest('./build/assets/favicon'));
});

gulp.task('copyCheckmarkImage', function () {
    return gulp.src(['./assets/css/img/checkmark.png']).pipe(gulp.dest('./build/build/img'));
});

gulp.task('copyFlagImage', function () {
    return gulp.src(['./assets/css/ui/images/flags.png']).pipe(gulp.dest('./build/build/ui/images'));
});

gulp.task('copyAssets', function () {
    return gulp.src(['assets/**/*']).pipe(gulp.dest('./build/assets'));
});

gulp.task('copyFontAwesome', function () {
    gulp.src(['node_modules/font-awesome/fonts/**/*']).pipe(gulp.dest('./build/fonts'));
    return gulp.src(['node_modules/bootstrap/fonts/**/*']).pipe(gulp.dest('./build/fonts'));
});

gulp.task('copyAngularPaginationTemplate', function () {
    return gulp.src(['node_modules/angular-utils-pagination/**/*']).pipe(gulp.dest('./build/node_modules/angular-utils-pagination'));
});

gulp.task('compileAngularTemplates', function () {
    return gulp.src('templates/**/*.html')
        .pipe(minifyHtml({empty: true}))
        .pipe(templateCache({root: 'templates'}))
        .pipe(gulp.dest('./build'));
});

gulp.task('compileAngularTemplatesViews', function () {
    return gulp.src('app/components/**/*.html')
        .pipe(minifyHtml({empty: true}))
        .pipe(templateCache({filename: 'views.js', root: 'app/components'}))
        .pipe(uglify())
        .pipe(gulp.dest('./build'));
});
gulp.task('compileJavaScript', function () {
    return gulp.src(['./build/build/build.js', './build/views.js', './build/templates.js'])
        .pipe(concat('build.js'))
        .pipe(gulp.dest('./build/build/'));
});

gulp.task('cleanTemps', function () {
    return gulp.src(['./build/views.js', './build/templates.js'], {read: false})
        .pipe(clean());
});

gulp.task('copyMaterialIcons', function () {
    return gulp.src(['node_modules/material-design-icons/iconfont/**/*']).pipe(gulp.dest('./build/build'));
});

gulp.task(
    'default',
    gulp.series(
        'clean',
        'gitRevision',
        'compileAngularTemplates',
        'compileAngularTemplatesViews',
        'usemin',
        'copyAngularPaginationTemplate',
        'copyAssets',
        'copyFontAwesome',
        'compileJavaScript',
        'cleanTemps',
        gulp.parallel('copyMaterialIcons', 'copyRobotsTxt', 'copyCheckmarkImage', 'copyBrowserconfig', 'copyManifest', 'copySafariPinned', 'copyFlagImage')
    )
);