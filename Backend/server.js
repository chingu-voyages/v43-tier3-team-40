const express = require('express')

const usersRouter = require('./routes/users');
const { NotFoundError } = require('./expressError');

// App
const app = express();

// middleware
app.use(express.json());


// routes
app.use('/users', usersRouter);

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// 404 error handler
app.use((req, res, next) => {
  return next(new NotFoundError())
})


// error handler
app.use((err, req, res, next) => {

  console.log(err);
  
  // Any ExpressError will pass along its own error status
  const status = err.status_code || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status }
  });

})


const port = 3000
app.listen(port, () => console.log(`App listening on port ${port}!`))
