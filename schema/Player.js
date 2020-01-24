var mongoose=require("mongoose");
var Schema=mongoose.Schema;

//structure of schema
var PlayerSchema=new Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        trim:true,
        required:true
    },
    dob:{
        type:Date,
        default:Date()
    },
    role:{
        type:Array
    },
    bowlerstyle:{
        type:String,
        trim:true
    },
    batsmanstyle:{
        type:String,
        trim:true
    },
    team:{
        type:String,
        trim:true
    },
    userrole:{
        type:String,
        enum:['Admin','User'],
        trim:true,
        default:'User'
    },
    profile:{
        type:String
    }
},{
    collection:'Player',
    timestamps:true
});

module.exports=mongoose.model('Player',PlayerSchema);