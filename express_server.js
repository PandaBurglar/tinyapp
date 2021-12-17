// APPLICATION SETUP
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");

app.set("view engine", "ejs");

//MIDDLEWARE
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['an elephant never forgets'],
}));


// DATA VARIABLES
const urlDatabase = {};
const users = {};

///** ROUTES FOR TINYAPP **///


//BROWSE ROOT PATH -> REDIRECT TO HOME PAGE IF LOGGED IN OR ELSE LOGIN PAGE
app.get("/", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// HOME PAGE FOR TINYAPP
app.get("/urls", (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  let templateVars = { urls: userUrls, user: users[userID] };
  // if they're not logged in return error
  if (!userID) {
    res.statusCode = 401;
  }
  res.render("urls_index", templateVars);
});

// CREATE NEW SHORT URL PAGE
app.get("/urls/new", (req, res) => {
  // first check the cookies to see if the user_id exists
  if (req.session.userID) {
    // if it does you can render the new urls using their login
    let templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    // otherwise redirect them to login first
    res.redirect('/login');
  }
});

// SHORTURL PAGE WITH LONG URL AND SHORTURL DISPLAYED IF LOGGED IN
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  let templateVars = {urlDatabase, urls: userUrls, shortURL, user: users[userID] };
  if (!urlDatabase[shortURL]) {
    res.status(404).send('<h3>404  Not Found <br> This URL does not exist in the database.</h3>');
  } else if (!userID || !userUrls[shortURL]) {
    res.status(401).send('<h3>401  Bad Request<br> Not Authorized to see URL.</h3>');
  } else {
    res.render('urls_show', templateVars);
  }
});

// REDIRECT SHORTURL TO ITS LONGURL PAGE
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(404).send('<h3>404  Not Found <br> Page Not Found</h3>');
  }
});

// CREATE A SHORTURL USING POST
app.post("/urls", (req, res) => {
  if (req.session.userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.userID
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send('<h3>401  Bad Request<br> Login or Register to use this.</h3>');
  }
});

// UPDATE THE LONGURL FOR SELECTED SHORTURL IN THE DATABASE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // check if current url belonds to the current user and then allow edit
  if (req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect('/urls/');
  } else {
    res.status(401).send('<h3>401  Bad Request<br> Login or Register to use this.</h3>');
  }
});

// DELETE SHORTURL USING POST
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // check if current url belonds to the current user and then delete
  if (req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls/');
  } else {
    res.status(401).send('<h3>401  Bad Request<br> Login or Register to use this.</h3>');
  }
});

// LOGIN PAGE
app.get('/login', (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  let templateVars = {user: users[req.session.userID]};
  res.render('urls_login', templateVars);
});

//LOGIN HANDLER
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  // if the inputs are filled in first, check to see if email exists
  // if the given a password matches that users password
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    // save the userId as a cookie
    req.session.userID = user.userID;
    res.redirect('/urls');
    // if it doesn't return an error
  } else {
    res.status(401).send('<h3>401  Bad Request<br> Login or Register to use this.</h3>');
  }
});

//LOGOUT HANDLER
app.post("/logout", (req, res) => {
  // clear any cookies and redirect to homepage
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls/');
});

// REGISTRATION
app.get("/register", (req, res) => {
  if (req.session.userID) {
    res.redirect('/urls');
    return;
  }

  let templateVars = {user: users[req.session.userID]};
  res.render("urls_registration", templateVars);
});

// REGISTRATION HANDLER
app.post('/register', (req, res) => {
  // REGISTRATION ERRORS
  if (req.body.email && req.body.password) {
    // once they input the email & password check to see if email exists
    if (!getUserByEmail(req.body.email, users)) {
      // if not, generate a new id with their email & password
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
      // create a cookie for it
      req.session.userID = userID;
      res.redirect('/urls');

    } else {
      res.status(400).send('<h3>400  Bad Request<br>Email already registered. Please Login.</h3>');
    }
    // if they leave the form blank
  } else {
    res.status(400).send('<h3>400  Bad Request<br>Please fill out the email and password fields.</h3>');
  }
});

// LISTENING TO PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
