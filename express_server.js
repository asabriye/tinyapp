const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const morgan = require('morgan')
app.use(morgan('dev'))

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length) {
  
  let shortURL           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
    shortURL += characters.charAt(Math.floor(Math.random() * 
  charactersLength));
  }
  return shortURL;
  
  
  
}
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
app.get("/urls", (req, res) => { //changed to this
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  }
  res.render("urls_index", templateVars);

});
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL 
  const longURL = urlDatabase[shortURL]
  const templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
  
});

  let code = generateRandomString(6)
app.get("/u/:shortURL", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.shortURL]
  console.log(longURL)
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_register", { user: undefined });
});

app.post("/register", (req, res) => {
  if(checkUserEmail(req.body.email)) {
    res.sendStatus(400);
  }
} )



console.log(generateRandomString(5));

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");  
  console.log(req.body)       // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})

app.post('/urls/:shortURL', (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect(`/urls/${req.params.shortURL}`);
})

app.post('/login', (req, res) => {
  console.log(req.body);
  const user = req.body.username;
   res.cookie('username', user);
   res.redirect('/urls');
})

app.post("/logout", (req, res) =>{
  res.clearCookie("username");
  res.redirect("/urls");
  });

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});