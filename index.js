require('dotenv').config()
const { configDotenv } = require('dotenv')
const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {//four arguments(err,req,res,next)
  res.send('Hello World!')
})
app.get('/twitter', (req, res) => {
  res.send('surajdotcom')
})

app.get('/login',(req, res) => {//reatart the server
  res.send('<h1>Login your account</h1>')
})
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})
