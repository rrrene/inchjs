'use strict';

var Inch = require('../lib/inch');

function inchSuggest() {
  Inch.suggest(this.async());
}

function inchList() {
  Inch.list(this.async());
}

module.exports = function(grunt) {
  grunt.registerTask('inch', 'Runs Inch', inchSuggest);
  grunt.registerTask('inch:suggest', 'Runs Inch', inchSuggest);
  grunt.registerTask('inch:list', 'Runs Inch', inchList);
};
