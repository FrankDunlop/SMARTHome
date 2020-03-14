var express = require('express');
var router = express.Router();
const config = require('../src/config');

router.get('/autosettings', function(req, res) {
  var db = req.db;
  var collection = db.get('autosettings');
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});

router.post('/autosettings', function(req, res) {
  var db = req.db;
  var collection = db.get('autosettings');
  var idToUpdate = process.env.DB_id;
  collection.update({_id: idToUpdate},{$set :{autoTempSetting : config.autoTempSetting, autoImmersionSetting : config.autoImmersionSetting, autoLightSetting: config.autoLightHourSetting}});
});

module.exports = router;
