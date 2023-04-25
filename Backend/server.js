const express = require('express')
const cors = require('cors')

const usersRouter = require('./routes/users')
const daysRouter = require('./routes/days')
const sleepsRouter = require('./routes/sleeps')
const activitiesRouter = require('./routes/activities')
const mealsRouter = require('./routes/meals')
const { NotFoundError } = require('./expressError')

// App
const app = express()

const swagger = require('./swagger')
swagger(app)

// middleware
app.use(express.json())
app.use(cors())

// routes
app.use('/users', usersRouter)
app.use('/days', daysRouter)
app.use('/sleeps', sleepsRouter)
app.use('/activities', activitiesRouter)
app.use('/meals', mealsRouter)

app.get('/', function (req, res) {
  res.send('Hello World!')
})

// 404 error handler
app.use((req, res, next) => {
  return next(new NotFoundError())
})

// error handler
app.use((err, req, res, next) => {
  console.log(err)

  // Any ExpressError will pass along its own error status
  const status = err.status_code || 500
  const message = err.message

  return res.status(status).json({
    error: { message, status },
  })
})

// const port = 3000
// app.listen(port, () => console.log(`App listening on port ${port}!`))

// Use PORT provided in environment or default to 3000
var port = process.env.PORT || 3000

// Listen on `port` and 0.0.0.0
app.listen(port, '0.0.0.0',  () => console.log(`App listening on port ${port}!`))
