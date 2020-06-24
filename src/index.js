const express = require('express')
require('./db/mongoose') // connection
const userRouter = require('../src/routers/users')
const taskRouter = require('../src/routers/task')
const app = express()

const port = process.env.PORT   

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Serve Point
app.listen(port, () => {
    console.log("Server is up on port ",port);
})

// ==========================================================================
// User Task Relationship
/* const Task=require('../src/models/task')
const User=require('./models/user')
const main = async () => {
    const task = await Task.findById('5ee0b6249e729e2410a9f2b7')
    await task.populate('owner').execPopulate()
    console.log(task.owner);
    const user = await User.findById('5ee0b53dc3acd205908f7b82')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks);
    
}
main()
 */
// ==========================================================================
// MIDDLEWARE
/* app.use((req,res,next) => {
    console.log(req.method,req.path);
    if (req.method === 'GET') {
        res.send('Get requests are disabled')
    } else {
        next()        
    }
})
// ==========================================================================
DISABLE ALL API REQUEST RESPONSE
app.use((req, res, next) => {
    res.status(503).send('Site is under maintanance')
})
 */
// ==========================================================================
// IMAGE UPLOAD
/* const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        fileSize:1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('File must be a doc'))
        }
        cb(undefined, true)
    }
})

app.post('/upload',upload.single('upload'), (req, res) => {
    res.send('200')
}, (error, req, res, next) => {
        res.status(400).send({ error: error.message })
}) */
// ==========================================================================
