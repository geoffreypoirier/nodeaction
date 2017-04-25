/**
 * Created by geoffrey on 4/21/17.
 */

let express    = require('express');
let bodyParser = require('body-parser');
let argv       = require('minimist')(process.argv.slice(2));

let index = require('./routes/index');

let app     = express();
let subpath = express();


// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-XSRF-TOKEN, Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  next();
});



// use bodyParser for the rendering engine
//app.use(bodyParser.urlencoded({'extended': 'false'}));

app.use(bodyParser());
app.use('/v1', subpath);


// swagger
let swagger = require('swagger-node-express').createNew(subpath);
app.use(express.static('dist'));

swagger.setApiInfo({
  title            : 'example api',
  description      : 'example desc',
  termsOfServiceUrl: '',
  contact          : 'g@example.com',
  license          : '',
  licenseUrl       : ''
});

app.get('/', (req, res) => {
  res.sendFile(__dirname, '/dist/index.html');
});

swagger.configureSwaggerPaths('', 'api-docs', '');

let domain = 'localhost';
argv.domain !== undefined ? domain = argv.domain : console.log('no domain specified, using localhost');

let port = '8080';
argv.port !== undefined ? port = argv.port : console.log('no port specified, using 8080');

let applicationUrl = 'http://' + domain + ':' + port;
console.log('api running on', applicationUrl);

swagger.configure(applicationUrl, '1.0.0');

app.listen(port);


// example swagger spec pulled from
// https://github.com/shawngong/Swagger-Node-Express-For-Existing-APIs/blob/master/sample-spec.json



// routing
app.use('/', index);


// catch 404
app.use((req, res, next) => {
  let err    = new Error('Not found.');
  err.status = 404;
  next(err);
});


// error handler
app.use((err, req, res, next) => {

  // set locals for dev environment (via scaffold from another project)
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');

});


module.exports = app;
