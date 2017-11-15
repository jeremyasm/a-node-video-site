const express = require('express');
const app =  express();
const multer  = require('multer');
const includeMulter = multer().any();
require('./util/readenv').config();
var log4js = require('log4js');

//config log4j
log4js.configure(__dirname+"/config/log4js.json", { reloadSecs: 300 });
app.use(log4js.connectLogger(log4js.getLogger('access'), { level: log4js.levels.INFO }));

// app.use(multer().any());
function shouldParseRequest(req) {
  const currentMethod = req.method;
  const currentRoute = req.originalUrl;

  const restrictedRoutes = [{
    method: 'POST', originalUrl: '/'
  }];

  for(var i = 0; i < restrictedRoutes.length; i++ ) {
    if(restrictedRoutes[i].method == currentMethod && restrictedRoutes[i].originalUrl == currentRoute ) {
      return false;
    }
  }
  return true;
}

app.use(function(req, res, next) {
  shouldParseRequest(req) ? includeMulter(req, res, next) : next();
});

app.use(express.static('public'));

const routes = require('./routes/');
app.use('/', routes);
app.listen(process.env.PORT, function() {
  console.log("Server is listening at the port", process.env.PORT);
});

module.exports.app = app;
