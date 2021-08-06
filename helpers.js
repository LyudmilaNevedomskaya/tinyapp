const findUserID = function(email, usersObject) {
  for (let user in usersObject) {
    if (usersObject[user].email === email) {
      return user;
    }
  }
};

module.exports = findUserID;