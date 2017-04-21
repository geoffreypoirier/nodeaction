/**
 * Created by geoffrey on 4/21/17.
 */

let express = require('express');

let app = express();

let index = require('./routes/index');


//
app.use('/', index);


// catch 404
app.use((req, res, next) => {
  let err = new Error('Not found.');
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
