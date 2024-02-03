const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')



/**
 * @typedef Task
 * @property {string} description - The description of the task
 * @property {boolean} completed - The completion status of the task
 */



/**
 * @typedef TaskWithOwner
 * @property {string} description - The description of the task
 * @property {boolean} completed - The completion status of the task
 * @property {string} owner - The id of the owner of the task
 */

/**
 * This function comment is parsed by doctrine
 * @route POST /tasks
 * @group Tasks - Operations about tasks
 * @param {Task.model} task.body.required - the new task
 * @returns {TaskWithOwner.model} 201 - An object of task info
 * @returns {Error} 400 - Bad request
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send()
    }
})


/**
 * This function comment is parsed by doctrine
 * @route GET /tasks
 * @group Tasks - Operations about tasks
 * @param {string} completed.query - Filter tasks by completion status
 * @param {string} limit.query - Limit number of tasks returned
 * @param {string} skip.query - Skip number of tasks for pagination
 * @param {string} sortBy.query - Sort tasks by field:order
 * @returns {Array.<Task>} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed){ 
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

/**
 * This function comment is parsed by doctrine
 * @route GET /tasks/{id}
 * @group Tasks - Operations about tasks
 * @param {string} id.path.required - id of the Task to get
 * @returns {Task.model} 200 - An object of task info
 * @returns {Error} 404 - Task not found
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id, owner: req.user._id})
        
        if (!task) {
            return res.status(404).send()
        }
        
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


/**
 * This function comment is parsed by doctrine
 * @route PATCH /tasks/{id}
 * @group Tasks - Operations about tasks
 * @param {string} id.path.required - id of the Task to update
 * @param {Task.model} task.body.required - the new task
 * @returns {Task.model} 200 - An object of task info
 * @returns {Error} 400 - Invalid updates
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }

    try {
        const task = await Task.findOne({ _id:req.params.id, owner: req.user._id })
        // const task = task.findById(req.params.id)
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send()
    }
})


/**
 * This function comment is parsed by doctrine
 * @route DELETE /tasks/{id}
 * @group Tasks - Operations about tasks
 * @param {string} id.path.required - id of the Task to delete
 * @returns {Task.model} 200 - An object of task info
 * @returns {Error} 404 - Task not found
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router