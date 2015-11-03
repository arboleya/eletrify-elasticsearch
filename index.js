// requirements
var fs = require('fs');
var join   = require('path').join;
var https = require('https');
var AdmZip = require('adm-zip');

var fs     = require('fs');
var spawn  = require('child_process').spawn;
var shell  = require('shelljs');

module.exports = function($, logger){
  return new ElasticSearch($, logger);
};

function ElasticSearch($, logger) {
  this.$ = $;

  this.name    = 'elastic-search';
  this.process = null;

  this.elastic_bin_dir = join(this.$.env.app.bin, this.name);
  this.elastic_bin     = join(this.elastic_bin_dir, 'bin', 'elasticsearch');

  var reg = /\.electrify(\\|\/)\.electrify/;
  
  this.elastic_bin_dir = this.elastic_bin_dir.replace(reg, '.electrify');
  this.elastic_bin     = this.elastic_bin.replace(reg, '.electrify');

  if(this.$.env.sys.is_windows)
    this.elastic_bin += '.bat';

  this.env = {};
  this.log = logger(this.$, 'electrify:plugins:' + this.name);
}

ElasticSearch.prototype.acquire = function(done){
  if(fs.existsSync(this.elastic_bin_dir)) {
    this.log.info('elasticsearch already acquired, moving on');
    return done();
  }

  this.log.info('downloading elasticsearch..');

  var zipname = 'elasticsearch-1.7.2.zip';
  var zipath  = join(this.$.env.app.bin, zipname);
  var file    = fs.createWriteStream(zipath);
  var dir     = zipath.replace(/\.zip$/m, '');

  var url = 'https://download.elastic.co/elasticsearch/elasticsearch/'+ zipname;

  var self = this;

  https.get(url).on('response', function(res){
     res.pipe(file).on('finish', function(){
      self.log.info('download complete, extracting');

      var zip = new AdmZip(zipath);
      zip.extractAllTo(self.$.env.app.bin);

      shell.rm('-rf', zipath);
      shell.mv(dir, self.elastic_bin_dir);

      done();
    });
  });
};

ElasticSearch.prototype.start = function(done){

  this.log.info('starting elasticsearch');

  var self = this;
  this.$.freeport(null, function(port) {
    
    self.log.info('elasticsearch port: ', port);

    self.port = port;
    shell.chmod('+x', self.elastic_bin);
    self.process = spawn(self.elastic_bin, []);

    var started = false;
    self.process.stdout.on('data', function(data){
      
      // mimics inherit
      console.log(data.toString());

      if(!started && /started/.test(data.toString())){
        self.log.info('elasticsearch started');
        self.env.ELASTICSEARCH_HOST = 'http://localhost:'+ self.port;
        started = true;
        done();
      }
    });

    self.process.stderr.pipe(process.stderr);
  });
};

ElasticSearch.prototype.stop = function(){
  if(this.process)
    this.process.kill();
};