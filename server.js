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
  "/api/exercise/new-user",
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

app.get("/api/exercise/users", (req, res) => {
  User.find({}, (err, arrayOfUsers) => {
    if (!err) {
      res.json(arrayOfUsers)
    }
  })
})

app.post(
  "/api/exercise/add",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let newSession = new Session({
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: req.body.date,
    })

    if (newSession.date === "") {
      newSession.date = new Date().toISOString().substring(0, 10)
    }

    User.findByIdAndUpdate(
      req.body.userId,
      { $push: { log: newSession } },
      { new: true },
      (err, updatedUser) => {
        if (!err) {
          let respObj = {}
          respObj["_id"] = updatedUser.id
          respObj["username"] = updatedUser.username
          respObj["date"] = new Date(newSession.date).toDateString()
          respObj["duration"] = newSession.duration
          respObj["description"] = newSession.description
          res.json(respObj)
        }
      }
    )
  }
)

app.get("/api/exercise/log", (request, response) => {
  User.findById(request.query.userId, (error, result) => {
    if (!error) {
      let responseObject = result

      if (request.query.from || request.query.to) {
        let fromDate = new Date(0)
        let toDate = new Date()

        if (request.query.from) {
          fromDate = new Date(request.query.from)
        }

        if (request.query.to) {
          toDate = new Date(request.query.to)
        }

        fromDate = fromDate.getTime()
        toDate = toDate.getTime()

        responseObject.log = responseObject.log.filter((session) => {
          let sessionDate = new Date(session.date).getTime()

          return sessionDate >= fromDate && sessionDate <= toDate
        })
      }

      if (request.query.limit) {
        responseObject.log = responseObject.log.slice(0, request.query.limit)
      }

      responseObject = responseObject.toJSON()
      responseObject["count"] = result.log.length
      response.json(responseObject)
    }
  })
})
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port)
})
