const gulp = require('gulp');
const sass = require('gulp-sass');
const minifyImg = require('gulp-imagemin');
const minifyHTML = require('gulp-htmlmin');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const runSequence = require('run-sequence');
const nodemon = require('gulp-nodemon');
const sourcemaps = require("gulp-sourcemaps");
const webpack = require('webpack-stream');
const browserSync = require('browser-sync').create();
const rename = require("gulp-rename");
const dotenv = require('dotenv');
const gulpif = require('gulp-if');
const fs = require("fs");

dotenv.config();

const config = {
    devMode: process.env.node_env,
    sourceMaps: process.env.node_env === "development"
};


gulp.task("nodemon", async function (cb) {
    var callbackCalled = false;
    return nodemon({ script: "./server.js" }).on("start", function () {
        if (!callbackCalled) {
            callbackCalled = true;
            cb();
        }
    });
});

gulp.task('browser-sync', gulp.series("nodemon",function () {
    return browserSync.init(null, {
        proxy: "http://localhost:3000",
        port: 3001,
        baseDir: "./",
        open: true,
        notify: false,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });
}));

function distAsSameFolder(file) {
    let splittedUrl = file.history[0].split("\\");
    let projectName = splittedUrl.slice(splittedUrl.indexOf("public"), -1);
    console.log(projectName.join("/"));
    return "dist/" + projectName.join("/");
};

function swallowError(error) {
    console.log("EXPL Error: ",error.toString());
    this.emit('end');
}

gulp.task('css', async () => {
    let main = "src/css/main.scss";
    if(!fs.existsSync(main)) return;
    return gulp.src([
        main
    ])
    .pipe(gulpif(config.sourceMaps, sourcemaps.init()))
    .pipe(sass({
        precision: 10,
        includePaths: ['.'],
        errorLogToConsole:true,
        outputStyle:"compressed",
    })).on('error', swallowError)
    .pipe(autoprefixer())
    .pipe(gulpif(config.sourceMaps, sourcemaps.write('.')))
    .pipe(gulp.dest("dist/"))
    .pipe(browserSync.stream());{ browsers: ['last 2 versions']}
});

gulp.task("js", async () => {
    let main = "src/js/app.js";
    if(!fs.existsSync(main)) return;
    return gulp.src(main)
        .pipe(gulpif(config.sourceMaps, sourcemaps.init()))
        .pipe(webpack(require("./webpack.config.js"))).on('error', swallowError)
        .pipe(gulpif(config.sourceMaps, sourcemaps.write('.')))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});

gulp.task('html', async () => {
    return gulp.src("src/*.html")
        .pipe(minifyHTML({ collapseWhitespace: true }))
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream());
});

gulp.task('delete', () => {
    return del(["dist/*"]);
});

gulp.task('watch', async (e) => {
    gulp.watch([
        "src/**/*.css",
        "src/**/*.scss",
    ], gulp.series('css'));
    gulp.watch("src/**/*.js", gulp.series('js'));
    gulp.watch("src/*.html", gulp.series('html'));
    gulp.watch("src/fonts/*");
});

gulp.task("build", gulp.series(
    "delete",
    'html',
    'css',
    'js',
));

gulp.task("dev", gulp.parallel(
    "build",
    "watch",
    "browser-sync"
));

gulp.task('default', gulp.parallel('build'));