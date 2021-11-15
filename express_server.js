const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcryptjs');

const morgan = require('morgan')
app.use(morgan('dev'))

const cookieParser = require("cookie-parser");
app.use(cookieParser());


app.set("view engine", "ejs")

const users = { 
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
}

const urlDatabase = {
  "b6UTxQ": {
      longURL: "https://www.tsn.ca",
      userID: "userRandomID"
  },
  "i3BoGr": {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }
};

const checkUserInUsers = function (users, input) {
  for (const user in users) {
    if (input.email === users[user].email) {
        return true;
    }
  }
  return false;
}

const checkUserByEmail = function(emailInput, users) {
  for (let user in users) {
    
    if (users[user].email === emailInput) {
      return users[user]
    }
}
return undefined;
}

function urlsForUser(id){
  let filteretdUrls = {};
  for(let shortURL in urlDatabase){
    let userId = urlDatabase[shortURL].userID;
    if(userId === id){
      filteretdUrls[shortURL] = urlDatabase[shortURL]
    }
  }
  return filteretdUrls
}


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
  const id = req.cookies["user_id"]
  const user = users[id]
  const templateVars = {
    user: req.cookies["username"],
    user: user,
  };
  if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  }
  else {
    res.redirect('/login')
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.delete("/urls/:shortURL", (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
    res.redirect("/urls");
  }
  res.redirect("/login");
})


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
  //   res.send("<html><body>Hello <b>World</b></body></html>\n");
  // });
  app.get("/urls", (req, res) => { //changed to this
    const id = req.cookies["user_id"]
    const user = users[id];
    console.log(user)
    let filteredUrls = urlsForUser(id)
    let filtereDatabse = {
      urls: filteredUrls,
      user : user
    }
    console.log(filteredUrls)
    if (req.cookies.user_id) {
      res.render("urls_index", filtereDatabse);
    }
    else {
      res.redirect('/login')
    }
    
  });
  app.get("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL 
    if (!urlDatabase[shortURL]){
      res.status(400).send("This shortUrl ID does not exist")
    }
    const longURL = urlDatabase[shortURL].longURL
    const id = req.cookies["user_id"]
    const user = users[id]
    const templateVars = { shortURL, longURL, user };
    res.render("urls_show", templateVars);
  });
  
  let code = generateRandomString(6)
  app.get("/u/:shortURL", (req, res) => {
    // const longURL = ...
    
    const longURL = urlDatabase[req.params.shortURL].longURL
    console.log(longURL)
    res.redirect(longURL);
  });
  
  app.get("/register", (req, res) => {
    res.render("urls_register", { user: undefined });
  });
  
  app.post("/register", (req, res) => {
    const id = generateRandomString(5)
    const email = req.body.email
    const password = req.body.password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const user = {
      id: id,
      email: email,
      password: hashedPassword,
    }
    if(email === "" || password === "") {
      res.status(400).send("empty input")
    }
    
    if(checkUserInUsers(users, user)){
      res.status(400).send("please register with unique email")
    } 
    
    users[id] = user
    console.log("user in register post route",user)
    res.cookie("user_id", id)
    res.redirect("/urls");
    
    // console.log(generateRandomString(5));
  });
  
  
  
  
  app.post("/urls", (req, res) => {
    let user_id = req.cookies.user_id
    let shortURL = generateRandomString(5);
    urlDatabase[shortURL] = {
      longURL :req.body.longURL,
      userID  : user_id
    }
    if(user_id){
      res.redirect(`/urls/${shortURL}` )
    } else {
      res.status(403).send("You are not a logged in user. Please login to create new urls")
    }
  });
  
  app.post('/urls/:shortURL/delete', (req,res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  })
  
  app.post('/urls/:shortURL', (req,res) => {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect(`/urls`);
  })
  
  app.get('/login', (req, res) => {
    console.log(req.cookies);
    res.render("urls_login", { user: undefined });
  });
  
  app.post('/login', (req, res) => {
    console.log(req.body);
    const email = req.body.email;
    const user = checkUserByEmail(email, users)
    const password = req.body.password;
    // console.log("users", users)
    console.log("user", user)
    if (user) {
      if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.password)) {
        res.cookie("user_id",  user.id);
      res.redirect('/urls');
    } 
      res.status(403).send("You are not a registered User")
    }
    res.status(403).send('You do not have an account. Please register');
  
  })
  
  app.post("/logout", (req, res) =>{
    res.clearCookie("user_id");
    res.redirect("/urls");
  });
  
  app.get("/urls", (req, res) => {
    const id = req.cookies["user_id"]
    const user = users[id]
    const templateVars = { 
      urls: urlDatabase,
      user: user
    }; 
    if (req.cookies.user_id) {
      res.render("/urls_index", templateVars);
    }
    else {
      res.redirect('/login')
    }
    // console.log("req:")
    // res.render("urls_index", templateVars);
  });
  
  
  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });