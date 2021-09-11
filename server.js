const express = require('express');
const mongoose = require('mongoose');

const app = express();
const cors = require('cors');
require('dotenv').config();

// Import Mongo DB Atlas models
const User = require('./models/user');
const Exercise = require('./models/exercise');

// Mount the body parser as middleware
app.use(express.json());
app.use(express.urlencoded( {extended: true} ));

// Connect Mongo DB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// Enable cors for FCC to test the application
app.use(cors());

// Mount the middleware to serve the style sheets in the public folder 
app.use(express.static('public'));

// Display the index page for GET request to the root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// PATH /api/users/ Requests
// Show all of the users in the Mongo DB for GET requests
// Return JSON of user's input in the form for POST requests
app.route('/api/users').get((req, res) => {
  User.find({}, (error, data) => {
    console.log(data);
    res.json(data);
  });
}).post((req, res) => {
  // Get username input into form
  const potentialUsername = req.body.username;
  console.log("potential username:", potentialUsername);

  // Check to see if the username has already been entered
  User.findOne({username: potentialUsername}, (error, data) => {
    if (error) {
      res.send("Unknown userID");
      return console.log(error);
    }

    if (!data) { // If username is not stored yet, create and save a User object
      const newUser = new User({
        username: potentialUsername
      });

      // Save the user
      newUser.save((error, data) => {
        if (error) return console.log(error);
        // Remove the key-value pair associated with the key __v
        const reducedData = {
          "username": data.username, 
          "_id": data._id
        };
        res.json(reducedData);
        console.log(reducedData);
      });
    } else { // If username is already stored, send a message to the user
      res.send(`Username ${potentialUsername} already exists.`);
      console.log(`Username ${potentialUsername} already exists.`);
    }
  });
});

// PATH /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', (req, res) => {
  // Get data from form
  const userID = req.body[":_id"];
  const descriptionEntered = req.body.description;
  const durationEntered = req.body.duration;
  const dateEntered = req.body.date;

  var usernameMatch;

  if (!userID) {
    res.json("Path `userID` is required.");
  }
  if (!description) {
    res.json("Path `description` is required.");
  }
  if (!duration) {
    res.json("Path `duration` is required.");
  }
  if (!date) {
    res.json("Path `date` is required.");
  }

  // Check if user ID is in the User model
  User.findOne({"_id": userID}, (error, data) => {
    if (error) return console.log(error);
    if (!data) {
      res.json("Unknown userID");
    } else {
      console.log(data);
      usernameMatch = data.username;
    }
  });

  const newExercise = new Exercise({
    username: usernameMatch,
    description: descriptionEntered,
    duration: durationEntered,
    date: dateEntered
  });

  console.log(newExercise);

});

// PATH /api/users/_id:/logs?[from][&to][&limit]
app.get('/api/users/_id:/logs?[from][&to][&limit]', (req, res) => {

});

// ----------------
// ADDITIONAL PATHS

// PATH /api/exercises/
// Display all of the exercises in the Mongo DB model titled Exercise
app.get('/api/exercises', (req, res) => {

});

// Listen on the proper port to connect to the server 
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
