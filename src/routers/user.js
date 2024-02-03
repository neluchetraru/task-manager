const express = require('express')
const router = new express.Router()
const sharp = require('sharp')
const auth = require('../middleware/auth')
const Task = require('../models/task')
const User = require('../models/user')
const multer = require('multer')


/**
 * @typedef User
 * @property {string} name.required - The name of the user
 * @property {string} email.required - The email of the user
 * @property {number} age - The age of the user
 * @property {string} password.required - The password of the user
 * @property {Array.<Token>} tokens - The tokens of the user
 * @property {string} avatar - The avatar of the user
 */

/**
 * @typedef Token
 * @property {string} token.required - The token
 */

/**
 * @typedef UserWithToken
 * @property {User.model} user - The user info
 * @property {Token.model} token - The token
 */


/**
 * @route POST /users
 * @group Users - Operations about users
 * @description Creates a new user
 * @param {User.model} user.body.required - the new user
 * @returns {UserWithToken.model} 201 - An object of user info and token
 * @returns {Error} 400 - Bad request
 * @returns {Error}  default - Unexpected error
 */
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        token = await user.generateAuthToken()

        res.status(201).send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }

})


/**
 * @route POST /users/login
 * @group Users - Operations about users
 * @description Logs in the user
 * @param {string} email.body.required - email of the user
 * @param {string} password.body.required - password of the user
 * @returns {UserWithToken.model} 200 - An object of user info and token
 * @returns {Error} 400 - Bad request
 * @returns {Error}  default - Unexpected error
 */
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({
            user,
            token
        })
    } catch (e) {
        res.status(400).send()
    }
})


/**
 * @route POST /users/logout
 * @group Users - Operations about users
 * @description Logs out the user
 * @returns {object} 200 - Success message
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.post('/users/logout', auth, async (req, res) => {
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


/**
 * @route POST /users/logoutAll
 * @group Users - Operations about users
 * @description Logs out the user from all devices
 * @returns {object} 200 - Success message
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})


/**
 * @route GET /users/me
 * @group Users - Operations about users
 * @description Gets the user info
 * @returns {User.model} 200 - An object of user info
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


/**
 * @route PATCH /users/me
 * @group Users - Operations about users
 * @description Updates the user info
 * @param {User.model} user.body.required - the new user info
 * @returns {User.model} 200 - An object of user info
 * @returns {Error} 400 - Invalid updates
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({
            error: 'Invalid updates!'
        })
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})


/**
 * @route DELETE /users/me
 * @group Users - Operations about users
 * @description Deletes the user
 * @returns {User.model} 200 - An object of user info
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})


const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
        // cb(new Error('File must be a pdf'))
        // cb(undefined, true)

    }
})



/**
 * @route POST /users/me/avatar
 * @group Users - Operations about users
 * @description Uploads the user avatar
 * @param {file} avatar.formData.required - User avatar
 * @returns {object} 200 - Success message
 * @returns {Error} 400 - Bad request
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
})


/**
 * @route DELETE /users/me/avatar
 * @group Users - Operations about users
 * @description Deletes the user avatar
 * @returns {object} 200 - Success message
 * @returns {Error}  default - Unexpected error
 * @security JWT
 */
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

/**
 * @route GET /users/{id}/avatar
 * @group Users - Operations about users
 * @description Gets the user avatar
 * @param {string} id.path.required - id of the User to get the avatar
 * @returns {file} 200 - An image file
 * @returns {Error} 404 - Not found
 * @returns {Error}  default - Unexpected error
 */
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router