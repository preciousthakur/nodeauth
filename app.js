const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const mongoose = require('mongoose');
const User = require('./models/users')
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const crypto = require('crypto');
const key = "password";
const algo = "aes256";
const jwt = require('jsonwebtoken')
jwtKey = "jwt"
mongoose.connect('mongodb+srv://anmol:ph34PCWFyQoCm1cB@cluster0.ilmt8.mongodb.net/nodeauth?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('connected')
})

app.post('/register', jsonParser, function (req, res) {
    var cipher = crypto.createCipher(algo, key);
    var encrypted = cipher.update(req.body.password, "utf-8", "hex")
        + cipher.final('hex');
    const data = new User({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        password: encrypted,
    })
    // console.log(req.body.password)

    data.save().then((result) => {
        jwt.sign({ result }, jwtKey, { expiresIn: '300s' }, (err, token) => {
            res.status(201).json({"User Registered Successfully"})
        })
        // res.ststus(201).json(result)
    })
        .catch((err) => console.warn(err)
        )
})




app.post('/login', jsonParser, function (req, res) {
    User.findOne({ email: req.body.email }).then((data) => {
        var decipher = crypto.createDecipher(algo, key);
        var decrypted = decipher.update(data.password, 'hex', 'utf-8') +
            decipher.final('utf-8');
        if (decrypted == req.body.password) {
            jwt.sign({ data }, jwtKey, { expiresIn: '300s' }, (err, token) => {
                res.status(200).json({ token })
            })
        }
    })
})




app.get('/users', verifyToken, function (req, res) {
    User.find().then((result) => {
        res.status(200).json(result)
    })
})

function verifyToken(req, res, next) {
    const beareHeader = req.headers['authorization'];


    if (typeof beareHeader !== 'undefined') {
        const bearer = beareHeader.split(' ');
        console.log(bearer[1])
        req.token = bearer[1]
        jwt.verify(req.token, jwtKey, (err, authData) => {
            if (err) {
                res.json({ result: err })
            }
            else {
                next();
            }
        })
    }
    else {
        res.send({ "result": "token not provided" })
    }
}

app.listen(5000);
