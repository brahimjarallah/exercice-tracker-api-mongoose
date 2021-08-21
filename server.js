const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
require("dotenv").config()
const mongoose = require("mongoose")

app.use(cors())
app.use(express.static("public"))
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})

let uri =
  "mongodb+srv://brahim:" +
  process.env.PW +
  "@cluster0.nab8p.mongodb.net/db1?retryWrites=true&w=majority"

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

let exerciseSessionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
})
let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [exerciseSessionSchema],
})
let Session = mongoose.model("Session", exerciseSessionSchema)
let User = mongoose.model("User", userSchema)

app.post(
  "/api/users",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let newUser = new User({ username: req.body.username })
    newUser.save((error, data) => {
      if (!error) {
        let respObj = {}
        respObj["username"] = data.username
        respObj["_id"] = data.id
        res.json(respObj)
      }
    })
  }
)

app.get("/api/users", (req, res) => {
  User.find({}, (err, arrayOfUsers) => {
    if (!err) {
      res.json(arrayOfUsers)
    }
  })
})

app.post(
  "/api/users/:_id/exercises",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let newSession = new Session({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date || new Date().toISOString().substring(0, 10),
    })


    User.findByIdAndUpdate(
      req.body.id,
      { $push: { log: newSession } },
      { new: true },
      (err, updatedUser) => {
        if (!err) {
          let respObj = {}
          respObj["_id"] = updatedUser.id
          respObj["username"] = updatedUser.username
          respObj["date"] = new Date(newSession.date).toDateString()
          respObj["description"] = newSession.description
          respObj["duration"] = newSession.duration
          res.json(respObj)
        }
      }
    )
  }
)



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port)
})
