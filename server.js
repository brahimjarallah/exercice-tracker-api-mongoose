const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const cors = require("cors")
require("dotenv").config()
const mongoose = require("mongoose")
let uri =
  "mongodb+srv://brahim" +
  process.env.PW +
  "<password>@cluster0.nab8p.mongodb.net/db1?retryWrites=true&w=majority"
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

let exerciseSessionSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
})
let userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  log: [exerciseSessionSchema]

})
let Session = mongoose.model('Session', exerciseSessionSchema)
let User = mongoose.model('User', userSchema)


app.use(cors())
app.use(express.static("public"))
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html")
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port)
})
