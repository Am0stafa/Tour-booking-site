const mongoose = require('mongoose');
const validator = require('validator');
var bcrypt = require('bcryptjs');

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
        //! confirm if the two passwords are the same using custom validator
        validate:{
            //! only work on CREATE and SAVE!!
            validator:function(currentelement){
                return currentelement === this.password
            },
            message:"password didnt match"
        } 
    }

})

        //^ENCRYPTION

//? a middleware on the document to encrypt the password between the moment that we resive the data and the moment it is actually persisted to the database

userSchema.pre('save',async function(next){
    //! we want to encrpt the password only if the password field has been updated OR when it is created new not if the user only update the email for example
    
    //not modified exit
    if(!this.isModified('password')) return next();
    
    
    //& hash the password with cost of 12
    this.password = await bcrypt.hash(this.password,12)
    
    //* Finally we want to delete the confirmPassword as we have the password encrpted and after the validation was successful we no longer need this field to be saved in the database
    
    this.passwordConfirm = undefined;
   //! this work although it is required as required means that it is required as input but not to be presisted to the database  

    next();
});
//!Summary three things is done up:
//1)run only when created or modified
//2)hash the password in an async way
//3)delete the confirm password

//----------------------------------------------------------------------------




const User = mongoose.model('User',userSchema);

module.exports =  User



