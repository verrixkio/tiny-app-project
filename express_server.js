var express = require("express");
var cookieSession = require('cookie-session')
var app = express();

app.use(cookieSession({
  name: 'session',
  keys: ["my_cookie_secrets"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

var PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');


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

function checkLoggedEmail(req,res) {
  for (keys in users) {
    loggedUser = users[keys].email
    if (loggedUser === req.body.email) {
      
      returnValues = loggedUser;
      return returnValues
    } else {
      returnValues = false 
    }
  }
  return returnValues
}

// Find id associated with the id passed in
function getId(email) {
  for (keys in users) {
    let loggedEmail = users[keys].email
    if (loggedEmail === email) {

      returnValue = users[keys].id ;
      return returnValue
    } else {
      returnValue = false 
    } 
  }
  return returnValue
}

function checkLogInState (req) {
  loggedInState = req.session.user_ID
  console.log(loggedInState)  //Changed cookie
  if (loggedInState === undefined || loggedInState === null) {
    return false
  } else {
    return true
  }
}



app.get("/register", (req, res) => {
  let templateVars = { urls: urlDatabase, uObject: users[req.session.user_ID]}; //Changed cookie
  res.render("urls_register", templateVars);
});



app.post("/register", (req, res) => {
  //Logic for if someone enters an email or password as an empty string.
  if (req.body.email === '' || req.body.passwod === '' ) {
    res.render('err_400')
  } else if (checkLoggedEmail(req,res) === req.body.email){
    res.render('err_400')
  } else {
  
  //Check to see if the email matches another
  //Add a new user to the global users object
  //Access the email
  let userEmail = req.body.email;
  
  //Access the password
  let userPass = req.body.password;
  let userPassCrpto = bcrypt.hashSync(userPass, 10)
  
  //Get a random number
  let newId = generateRandomString();
  
  //Add these features to the users object
  users[newId] = {id: newId, email: userEmail, password: userPassCrpto};
  req.session.user_ID = newId //res.cookie("user_ID", newId);
  
  
  res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase, uObject: users[req.session.user_ID]};
  res.render("urls_login", templateVars)
});


//****************

//Initial Database for our urls and testing
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
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


// Function that checks which variables to return to the user
function keepPrivateUrls (req) {
  //get the user ID
  let privateUrlDatabase = {}
  checkID = req.session.user_ID
  //for each value of the current Urldatabase check the value and if it matches added to a database
  for (keys in urlDatabase) {
    let currentKey = urlDatabase[keys].userID
    // console.log(currentKey, checkID)
    // privateUrlDatabase[keys] = urlDatabase[keys]
    // console.log(privateUrlDatabase)
    if (currentKey === checkID) {
      privateUrlDatabase[keys] = urlDatabase[keys] 
    }
  }
  return privateUrlDatabase
}

// Setting up the main TinyUrl page and renders our urls_index.ejs page.
app.get("/urls", (req, res) => {
  //Redirect if no Login
  if (checkLogInState(req) === false ) {
    res.redirect('/login')
  } else {
  //Need to check with user ID matches the userID, if it does run the urls that are associated with it.
  let newDatabase = keepPrivateUrls(req)
  let templateVars = { urls: newDatabase, uObject: users[req.session.user_ID]};
  res.render("urls_index", templateVars);
  }
});

//Our new url page and renders urls_new.ejs
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, uObject: users[req.session.user_ID]};
  //Check if user is logged in.
  if (checkLogInState(req)) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Short URL logic for proper redirects.
app.get("/u/:shortURL", (req, res) => {
  // console.log(req)
  let newDatabase = keepPrivateUrls(req)
  console.log(urlDatabase)
  let actualDirect = urlDatabase[req.params.shortURL].longURL
  res.redirect(actualDirect);
});

//add a shortURL ID to our urldatabase if we recieve the prompt.
app.post("/urls/:shortURL", (req, res) => {
  // Force a Log in to Edit the Urls
  if (checkLogInState(req)) {
    let shortU = req.params.shortURL
    urlDatabase[shortU] = { longURL: req.body.longURL, userID: req.session.user_ID }  
}
  
  //Update the urldatabase to correct for the input
  res.redirect('/urls');
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], uObject: users[req.session.user_ID]};
  if (checkLogInState(req)) {
    res.render("urls_show", templateVars);
  } else {
  res.redirect("/login")
  }
  
});

app.post("/urls", (req, res) => {
  
  //Generate our random id
  var randomString = generateRandomString();
  console.log("test")
  //Add our key value pair to our urlDatabase
  urlDatabase[randomString] = { longURL: req.body.longURL, userID: req.session.user_ID }
  //Acquire Target Url
  var targetUrl = "/urls/" + randomString
  res.redirect("/urls");
  
});
//Delete Function via click and redirect
app.post("/urls/:shortURL/delete", (req, res) => {
  let iD = (req.params.shortURL)
  // console.log(iD)
  //Make sure the user is logged on before deleting.
  if (checkLogInState(req)) {
  //Remove From Database
    delete urlDatabase[iD]
  }
  //Redirect to Page
  res.redirect("/urls")
});


//********************************** WORKING HERE */
app.post("/login", (req, res) => {
    //Check if an email can not be found return a response with a 403 status code.
    let getEmail = req.body.email
    
    // If the email isnt found return 403
    if (checkLoggedEmail(req,res) === false) {
      res.render('err_403')
    }
    // if the checked email is found
    if (checkLoggedEmail(req,res) === req.body.email) {
      let currentPassword = req.body.password
      //Check the passwords in the keys
      let loggedPW = (users[keys].password)
      if (bcrypt.compareSync(loggedPW, req.body.password)) {
        res.render('err_403')
        
      // If password matches find the id asscociated
      
      } else {
          let setId = getId(getEmail);
          req.session.user_ID = setId
          res.redirect('/urls')
      }        
    }
  
});

app.post("/logout", (req, res) => {
  req.session.user_ID = null
  res.redirect("/login")
});


function generateRandomString() {
  var randomId = "";
  var possibleOptions = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  //Create a random character using our possible options 
  for (var i = 0; i < 6; i++) 
    randomId += possibleOptions.charAt(Math.floor(Math.random() * possibleOptions.length));

  return randomId;
}