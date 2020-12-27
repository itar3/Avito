const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const redis = require('redis');

//Redis create client
let client = redis.createClient();
client.on('connect', function(){
    console.log('Connected to redis');
});

//set port
const port = 3000;

//Init app
const app = express();

//View engine
app.engine('handlebars',exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//body parses
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//search page
app.get('/', function(req, res, next){
    res.render('searchusers');

})

//Add key-value
app.post('/user/add', function(req,res,next){
    let key = req.body.key;
    let value = req.body.value;
    let time = req.body.time;
    client.set(key,value, function(err){
        if(!value){
            console.log('no value')
            res.render('searchusers', {
                error2: 'Value is empty'
            });
        }else if(!key){
            console.log('no key')
            res.render('searchusers', {
                error2: 'Key is empty'
            });
        }else{
            if(time !== ""){
                client.expire(key, time);
            }
            res.redirect('/');
        }
       

    });
});

//Find all pattern matching keys
app.post('/user/allkeys', function(req,res,next){
    let k = req.body.allkeys;
    client.keys(k, function(err, keys){
        if(!k){
            console.log('No key entered')
            res.render('searchusers', {
                error3: 'Key field is empty'
            });
        }else{
            obj = {keys};
            res.render('alldetails', {obj});
        }
        

    });
});

//Get key
app.post('/user/search', function(req,res,next){
    let id = req.body.id;
    client.get(id, function(err, value){
        if(!value){
            res.render('searchusers', {
                error: 'User does not exist'
            });
        }else{
            client.ttl(id, function(err, time){
                if(time == -1){
                    time = 'inf'
                }
                obj = {value, id, time}
                res.render('details', {obj});
            });   
        }
    });
});



//Delete key
app.post('/user/delete', function(req,res,next){
    client.del(req.body.deleteId);
    res.redirect('/');
});

app.listen(port, function(){
    console.log('server started on port' + port);
});
