const express = require('express')
const UserModel = require('../models/user')
const auth=require('../middleware/auth')
const router = new express.Router()
const multer=require('multer')
const { request } = require('express')
const sharp=require('sharp')
router.get('/test', (req, res) => {
    res.send('From new file')
})

// Create User
router.post('/users', async (request, response) => {
    const user = new UserModel(request.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        
        response.status(201).send({ user, token })
    } catch (e) {
        response.status(400).send(e)
    }
})

// User Login
router.post('/users/login', async (request, response) => {
    try {       
        const user = await UserModel.findByCredentials(request.body.email, request.body.password)
        const token=await user.generateAuthToken()
        response.status(200).send({message:"Logged in Successfully",token,user})
    } catch (e) {
        response.status(404).send(e)
    }
})

router.post('/user/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token    
        })
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/user/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

// GET ALL USER
router.get('/user/me',auth, async(request, response) => {
        response.send(request.user)
})

//UPDATE RESOURCE
router.patch('/updateUser/me',auth, async (request, response) => {

    //Validations
    const updates = Object.keys(request.body) //GET keys array
    const allowedUpdate = [ 'name', 'email', 'password', 'age' ]
    const isValidOperations = updates.every((update) => { // will check iuf the paramteres are valid
        return allowedUpdate.includes(update)
    })

    if (!isValidOperations) {
        return response.status(404).send({error:'Invalid Operation'})
    }

    try {
        updates.forEach((update) => {
            request.user[update]=request.body[update]
        })
        await request.user.save()
        // const user = await UserModel.findByIdAndUpdate(_id, request.body, { new: true, runValidators: true }) //find by ID,check validations and return newly updated entry
        response.send(request.user)
    } catch (e) {
        response.status(400).send('error'+e)
    }
})


// Delete Resources
router.delete('/deleteUser/me',auth, async (request, response) => {
    try {
        await request.user.remove()
        response.send({
            message:
                'user deleted Successfully'
        })
    } catch (e) {     
        console.log(e);
        response.status(400).send(e)
    }
})

//Image Upload Module MULTER
const upload = multer({
    //Image Size Validations
    limits: {
        fileSize:1000000
    },
    //Image extension validation
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jprg|png)$/)) {
            return cb(new Error('File must be a jpg,jpeg or png file'))
        }
        cb(undefined,true)
    }
})

//Image Upload URL
router.post('/user/me/avatar', auth, upload.single('avatar'), async (request, response) => {
    // Modify the image using SHARP module
    const buffer = await sharp(request.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    //Assing the image
    request.user.avatar = buffer
    // Save the Image and store it in the database
    await request.user.save()

    response.status(200).send({message:'File Uploaded Successfully'})    
}, (error, req, res, next)=>{
        res.status(400).send({error:error.message})
})

//Delete Uploaded Image
router.delete('/user/me/avatar', auth, async (request, response) => {
    try {
        //Unset the buffer
        request.user.avatar = undefined
        //Save it
        await request.user.save()
        response.status(200).send({ message:'Avatar Deleted Successfully'})
    }
    catch (e) {
        response.status(400).send({ error:e})
    }
})

// Get Profile Image using ProfileID
router.get('/user/:id/avatar', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
        if (!user||!user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send(e)
    }
})

module.exports=router