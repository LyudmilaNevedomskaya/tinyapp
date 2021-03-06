const express = require('express');
const findUserID = require('./helpers');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({
  extended: true
}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['my secret key', 'yet another secret key']
}));


function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com",
};

//HOME page
app.get('/', (req, res) => {
  res.render('login');
});

//LOGIN page
app.get('/login', (req, res) => {
  res.render('login');
});

// User logs in 
app.post('/login', (req, res) => {
  let userID = findUserID(req.body.email, users);
  //const email = req.body.email;
  const password = req.body.password;
// check if user already exists in users database
  if (!userID) {
    return res.status(400).send('Invalid Login! Please <a href= "/login"> try again </a>  or go to the <a href= "/register"> register </a> page');
  }
// if user was found in database, check the saved password with inputted password
  if (userID == users[userID].id) {

    bcrypt.compare(password, users[userID].password)
      .then((result) => {
        if (result) {
          //res.cookie('user_id', users[userID].id)
          req.session.user_id = users[userID].id;
          res.redirect('/urls');
          // if passwords are not matched, send an error
        } else {
          return res.status(401).send('Password is incorrect!!! Please <a href= "/login"> try again </a>');
        }
      });
  } else {
    res.redirect('/login');
  }
});

//REGISTER page
app.get('/register', (req, res) => {
  res.render('register');
});

//New User Registration
app.post('/register', (req, res) => {
  let user = findUserID(req.body.email, users);


  // if email and password are not entered
  if (req.body.email === '' || req.body.password === '') {
    return res.status(401).send('Missing EMAIL or PASSWORD. Please <a href= "/register"> try again </a>');
  }

  // check if the user is in the database, and create new user
  if (user === undefined) {
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRandomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = users[userRandomID].id;
    res.redirect('/urls');
    return;
  }
  // if user already registered with given email, send an error
  if (users[user].email === req.body.email) {
    return res.status(401).send('Email already exists!!! Please <a href= "/register"> try again </a> or <a href= "/login"> Log in </a> ');
  } else {
    // create new user
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const userRandomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    users[userRandomID] = {
      id: userRandomID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = users[userRandomID].id;
    res.redirect('/urls');
  }
});

// move user to apropriate page
// if new user => move to a clean page
// if exists user => move to the page with his/her urlDatabase
app.get('/urls', (req, res) => {
  let k = req.session.user_id;
  if (!k) {
    const template = {
      urls: {},
      user_id: req.session.user_id
    };
    res.render('urls_index', template);
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      user: users[req.session.user_id],
      urls: urlDatabase[req.session.user_id]
    };
    res.render('urls_index', templateVars);
  }
});

// the page for creating new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// ADD new URL
app.post("/urls", (req, res) => {

  const newHTTP = req.body.longURL;
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');

  urlDatabase[req.session.user_id] = {
    ...urlDatabase[req.session.user_id],
    [shortURL]: newHTTP
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.session.user_id][req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

// If you click on shortURL, you will redirect to your created URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.session.user_id][shortURL];
  res.redirect(longURL);
});

// DELETE URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[req.session.user_id][shortURL];
  res.redirect('/urls');
});

//EDIT longURL
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[req.session.user_id][id] = newLongURL;
  res.redirect('/urls');
});

//LOGOUT
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});