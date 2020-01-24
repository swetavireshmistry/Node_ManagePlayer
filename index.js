var express=require('express');
var cors=require('cors');

var mongoose=require("mongoose");

var app=express();
app.use(cors());
app.use(express.json());

const router=express.Router();


mongoose.connect("mongodb://localhost:27017/dbplayer1",{});
mongoose.connection.on('error',function(error){
   console.log("an error occured while making db connection",error);
    process.exit(1);
}).once('open',function(){
    console.log("mongoose connection succesfully");
});

app.use('/Upload',express.static("Upload"));
var player=require('./Player');
app.use('/player',player);

app.use(router);

app.listen(3032,function(error){
    if(error)
        console.log("An error occured while during executaion",error);
    console.log("node application successfully started on http://localhost:3032");
});
