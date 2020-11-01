const gulp = require("gulp");
const concat = require("gulp-concat");
const del = require("del");
const plumber = require("gulp-plumber");
const headerComment = require("gulp-header-comment");
const minify = require("gulp-minify");
const zip = require("gulp-zip");

const settings = {
	files: ["./src/chartdata.js", "./src/graphchart.js", "./src/main.js"],
	libs:  ["./src/libs/chart.js", "./src/libs/chartjs-plugin-autocolors.js", "./src/libs/chartjs-plugin-gradient.js"],
	outfile: "chart-card.js",
	libsfile: "chart.js",
	distfolder: "./dist/chart-card",
	releasefolder: "./release",
	hassfolder:
		"/Volumes/zeususdata/home/homeassistant/.homeassistant/www/community/chart-card",
};

/**
 * clean up distributen and release
 */
gulp.task("cleanup", function () {
	return del([
		settings.distfolder + "/*.js",
		settings.releasefolder + "/*.zip",
	]);
});

/**
 * used to deploy the files to
 * the home-assistant plugins folder
 */
gulp.task("deploy", function () {
	if(settings.hassfolder){
	return gulp
		.src(settings.distfolder + "/*.js")
		.pipe(gulp.dest(settings.hassfolder));
	}else{
		return done();
	}
});

/**
 * build the release for github
 */
gulp.task("release", function () {
	return gulp
		.src([settings.distfolder + "/**/*"])
		.pipe(zip("chart-card.zip"))
		.pipe(gulp.dest(settings.releasefolder));
});

/**
 * build the libs 
 */
gulp.task("build-libs", function () {
	return gulp
	.src(settings.libs)
	.pipe(plumber())
	.pipe(concat(settings.libsfile))
	.pipe(minify())
	.pipe(gulp.dest(settings.distfolder));
});

/**
 * build the custom card
 */
gulp.task("build", function () {
	return gulp
		.src(settings.files)
		.pipe(plumber())
		.pipe(concat(settings.outfile))
		.pipe(minify())
		.pipe(
			headerComment(`
      License: <%= pkg.license %>
      Generated on <%= moment().format('YYYY') %>
      Author: <%= _.capitalize(pkg.author) %>
    `)
		)
		.pipe(gulp.dest(settings.distfolder));
});

/**
 * default task
 */
gulp.task(
	"default",
	gulp.series(["cleanup", "build", "build-libs", "release", "deploy"], function (done) {
		// task code here
		done();
	})
);
