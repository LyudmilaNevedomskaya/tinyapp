const { assert } = require('chai');

const findUserID = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserID("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(expectedOutput, user);
  });
  it('non-existent email returns undefined', function() {
    const user = findUserID("someAnotherEmail@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(expectedOutput, user);
  });
});


// const user = findUserID("user@example.com", testUsers)
// console.log(user);