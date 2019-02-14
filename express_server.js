var express = require("express");
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
var PORT = 8080; // default port 8080

//Object for users to work and test with.
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//Body Parser for our requests
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Setting our server to route and call our ejs files in view.
app.set("view engine", "ejs");


//Set up register Path ********* w2d4

app.get("/register", (req, res) => {
  //Lets see what we're posting.
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  //Add a new user to the global users object
  //Access the email
  let userEmail = req.body.email;
  //Access the password
  let userPass = req.body.password;
  //Get a random number
  let newId = generateRandomString();
  //Add these features to the users object
  users[newId] = {id: newId, email: userEmail, password: userPass};
  res.cookie("username", newId);
  
  res.redirect("/urls");
});


//****************

//Initial Database for our urls and testing
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Main root page with hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Set up our server to listen for prompts
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Display a json object concerning our initial database.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Testing our .get to demonstrate how our send function works.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Setting up the main TinyUrl page and renders our urls_index.ejs page.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//Our new url page and renders urls_new.ejs
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

// Short URL logic for proper redirects.
app.get("/u/:shortURL", (req, res) => {
  let actualDirect = urlDatabase[req.params.shortURL]
  console.log(actualDirect)
  res.redirect(actualDirect);
});

//add a shortURL ID to our urldatabase if we recieve the prompt.
app.post("/urls/:shortURL", (req, res) => {
  let shortU = req.params.shortURL
  urlDatabase[shortU] = req.body.longURL
  
  //Update the urldatabase to correct for the input
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  //Generate our random id
  var randomString = generateRandomString();
  //Add our key value pair to our urlDatabase
  urlDatabase[randomString] = req.body.longURL
  //Acquire Target Url
  var targetUrl = "/urls/" + randomString
  res.redirect("/urls");
  
});
//Delete Function via click and redirect
app.post("/urls/:shortURL/delete", (req, res) => {
  let iD = (req.params.shortURL)
  //Remove From Database
  delete urlDatabase[iD]
  //Redirect to Page
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
});


function generateRandomString() {
  var randomId = "";
  var possibleOptions = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  //Create a random character using our possible options 
  for (var i = 0; i < 6; i++)
    randomId += possibleOptions.charAt(Math.floor(Math.random() * possibleOptions.length));

  return randomId;
}