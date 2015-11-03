var shell = require('shelljs');
require('shelljs/make');

target.publish = function(){
  var version = require('./package.json').version;
  shell.exec('git tag -a '+ version +' -m "Releasing '+ version +'"');
  shell.exec('git push origin master --tags');
  shell.exec('npm publish');
};