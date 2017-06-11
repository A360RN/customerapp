var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;

var app = express();

/*
var logger = function(req, res, next){
    console.log('Logging...');
    next();
}

app.use(logger);
*/

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// Global vars
app.use(function (req, res, next) {
    res.locals.errors = null;
    next();
})

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.get('/', function (req, res) {
    res.redirect('/users');
});

app.get('/users', function (req, res) {

    db.users.find(function (err, users) {
        res.render('index', {
            title: 'Customers',
            users: users
        });
    })

});

app.post('/users', function (req, res) {
    req.checkBody('first_name', 'First Name is Required').notEmpty();
    req.checkBody('last_name', 'Last Name is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();

    var errors = req.validationErrors();

    if (!errors) {
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
       
       db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect('/');
       })
    }
});

app.delete('/users/:id', function(req, res){
    var id = req.params.id;
    db.users.remove({
        _id: ObjectId(id)
    }, function(err){
        if(err){
            console.log(err);
        }
    });
});


app.listen(3000, function () {
    console.log("Server started on port 3000...");
});