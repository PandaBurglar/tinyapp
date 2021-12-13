const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  'qwe': {
    id: 'qwe',
    email: 'qwe@example.com',
    password: 'acbd'
  },
  'asd': {
    id: 'asd',
    email: 'asd@example.com',
    password: '1234'
  }
};


describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('qwe@example.com', testUsers);
    assert.equal(user, testUsers.qwe);
  });

  it('should return undefined when email does not exist', () => {
    const user = getUserByEmail('applespice@example.com', testUsers);
    assert.equal(user, undefined);
  });
});

const testUrls = {
  'abcd': {
    longURL: 'http://www.google.com',
    userID: 'sam'
  },
  'efgh': {
    longURL: 'http://www.github.com',
    userID: 'alex'
  },
  'ijkl': {
    longURL: 'http://www.miniclip.com',
    userID: 'sam'
  }
};

describe('urlsForUser', () => {
  it('should return the matching urls for a valid user', () => {
    const userUrls = urlsForUser('sam', testUrls);
    const expectedResult = {
      'abcd': {
        longURL: 'http://www.google.com',
        userID: 'sam'
      },
      'ijkl': {
        longURL: 'http://www.miniclip.com',
        userID: 'sam'
      }
    };

    assert.deepEqual(userUrls, expectedResult);
  });

  it('should return an empty object if user does not exist', () => {
    const userUrls = urlsForUser('faust', testUrls);
    assert.deepEqual(userUrls, {});
  })
}) 