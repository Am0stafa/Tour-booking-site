const mongoose = require('mongoose');
const validator = require('validator');
var bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
        default:'default.jpg'
    },
    role:{
        type:String,
        //! theis user roles will be specific to the application domain
        enum:['admin', 'guide',"lead-guide","user"],
        //? default so that we dont have to specify always the user we are creating
        default:'user'
    },
    password:{
        type:String ,
        required: [true, "A user must have password"],
        minlength: 8,
        select:false //! still doesnt hide from creation
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
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    //! so that the user only have limited time to reset the password
    passwordResetExpire:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
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
//^ 1)run only when created or modified
//^ 2)hash the password in an async way
//^ 3)delete the confirm password


//! Middleware function to set the passwordChangedAt property of the user for the protected route ONlY when the password change not when its newly created
userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now()-1000;
    next();
});


//! Query middleware which is something that will happen before a query to hide any inactive user as if he doesnt exist
//? any query that start with find
userSchema.pre(/^find/,function(next){
    //^ this point to the current query is executed
    //& we only want to find the documents which have the active property set to true so we will take our query and return only where active is not false and there are some documents who dont have active property
    this.find({active:{$ne:false}})
    next();

});


//----------------------------------------------------------------------------

//! Instance method that will be available on each document of this collection and what it will do is take the password that the user entered and hash it and compare it to the password in the related document 

//& usally we use this to refare to the document it is called on but This time as the password is not selected so we cant :(

userSchema.methods.correctPassword = async function(passEntered, userPassword) {
    //it will return true or false
    //* compare function hash the password and compare them
    return await bcrypt.compare(passEntered, userPassword);
//! when calling this function we must await it as it is an async function
}

//!Now just call it in the login



//! another instance method to check if the password is changed

userSchema.methods.checkChangePassword = function(JWTtime) {
    //? we will compare the time it is created and the time the password changed but only if passwordchange field exist as it will only be added only if we changed the password.
    
    if(this.passwordChangedAt){
       //* as the JWT time will be in milisecond so we will convet ours also to milliseconds 
        const newTime = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTtime<newTime
    }
    
    return false;
}

//! instance method to generate randome token

userSchema.methods.createPasswordResetToken = function() {
    //^ the password reset token should be a random string and it need to be cryptographically strong as the password hash.we should never store a plain reset token in theh database
    
    //? this will generate a 32 lenght string in hex formate
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    //? hashing the token
    const encryptToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    
    //? save it to the database so that the user can then compare it with the token the user provides
    this.passwordResetToken = encryptToken;
    //! we want it to only work for 10 mins so we convert it to miliseconds
    this.passwordResetExpire = Date.now()+10*60*1000;
    
    //? finally we will return the reset token which will be send via email
    //! so we send unencrypted one via email and store the encrypted one in the database to the encrpted one alone is useless
    return resetToken;
    
    
};



const User = mongoose.model('User',userSchema);

module.exports =  User



