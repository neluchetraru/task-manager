# Task manager API using NodeJS
Provides a REST API for managing tasks created by users. Users must be registered to create tasks.

## API Docs




See full docs here


### Plugins
- express
- mongoose
- jsonwebtoken
- bcryptjs
- mongoose
- validator
- multer

### Environment
Set up an environment in config/dev.env
```bash
PORT=3000
MONGODB_URL=YOUR_MONGODB_URL
JWT_SECRET=YOUR_SECRET
```

### How to run in dev mode
```bash
git clone https://github.com/neluchetraru/task-manager.git && cd task-manager
npm install
npm run dev
```

### Open documentation
Now that the server is running, open http://localhost:3000/api-docs to see the swagger API docs