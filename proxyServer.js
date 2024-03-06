const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router')

const mongoose = require('mongoose');
require('dotenv/config');
const app = express();


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use('/', router)

const dbOptions = {useNewUrlParser:true, useUnifiedTopology:true}
mongoose.connect(process.env.DB_SUMMONER_URI, dbOptions)
    .then(() => console.log('DB Connected!'))
    .catch(err => console.log(err))

const port = process.env.PORT || 4000;
app.listen(port, function(){
    console.log("Server Started on port 4000");
}); 