'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {MongoClient} = require("mongodb");
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github2').Strategy;

const app = express();
const port = 3001;

const dbUri = "mongodb://localhost:27017";
app.set("port", process.env.PORT || port);

app.use(bodyParser.json());
app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

const client = new MongoClient(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let database;

async function checkConnection() {
    if (!client.isConnected()) {
        await client.connect();
        database = client.db('time-keeper');
    }
}

async function getUser(username) {
    await checkConnection();
    const users = database.collection('users');
    const result = await users.findOne({username: username});
    return result;
}

passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID || 'fc6de2b91fc32a5cabbd',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '31a6bbb9e87a25e12dbf19a674f60c00b783c2f7',
        callbackURL: 'http://localhost:3001/auth/github/callback'
    },
    async function (accessToken, refreshToken, profile, done) {
        let errorData;
        let foundUser;
        try {
            foundUser = await getUser(profile.username);
            if (!foundUser) {
                foundUser = {
                    username: profile.username,
                    displayName: profile.displayName,
                    numHours: 37
                };
                await checkConnection();
                await users.insertOne(foundUser);
            }
        } catch (error) {
            errorData = error;
        }

        return done(errorData, foundUser);
    }
));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.UI_URL); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);

    next();
});

app.get('/auth/github',
    passport.authenticate('github', {scope: ['user:email']}));

app.get('/auth/github/callback',
    passport.authenticate('github', {failureRedirect: process.env.UI_URL + '/login'}),
    function (req, res) {
        const url = process.env.UI_URL + '/';
        // Successful authentication, redirect home.
        res.redirect(url);
    });

app.post('/api/settings', async (req, res) => {
    try {
        const userDetails = req.body;
        await checkConnection();
        const users = database.collection('users');

        const filter = {username: userDetails.username};
        // this option instructs the method not to create a document if no documents match the filter
        const options = {upsert: false};
        // create a document that sets the plot of the movie
        const updateDoc = {
            $set: {
                numHours:
                userDetails.numHours,
            },
        };
        const result = await users.updateOne(filter, updateDoc, options);
        console.log(result);
        res.json({result: 'success'});
    } catch (error) {
        res.error("something went wrong " + error.message());
    }
});

app.post('/api/worktime', async (req, res) => {
    try {
        const workTimeDetails = req.body;
        await checkConnection();
        const workTime = database.collection('workTime');

        const filter = {username: workTimeDetails.username, date: workTimeDetails.date};
        // this option instructs the method not to create a document if no documents match the filter
        const options = {upsert: true};
        // create a document that sets the plot of the movie
        const updateDoc = {
            $set: {
                username: workTimeDetails.username,
                date: workTimeDetails.date,
                startTime: workTimeDetails.startTime,
                endTime: workTimeDetails.endTime
            },
        };

        await workTime.updateOne(filter, updateDoc, options);

        res.json({result: 'success'});
    } catch (error) {
        res.error("something went wrong " + error.message());
    }
});

app.get('/api/worktime', async (req, res) => {
    try {
        const workTimeDetails = req.query;
        await checkConnection();
        const workTime = database.collection('workTime');

        const query = {username: workTimeDetails.username, date: workTimeDetails.date};

        const result = await workTime.findOne(query);

        res.json(result);
    } catch (error) {
        res.error("something went wrong " + error.message());
    }
});

app.get('/api/user', ensureAuthenticated, async function (req, res) {
    const result = await getUser(req.user.username);
    res.json(result);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({error: 'not authenticated'});
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});
