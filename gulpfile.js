/*-------------------------------------------------------------  
Author: hiro
定義
1.gulp定義
2.path定義
3.リロード定義
4.ejs
5.SASS
6.minファイル
7.画像圧縮

処理内容
1.ローカルサーバー構築
2.ファイル更新監視
3.ejsコンパイル
4.Sassコンパイル
5.minファイル作成
6.デフォルト
---------------------------------------------------------------*/

//1.gulp定義
var gulp = require("gulp");

//2.path定義
var path = {
  src: "./src",
  dist: "./dist"
};

//3.リロード定義
var browserSync = require("browser-sync");

//4.ejs
var ejs = require("gulp-ejs");
var replace = require("gulp-replace");

//5.SASS関連
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var notify = require("gulp-notify");
var sassGlob = require("gulp-sass-glob");
var mmq = require("gulp-merge-media-queries");
var gulpStylelint = require("gulp-stylelint");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssdeclsort = require("css-declaration-sorter");

//6.minファイル
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var htmlmin = require("gulp-htmlmin");

//7.画像圧縮
var imagemin = require("gulp-imagemin");
var imageminPngquant = require("imagemin-pngquant");
var imageminMozjpeg = require("imagemin-mozjpeg");
var imageminOption = [
  imageminPngquant({ quality: [0.65, 0.85] }),
  imageminMozjpeg({ quality: 85 }),
  imagemin.gifsicle({
    interlaced: false,
    optimizationLevel: 1,
    colors: 256
  }),
  imagemin.jpegtran(),
  imagemin.optipng(),
  imagemin.svgo()
];

/*---------------------------------------------------
処理内容
1.ローカルサーバー構築
2.ファイル更新監視
3.ejsコンパイル
4.Sassコンパイル
5.minファイル作成
6.デフォルト
-----------------------------------------------------*/
//1.ローカルサーバー構築
gulp.task("browser-sync", function(done) {
  browserSync.init({
    server: {
      baseDir: path.src,
      index: "index.html"
    }
  });
  done();
});

gulp.task("bs-reload", function(done) {
  browserSync.reload();
  done();
});

//2.ファイル更新監視
gulp.task("watch", function(done) {
  gulp.watch(path.src + "/**/*.scss", gulp.task("sass"));
  gulp.watch(
    [path.src + "/**/*", "!" + path.src + "/**/*.scss"],
    gulp.task("bs-reload")
  );
  done();
});

//3.ejsコンパイル
gulp.task("ejs", done => {
  gulp
    .src([path.src + "/ejs/**/*.ejs", "!" + path.src + "/ejs/**/_*.ejs"])
    .pipe(ejs({}, {}, { ext: ".html" }))
    .pipe(rename({ extname: ".html" }))
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(gulp.dest(path.src));
  done();
});

//4.Sassコンパイル
gulp.task("sass", function(done) {
  gulp
    .src(path.src + "/sass/**/*.scss")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(postcss([autoprefixer()]))
    .pipe(postcss([cssdeclsort({ order: "alphabetically" })]))
    .pipe(mmq())
    .pipe(
      gulpStylelint({
        fix: true
      })
    )
    .pipe(gulp.dest(path.src + "/css"));
  done();
});

//5.minファイル作成
gulp.task("htmlmin", function() {
  return gulp
    .src(path.src + "/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(htmlmin({ removeComments: true }))
    .pipe(gulp.dest(path.dist));
});

gulp.task("jsmin", function() {
  return gulp
    .src(path.src + "/js/*.js")
    .pipe(uglify())
    .pipe(gulp.dest(path.dist + "/js/"));
});

gulp.task("cssmin", function() {
  return gulp
    .src(path.src + "/css/**/*.css")
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.dist + "/css/"));
});

gulp.task("imagemin", function() {
  return gulp
    .src(path.src + "/img/**/*.{png,jpg,gif,svg}")
    .pipe(imagemin(imageminOption))
    .pipe(gulp.dest(path.dist + "/img/"));
});

gulp.task("allmin", gulp.parallel("htmlmin", "cssmin", "jsmin", "imagemin"));

//6.デフォルト
gulp.task("default", gulp.series(gulp.parallel("browser-sync", "watch")));
