var path = require('path');

/*
  This is the configuration file for freestore.
  Tailor it to suit your needs.
*/

var app_path = __dirname;

module.exports = {
    // The port where the freestore web app listens
    // for http connections.
    port: 8000,

    // The path containing the static content for the web app
    www_path: path.join(app_path, 'www'),

    upload_path: path.join(app_path, 'upload'),

};