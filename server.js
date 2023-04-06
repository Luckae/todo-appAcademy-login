const createError = require('http-errors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const indexRouter = require('./router.js');
const db  = require('./database/dbConnection');
const { signupValidation, loginValidation } = require('./validation');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const app = express();

app.use(express.json());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());
 

// app.use('/api/', indexRouter, function(req, res){
//     res.send("Codeflare! You're on top of the world!");
// });

app.use('/appAcademy/register/', signupValidation, function(req, res, next){
    // res.send("Register");
    // router.post('/register/', signupValidation, (req, res, next) => {
db.query(
`SELECT email FROM users_academy WHERE LOWER(email) = LOWER(${db.escape(
req.body.email
)});`,
(err, result) => {
if (result.length) {
return res.status(409).send({
msg: 'This email is already in use'
});
} 
// username is available

bcrypt.hash(req.body.password, 10, (err, hash) => {

if (err) {
return res.status(500).send({
msg: "An error occurred"
});
} else {
// has hashed pw => add to database
db.query(
`INSERT INTO users_academy (name, email, password) VALUES ('${req.body.name}', ${db.escape(
req.body.email
)}, ${db.escape(hash)})`,
(err, result) => {
if (err) {
throw err;
return res.status(400).send({
msg: err
});
}
return res.status(201).send({
msg: 'Registration successful!'
});
}
);
}
});


}
);
// });
});

app.use('/appAcademy/login/', loginValidation, function(req, res, next){
    // res.send("Login");
    // router.post('/login/', loginValidation, (req, res, next) => {
db.query(
`SELECT * FROM users_academy WHERE email = ${db.escape(req.body.email)}`,
(err, result) => {
// user does not exists
if (err) {
// throw err;
return res.status(400).send({
msg: "An error occurred"
});
}
else if (!result) {
return res.status(401).send({
msg: 'Email or password is incorrect!'
});
}else{
// check password
bcrypt.compare(
req.body.password,
result[0]['password'],
(bErr, bResult) => {
// wrong password
if (bErr) {
throw bErr;
return res.status(401).send({
msg: 'Email or password is incorrect!'
});
}
if (bResult) {
const token = jwt.sign({id:result[0].id},'the-super-strong-secrect',{ expiresIn: '1h' });
db.query(
`UPDATE users_academy SET last_login = now() WHERE id = '${result[0].id}'`
);
return res.status(200).send({
msg: 'Logged in!',
token,
user: result[0]
});
}
return res.status(401).send({
msg: 'Username or password is incorrect!'
});
}
);
}
}
);
// });
});

// app.use('/api/get-user/', function(req, res){
//     if(
// !req.headers.authorization ||
// !req.headers.authorization.startsWith('Bearer') ||
// !req.headers.authorization.split(' ')[1]
// ){
// return res.status(422).json({
// message: "Please provide the token",
// });
// }
// const theToken = req.headers.authorization.split(' ')[1];
// const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
// db.query('SELECT * FROM users_academy where id=?', decoded.id, function (error, results, fields) {
// if (error) throw error;
// return res.send({ error: false, data: results[0], message: 'Fetch Successfully.' });
// });
// })

// Handling Errors
app.use((err, req, res, next) => {
    // console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
      message: err.message,
    });
});

app.listen(3000,() => console.log('Server is running on port 3000'));
