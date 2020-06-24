const express = require('express')
const TaskModel = require('../models/task')
const auth=require('../middleware/auth')
const router = new express.Router()

// Create Task
router.post('/task',auth, async (request, response) => {
    const task = new TaskModel({
        ...request.body,
        owner:request.user._id
    })
    try {
        await task.save()
        response.status(201).send(task)
    } catch (e) {
        response.status(400).send(error)  
    }
})



// GET ALL TASK LIST
// getTasks?completed=true //FILTER
// getTasks?limit=10&skip=20 //PAGINATION
// getTasks?sortBy=createdAt:asc or desc // SORTING
router.get('/getTasks', auth, async (request, response) => {
    const match = {}
    const sort={}
    if (request.query.completed) { //Filter
        match.completed=request.query.completed==='true'
    }

    if (request.query.sortBy) { //Sorting
        const parts = request.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='asc'?1:-1
    }
    
    try {
        // const tasks = await TaskModel.find({ owner: request.user._id })
        await request.user.populate({
            path: 'tasks',
            match, //Filter
            options: { 
                limit: parseInt(request.query.limit), //Pagination
                skip: parseInt(request.query.skip), //Pagination
                sort //Sorting
            }
        }).execPopulate() 
        /* if (tasks.length === 0) {
            response.status(404).send('Not Found')
        } */
        // response.send(tasks)
        response.send(request.user.tasks)
    } catch (e) {
        console.log(e);
        
        response.status(500).send(e)
    }
})
// GET SINGLE TASK BY ID
router.get('/getTaskById/:id',auth,async (request, response) => {
    const _id = request.params.id
    try {
        // const task = await TaskModel.findById(_id)
        const task = await TaskModel.findOne({ _id, owner: request.user._id })
        
        if (!task) {
            response.status(404).send({message:"Task Not Found"})
        }
        response.send(task)
    } catch (e) {
        response.status(500).send()
    }
})


// UPDATE TASK
router.patch('/updateTask/:id',auth, async (request, response) => {
    const updates=Object.keys(request.body)
    const allowedUpdate = [ 'completed', 'description' ]
    const isUpdateAllowed = updates.every((update) => {
        return allowedUpdate.includes(update)
    })

    if (!isUpdateAllowed) {
        return response.status(400).send({error:'Invalid Operation'})
    }
    try {
        const _id = request.params.id
        const task = await TaskModel.findOne({ _id, owner: request.user._id })
        // const task = await TaskModel.findByIdAndUpdate(_id, request.body, { new: true, runValidators: true }) //Direct Update
        if (!task) {
            response.status(404).send()
        }
        updates.forEach((update) => task[update]=request.body[update])
        await task.save()

        response.send(task)
    } catch (e) {
        response.status(400).send(e)
    }
})


//Delete task
router.delete('/deleteTask/:id',auth, async (request, response) => {
    try {
        // const task = await TaskModel.findByIdAndDelete(request.params.id)
        const task= await TaskModel.findByIdAndDelete({_id:request.params.id,owner:request.user._id})
        if (!task) {
            return response.status(404).send('Not fOUND')
        }
        response.send({ message: "Deleted Successfully", task })
    } catch (e) {
        console.log(e);
        
        response.status(400).send(e)
    }
})

module.exports=router