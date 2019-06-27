const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const router = require('./routers/router');

const app = express();
app.use(morgan('combined'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', router); 
app.use((req, res, next) => {
    const err = new Error('Not found');
    res.status(404);
    next(err);
})
app.use((req, res, next) => {
    const error = app.get('env') === 'development' ? err : {};
    const status = error.status || 500;
    res.status(status).json({
        error: {
            message: error.message
        }
    })
})

module.exports = app;