const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

//MIDDLEWARE
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

// RANDOM SHORT URL GENERATOR
function generateRandomString() {
  var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for ( var i = 0; i < 7; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
}

// DATA
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//BROWSE ROOT PATH -> REDIRECT TO HOME PAGE
app.get("/", (req, res) => {
  res.send("Hello!");
  res.redirect('/urls/');
});

// HOME PAGE FOR TINYAPP
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

// CREATE NEW SHORT URL PAGE 
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies['username'] };
  res.render("urls_new", templateVars);
});

// SHORTURL PAGE
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies['username'] };
  res.render("urls_show", templateVars);
});

// REDIRECT SHORTURL TO ITS LONGURL PAGE
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL.longURL);
});

// CREATE A SHORTURL USING POST 
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/'+ shortURL);
});

// EDIT SHORTURL 
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect('/urls/');
});

// DELETE SHORTURL USING POST 
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete  urlDatabase[shortURL];
  res.redirect('/urls/');
});

//LOGIN 
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls/');
});
//LOGOUT 
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls/');
});

// LISTENING TO PORT 
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
