const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

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

let people = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122"
  }
]

app.get('/info', (request, response) => {
  const txt = `
    <p>Phonebook has ${people.length} names</p>
    <p>${Date()}</p>
  `
  response.send(txt)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = people.find(p => p.id === id)

  if (!person)
    return response.status(404).end()

  response.json(person)
})

app.get('/api/persons', (request, response) => {
  response.json(people)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const removed_lad = people.find(p => p.id === id)
  people = people.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
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

  if (people.map(p => p.name).includes(body.name)) {
    return response.status(400).json({
      error: "name must be unique"
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: Math.floor(Math.random() * 26042024)
  }

  people = people.concat(person)

  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})