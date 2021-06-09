const express = require('express')
const morgan = require('morgan')
const path = require('path');
const bodyParser = require('body-parser');
const authRouter = require('./controllers/auth');
const passport = require('passport');
const { Mongo } = require('./db/connect');


const app = express()
const port = 3000

// logger middleware
app.use(morgan('combined'))
// parse body
app.use(bodyParser.json());
app.use(passport.initialize())
// serve static files from this directory
app.use(express.static(path.join(__dirname,'/www/')))

app.set('views','./src/views')
app.set('view engine','ejs')

// routes
app.use('/api/auth',authRouter)


Mongo.connect();
app.listen(3000,()=>{
    console.log(`Example app listening at http://0.0.0.0:${port}`)
})