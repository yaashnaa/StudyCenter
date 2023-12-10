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
const io = require('socket.io')(server);
const { ExpressPeerServer } = require("peer");
const url = require("url");
// const fs = require("fs");


const peerServer = ExpressPeerServer(server, {
  debug: true,
});
class Room {
  constructor(roomId, roomName, creator) {
    this.roomId = roomId;
    this.roomName = roomName;
    this.creator = creator;
  }
}
// var options = {
//   key: fs.readFileSync("privkey.pem"),
//   cert: fs.readFileSync("fullchain.pem"),
// };
const activeRooms = [];


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

// let todolist = new nedb({
//   filename: "todo.txt",
//   autoload: true,
// });
let userTodos = new nedb({
  filename: "usertodos.txt",
  autoload: true,
});

function requiresAuth(req, res, next) {
  if (req.session.loggedInUser) {
    next();
    // res.redirect('/quizzes')
  } else {
    res.redirect("/login?error=true");
  }
}
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
app.get("/home", requiresAuth, (req, res) => {
  // Check if the user is logged in
  if (req.session.loggedInUser) {
    // Retrieve all to-do items for the logged-in user
    userTodos.find(
      { username: req.session.loggedInUser },
      function (err, todos) {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
        } else {
          // Pass the username and to-do items to the rendering context
          res.render("home.ejs", {
            username: req.session.loggedInUser,
            todos: todos,
            activeRooms: activeRooms,
          });
        }
      }
    );
  } else {
    // Redirect to login if the user is not logged in
    res.redirect("/login");
  }
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
  const roomName = req.query.roomName;
  const creator = req.session.loggedInUser; // Assume the creator is the logged-in user
  const roomId = uuidv4();

  // Create a new Room instance and add it to the activeRooms array
  const newRoom = new Room(roomId, roomName, creator);
  activeRooms.push(newRoom);
  console.log(roomId + '***');

  res.redirect(
    url.format({
      pathname: `/join/${roomId}`,
      query: req.query,
    })
  );
});

app.get("/joinold", (req, res) => {
  console.log(req.query.meeting_id + "meeting id");
  res.redirect(
      url.format({
          pathname: req.query.meeting_id,
          query: req.query,
      })
  );
});

app.get("/join/:rooms", (req, res) => {
  res.render("room", { roomid: req.params.rooms, myname: req.query.name, roomName: req.query.roomName});

});



app.get("/meeting", (req, res) => {
  res.render("meeting.ejs");
});
app.get("/solostudy", (req, res) => {
  res.render("solostudy.ejs", { Myname: req.query.name });
});
app.get("/timer", (req, res) => {
  res.render("timer.ejs");
});

app.get("/spotify", (req, res) => {
  res.render("spotify.ejs");
});

app.get("/logout", (req, res) => {
  // Destroy the user session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Redirect to the login page after logout
      res.redirect("/");
    }
  });
});

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
