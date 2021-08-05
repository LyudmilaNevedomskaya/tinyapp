const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());


function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
// // let rString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');

const users = {
  "userRandomID": {
  id: "userRandomID", 
  email: "user@example.com", 
  password: "purple-monkey-dinosaur"
}

};
const findUser = function(email, usersObject) {
  for (user in usersObject) {
    if (usersObject[user].email === email) {
      return true;
    }
  }
}
const findUserID = function(email, passw, usersObject) {
  for (user in usersObject) {
    if (usersObject[user].email === email && usersObject[user].password === passw) {
      return user;
    }
  }
}

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
};
//LOGIN page
app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  let agree = false;
  let userID = findUserID(req.body.email, req.body.password, users);
  console.log(userID);
  agree = findUser(req.body.email, req.body.password, users);
  console.log(agree, userID);

  if (agree) {
    res.cookie('user_id', users[userID].id)
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
  //console.log(users);
 
})


//REGISTER page
app.get('/register', (req, res) => {
  res.render('register')
})
//Create a Registration Handler
app.post ('/register', (req, res) => {
      // const userRandomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      // users[userRandomID] = {id: userRandomID, email: req.body.email, password: req.body.password}
      // //console.log(users);
      // res.cookie('user_id', users[userRandomID].id)
      // res.redirect('/urls')
    
  

  console.log(req.body.email);
  let isEmail = false;
  isEmail = findUser(req.body.email, users)
  if ((req.body.email === '' || req.body.password === '') || isEmail) {
    res.redirect('/register');
    return;
  } 

  else {
      const userRandomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      users[userRandomID] = {id: userRandomID, email: req.body.email, password: req.body.password}
      console.log(users);
      res.cookie('user_id', users[userRandomID].id)
      res.redirect('/urls')
    }
})

 app.get('/urls', (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], user: users[req.cookies['user_id']], urls: urlDatabase};
  //console.log(templateVars);
  res.render('urls_index', templateVars);
 });

 app.get("/urls/new", (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});


// ADD new URL
app.post("/urls", (req, res) => {
  const newHTTP = req.body.longURL;
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');

  urlDatabase[shortURL] = newHTTP;
  //console.log(urlDatabase);
  //console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${shortURL}`)
});

 app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], user: users[req.cookies['user_id']], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

//EDIT longURL
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;

  res.redirect('/urls');
});

//The Login Form
// app.post('/login', (req, res) => {
//   res.cookie('username', req.body.username);
//   res.redirect('/urls');
// }); 

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});