var express = require('express');
var router = express.Router();
const { google } = require('googleapis');
const OAuth2Data = require('./google_key.json');
const axios = require('axios');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;

/* GET settings listing. */
/*router.get('/', function(req, res) {
  res.send('respond with a resource');
});*/

router.get('/', (req, res) => {
    if (!authed) {
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            //scope: 'https://www.googleapis.com/auth/userinfo.profile'
            scope: 'https://www.googleapis.com/auth/userinfo.email'
        });
        res.redirect(url);
    } else {
        res.render('index', { title: 'My SMARTHome' });
    }
})

router.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/home')
            }
        });
    }
});

router.get('/home', (req, res) => {
    const code = req.query.code
    if (code) {
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating' + err)
            } else {
              oAuth2Client.setCredentials(tokens);
              var url = 'https://oauth2.googleapis.com/tokeninfo?id_token='+tokens.id_token;
  
              //https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
              axios.get(url)
                  .then(response => {
                      console.log(response.data.email);
                      if(response.data.email == process.env.email) {
                          authed = true;
                          //res.render('index', { title: 'My SMARTHome' });
                          res.redirect('../home/dash')
                      } else {
                          console.log(response.data.email + 'Not Authorised');
                          res.render('error', { errormessage: 'Not Authorised' });
                      }
                  })
                  .catch(error => {
                      console.log(error);
                      res.render('error', { errormessage: error });
                  });
            }
        });
      }
})

module.exports = router;
