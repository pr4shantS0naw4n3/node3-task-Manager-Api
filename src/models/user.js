const mongoose = require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const TaskModel=require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        uppercase:true,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw Error('Invalid Email')
            }
        }
    },
    password: {
        type: String,
        required:true,
        minlength: 6,
        trim: true,
        validate(value) {
            if (value.includes('password')) {
                throw Error('Invalid Password')
            }
        }
    },
    age: {
        type: Number,
        default:0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [ {
        token: {
            type: String,
            required:true
        }
    } ],
    avatar: {
        type:Buffer
    }
}, {
    timestamps:true
})

// Virtual Property
userSchema.virtual('tasks' // Field Name
,{
    ref: 'Tasks', // Reference to the Model
    localField: '_id', // Fieldname of User Model
    foreignField:'owner' // Field name of reference model
})

// Static methods are accessible on the models sometimes called the Model Methods
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to Login')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to Login')
    }
    return user
}

// Methods method are accessible on the instances sometimes called instance methods
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
// Hash the password before user is saved
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }    
    next()
})

// Delete user tasks when user is deleted
userSchema.pre('remove', async function (next) {
    const user = this
    await TaskModel.deleteMany({owner:user._id})
    next()
})
const User = mongoose.model('User', userSchema)

module.exports=User