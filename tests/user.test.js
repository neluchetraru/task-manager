const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@example.com',
    password: '123456what',
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach(async() => {
    await User.deleteMany()
    await new User(userOne).save()
})


test("Should signup a new user", async () =>{
    await request(app)
    .post('/users').send({
        name: 'Ion',
        email: 'neluchetraru@gmail.com',
        password: 'MyPass1234'
    }).expect(201)
})