>  WIP - don't use it yet.

## ElasticSearch plugin for Electrify

ElasticSearch plugin for Electrify.

## Installation

Install it locally inside `.electrify` folder.

````shell
cd /your/meteor/app/.electrify
npm install --save electrify-elasticsearch
````

## Configuring

Then add it to the plugins array in your `.electrify/electrify.json` file:

````shell
{
  "plugins": [
    "electrify-eleasticsearch"
  ]
}
````

Done.

Inside your Meteor's server code, get the elastic search host like this:

````javascript
console.log('Elastic Search running on', process.env.ELASTICSEARCH_HOST);
````

## License

The MIT License (MIT)

Copyright (c) 2015 Anderson Arboleya