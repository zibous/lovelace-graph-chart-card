const { src, dest } = require('gulp');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const headerComment = require('gulp-header-comment');
const minify = require('gulp-minify');

const settings ={
    files: ['./src/main.js','./src/chartdata.js','./src/graphchart.js'],
    outfile: 'chart-card.js',
    distfolder: './dist/chart-card',
}

exports.default = function(done) {
  return src(settings.files)
    .pipe(plumber())
    .pipe(concat(settings.outfile))
    .pipe(minify())
    .pipe(headerComment(`
      License: <%= pkg.license %>
      Generated on <%= moment().format('YYYY') %>
      Author: <%= _.capitalize(pkg.author) %>
    `))
    .pipe(dest(settings.distfolder))
};
