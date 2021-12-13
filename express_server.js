const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//MIDDLEWARE
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
const req = require("express/lib/request");
app.use(cookieParser());

// RANDOM SHORT URL GENERATOR
function generateRandomString() {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < 7; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};

// FIND THE EMAIL FUNCTION 
const findUserEmailInDatabase = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

// CHECK URLS FOR USER FUNCTION 
const urlsForUser = (id) => {
  let userUrlChecker = {};
  // loop through urldatabase 
  for (const shortURL in urlDatabase) {
    // if the userID for the item thats being looped matched the given id parameter 
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrlChecker;
};


// DATA
const urlDatabase = {};

//USER DATA 
const users = {};

// REGISTRATION HANDLER
app.post('/register', (req, res) => {
  // REGISTRATION ERRORS
  if (req.body.email && req.body.password) {
    // once they input the email & password check to see if email exists
    if (!findUserEmailInDatabase(req.body.email), users) {
      // if not, generate a new id with their email & password
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: req.body.password
      }
      // create a cookie for it 
      res.cookie('user_id', userID);
      res.redirect('/urls');

    } else {
      res.statusCode = 400;
      res.send('<h1>400  Bad Request<br>Email already registered.</h1>')
    }
    // if they leave the form blank 
  } else {
    res.statusCode = 400;
    res.send('<h1>400  Bad Request<br>Please fill out the email and password fields.</h1>')
  }
});

//BROWSE ROOT PATH -> REDIRECT TO HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
  res.redirect('/urls');
});

// HOME PAGE FOR TINYAPP
app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const userUrls = urlsForUser(userId);
  let templateVars = { urls: userUrls, user: users[userId] };
  res.render("urls_index", templateVars);
});

// CREATE NEW SHORT URL PAGE 
app.get("/urls/new", (req, res) => {
  // first check the cookies to see if the user_id exists
  if (req.cookies['user_id']) {
    // if it does you can render the new urls using their login
    let templateVars = {user: users[req.cookies['user_id']]};
    res.render('urls_new', templateVars);
  } else {
    // otherwise redirect them to login first 
    res.redirect('/login');
  }
});

// SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies['user_id'];
  const userUrls = urlsForUser(userID);
  let templateVars = { urls: userUrls, user: users[userID], shortURL: req.params.shortURL };
  res.render('urls_show', templateVars);
});

// REDIRECT SHORTURL TO ITS LONGURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This short URL does not exist.</h2>')
  }
});

// CREATE A SHORTURL USING POST 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  res.redirect('/urls/'+ shortURL);
});

// UPDATE THE LONGURL FOR SELECTED SHORTURL IN THE DATABASE
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // check if current url belonds to the current user and then allow edit 
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
  }
  res.redirect(`/urls/${shortURL}`);
});

// DELETE SHORTURL USING POST 
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  // check if current url belonds to the current user and then delete
  if (req.cookies['user_id'] === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls/');
});

// LOGIN PAGE 
app.get('/login', (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_login', templateVars);
});

//LOGIN HANDLER
app.post("/login", (req, res) => {
  const user = findUserEmailInDatabase(req.body.email, users);
  // if the inputs are filled in first 
  if (req.body.email && req.body.password) {
    // once they input the email & password check to see if email exists
    if (user) {
      // if the given a password matches that users password 
      if (req.body.password === user.password) {
        // save the userId as a cookie 
        res.cookie('user_id', user.userID);
        res.redirect('/urls');
        // if it doesn't return an error
      } else {
        res.statusCode = 403;
        res.send('<h3>403 Forbidden<br>You entered the wrong password.</h3>');
      }
      // if email doesn't exist
    } else {
      res.statusCode = 403;
      res.send('<h3>403 Forbidden<br>This email address is not registered.</h3>');
      }
  } else {
    res.statusCode = 400;
    res.send('<h1>400  Bad Request<br>Please fill out the email and password fields.</h1>');
  }
});

//LOGOUT HANDLER
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls/');
});

// REGISTRATION
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies['user_id']]};
  res.render("urls_registration", templateVars);
}); 

// LISTENING TO PORT 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
