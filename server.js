const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nedb = require("nedb");
const expressSession = require("express-session");
const nedbSessionStore = require("nedb-session-store");
const bcrypt = require("bcrypt");
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const path = require("path");
const urlEncodedParser = bodyParser.urlencoded({ extended: true });
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);
const nedbInitializedStore = nedbSessionStore(expressSession);
const sessionStore = new nedbInitializedStore({
  filename: "sessions.txt",
});
app.use(urlEncodedParser);
app.use(cookieParser());
app.use(
  expressSession({
    store: sessionStore,
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
    secret: "supersecret123",
  })
);
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});
let usersdatabase = new nedb({
    filename: "userdb.txt",
    autoload: true,
  });
  
  // function requiresAuth(req, res, next) {
  //   if (req.session.loggedInUser) {
  //     console.log("requires auth: " + req.path);
  //     next();
  //     // res.redirect('/quizzes')
  //   } else {
  //     res.redirect("/login?error=true");
  //   }
  // }
  app.get("/signup", (req, res) => {
    res.render("signup.ejs", {});
  });
  app.get("/login", (req, res) => {
    res.render("login.ejs", {});
  });
  app.post("/signup", (req, res) => {
    // Generate a salt
    const salt = bcrypt.genSaltSync(10);
    
    // Hash the password with the generated salt
    let hashedPassword = bcrypt.hashSync(req.body.password, salt);
  
    let data = {
      username: req.body.username,
      fullname: req.body.fullname,
      password: hashedPassword,
    };
  
    console.log(data);
    usersdatabase.insert(data, (err, insertedData) => {
      res.redirect("/home");
    });
});
app.get("/home", (req, res) => {
  res.render("home.ejs", {});
});
  app.post("/login", (req, res) => {
    let data = {
      username: req.body.username,
      password: req.body.password,
    };
  
    let searchedQuery = {
      username: data.username,
    };
  
    usersdatabase.findOne(searchedQuery, (err, user) => {
      console.log("attempt login");
      if (err || user == null) {
        res.redirect("/login");
      } else {
        console.log("found user");
        let encPass = user.password;
        if (bcrypt.compareSync(data.password, encPass)) {
          let session = req.session;
          session.loggedInUser = data.username;
          console.log("successful login");
          res.redirect("/home");
  
          // res.redirect("/main");
        } else {
          res.redirect("/login");
        }
      }
    });
  });
  
  

app.get("/join", (req, res) => {
  roomName= req.query.roomName
  console.log(roomName);
  res.redirect(
    url.format({
      pathname: `/join/${uuidv4()}`,
      query: req.query,
    })
  );
});

app.get("/joinold", (req, res) => {
  res.redirect(
    url.format({
      pathname: req.query.meeting_id,
      query: req.query,
    })
  );
});

app.get("/join/:rooms", (req, res) => {
  roomId = req.params.rooms; 
  roomName= req.query.roomName
  res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});

app.get("/meeting", (req,res)=>{
  res.render('meeting.ejs')
})
app.get("/timer", (req,res)=>{
  res.render('timer.ejs')
})


// let roomId
// let myname
// let roomName

// app.get("/room", (req,res)=>{
//   res.render('room.ejs',{ Myname: req.query.name, roomid: roomId, roomName: roomName })
// })

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, id, myname) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", id, myname);

    socket.on("messagesend", (message) => {
      console.log(message);
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("tellName", (myname) => {
      console.log(myname);
      socket.to(roomId).broadcast.emit("AddName", myname);
    });
    

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", id);
    });
  });
});

server.listen(process.env.PORT || 3030);
