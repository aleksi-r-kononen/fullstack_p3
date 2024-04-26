require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

morgan.token('cnt', function getCnt (req) {
  const body = req.body
  if (req.method === "POST")
    return JSON.stringify(body)

  return ""
})

app.use(express.static('dist'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :response-time :cnt'))


app.get('/info', (request, response) => {
  Person.find({}).then(ps => {
    const txt = `
      <p>Phonebook has ${ps.length} names</p>
      <p>${Date()}</p>
    `
    response.send(txt)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
  console.log("fetching people for /api/persons from mongoDB")
  Person.find({}).then(ps => {
    response.json(ps)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body) {
    return response.status(400).json({
      error: "content missing"
    })
  }

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing"
    })
  }

  /* Should ensure name is unique */

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  console.log(`adding ${body.name} to phonebook`)
  person.save()
    .then(savedPerson => {
      console.log(`addition of ${body.name} was successful`)
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidator: true, context: 'query' }
  )
    .then(updatedPerson => {
      console.log(`updating number of ${name} was successful`)
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') { 
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// tämä tulee kaikkien muiden middlewarejen ja routejen rekisteröinnin jälkeen!
app.use(errorHandler)



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})