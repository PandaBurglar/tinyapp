// FIND THE EMAIL FUNCTION
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};


// RANDOM SHORT URL GENERATOR
function generateRandomString() {
  let randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for ( var i = 0; i < 7; i++ ) {
    result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return result;
};

// CHECK URLS FOR USER FUNCTION 
const urlsForUser = (id, database) => {
  let userUrlChecker = {};
  // loop through urldatabase 
  for (const shortURL in database) {
    // if the userID for the item thats being looped matched the given id parameter 
    if (database[shortURL].userID === id) {
      userUrlChecker[shortURL] = database[shortURL];
    }
  }
  return userUrlChecker;
};



module.exports = { getUserByEmail, generateRandomString, urlsForUser };