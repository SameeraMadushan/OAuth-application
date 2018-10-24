const express = require('express');
const path = require('path');
const http = require('http');
const request = require('request-promise');
const bodyParser = require('body-parser');
const app = express();
const GoogleOAuth2Strategy = require('passport-google-oauth').OAuth2Strategy;
const passport = require('passport');
const port = process.env.PORT || 3000;
const config = require('./config/config.js');
const cors = require('cors');

// Parse application/json request data.
app.use(bodyParser.json());

app.use(cors());
//----------------------------------------------PASSPORT--------------------------------------------
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


passport.use(new GoogleOAuth2Strategy(
    {
        clientID: config.oAuthClientID,
        clientSecret: config.oAuthclientSecret,
        callbackURL: config.oAuthCallbackUrl,
    },
    (token, refreshToken, profile, done) => {
        done(null, { profile, token })
    }));


app.use(passport.initialize());
app.use(passport.session());

//----------------------------------------------ROUTES--------------------------------------------
///build path of the project
app.use(express.static(path.join(__dirname, 'dist')));

//redirect to index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// Star the OAuth login process for Google.
app.get('/auth/google', passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'profile',
    ],
    failureFlash: true,
    session: true,
}));

var token;

// Callback receiver for the OAuth process after log in.
app.get('/authenticate', passport.authenticate('google', { failureRedirect: '/', failureFlash: true, session: true }),
    (req, res) => {
        // User has logged in.
        console.log('User has logged in.');
        token = req.user.token;
        res.redirect('/#/albums');
    });


// Returns all albums owned by the user.
app.get('/getAlbums', async (req, res) => {
    const data = await libraryApiGetAlbums(token);
    if (data.error) {
        returnError(res, data);
    } else {
        res.status(200).send(data);
    }
});

// Returns a list of all albums owner by the logged in user from the Library
// API.
async function libraryApiGetAlbums(authToken) {
    let albums = [];
    // let nextPageToken = null;
    let error = null;
    let parameters = { pageSize: 50 };

    try {
        do {
            const result = await request.get('https://photoslibrary.googleapis.com/v1/albums', {
                headers: { 'Content-Type': 'application/json' },
                qs: parameters,
                json: true,
                auth: { 'bearer': authToken },
            });
            if (result && result.albums) {
                const items = result.albums.filter(x => !!x);
                albums = albums.concat(items);
            }
            parameters.pageToken = result.nextPageToken;
            // Loop until all albums have been listed and no new nextPageToken is
            // returned.
        } while (parameters.pageToken != null);

    } catch (err) {
        error = err.error.error ||
            { name: err.name, code: err.statusCode, message: err.message };
        console.log(error);
    }
    return { albums };
}
//----------------------------------------------INITIATING SERVER--------------------------------------------
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
