const app = require('./app')
const expressSwagger = require('express-swagger-generator')(app);
// const swagger = require('./swagger')
let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        basePath: '/v1',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: [`${__dirname}/routers/*.js`] //Path to the API handle folder
};

console.log(options)

expressSwagger(options)

const port = process.env.PORT

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

