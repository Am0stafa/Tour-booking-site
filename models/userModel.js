const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name:{
        type: String ,
        required:[ true, "Please tell me your name"]
    },
    email: {
        type: String , 
        required: [true, "A user must have an email"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please enter a valid email address']
        
    },
    photo:{
        type: String ,
        
    },
    password:{
        type:String ,
        required: [true, "A user must have password"],
        minlength: 8
    },
    passwordConfirm:{
        type:String,
        required: [true, "A user must have password"],
    }

})

const User = mongoose.model('User',userSchema);

module.exports =  User



