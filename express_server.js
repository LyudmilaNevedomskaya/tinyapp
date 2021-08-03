const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");


app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));


function generateRandomString(length, chars) {
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
// // let rString = generateRandomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get('/', (req, res) => {
  res.send('Hello!!!');
});

// app.get('/urls.json', (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
//  });
 
//  app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
//  });

 app.get('/urls', (req, res) => {
   const templateVars = {urls: urlDatabase};
   res.render('urls_index', templateVars);
 });

 app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});