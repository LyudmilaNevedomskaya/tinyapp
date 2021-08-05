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

// const urlsForUser = function(id, users) {
//   let currentUserUrls = []
//   for(let i in users){
//     if(users[i]===id){
//       carentUser[i]=users[i][id]
//     }
//   }
//   return currentUserUrls;
// }


const findUser = function(email, passw, usersObject) {
  for (user in usersObject) {
    if (usersObject[user].email === email && usersObject[user].password === passw) {
      return true;
    }
  }
}
const findUserID = function(email, usersObject) {
  for (user in usersObject) {
    if (usersObject[user].email === email) {
      return user;
    } 
  } 
}
let newBase = {}

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
  let userID = findUserID(req.body.email, users);
  agree = findUser(req.body.email, req.body.password, users);

  if (agree) {
    res.cookie('user_id', users[userID].id)
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});

//REGISTER page
app.get('/register', (req, res) => {
  res.render('register')
})
//Create a Registration Handler
app.post ('/register', (req, res) => {
  let user = findUserID(req.body.email, users)
  console.log(user);
  if (user === undefined) {
    const userRandomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      users[userRandomID] = {id: userRandomID, email: req.body.email, password: req.body.password}

      res.cookie('user_id', users[userRandomID].id)
      res.redirect('/urls')
      return
  }
  if (req.body.email === '' || req.body.password === '' || users[user].email === req.body.email) {
    res.redirect('/register');
    return;
  } 

  else {
      const userRandomID = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      users[userRandomID] = {id: userRandomID, email: req.body.email, password: req.body.password}
      //console.log(users);
      res.cookie('user_id', users[userRandomID].id)
      res.redirect('/urls')
    }
})

 app.get('/urls', (req, res) => {
   let k = req.cookies['user_id'];

    if (!k) {
      const template = {urls:{}, user_id: req.cookies['user_id']}
      res.render('urls_index', template);
    }

    else {
      //urlDatabase = urlsForUser(req.cookies['user_id'],newBase)
      const templateVars = {user_id: req.cookies['user_id'], user: users[req.cookies['user_id']], urls: urlDatabase[req.cookies['user_id']]};
      console.log(templateVars);
      res.render('urls_index', templateVars);
    }
 });

 app.get("/urls/new", (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], user: users[req.cookies['user_id']]};
  res.render("urls_new", templateVars);
});


// ADD new URL
app.post("/urls", (req, res) => {

  const newHTTP = req.body.longURL;
  const shortURL = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');

  urlDatabase[req.cookies['user_id']] = {...urlDatabase[req.cookies['user_id']],[shortURL]: newHTTP};

  

  //newBase[shortURL]={[req.cookies['user_id']]:newHTTP}
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`)
});

 app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {user_id: req.cookies['user_id'], user: users[req.cookies['user_id']], shortURL: req.params.shortURL, longURL: urlDatabase[req.cookies['user_id']][req.params.shortURL]};
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
  delete urlDatabase[req.cookies['user_id']][shortURL];
  res.redirect('/urls');
})

//EDIT longURL
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[req.cookies['user_id']][id] = newLongURL;
  //newBase[id]={[req.cookies['user_id']]:newLongURL}

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