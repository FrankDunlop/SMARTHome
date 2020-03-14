var express = require('express');
var router = express.Router();
const { google } = require('googleapis');
const OAuth2Data = require('./google_key.json');
const axios = require('axios');

var authed = false;

router.get('/dash', function(req, res, next) {
  res.render('index', { title: 'My SMARTHome' });   
});


module.exports = router;