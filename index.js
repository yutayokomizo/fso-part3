require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

const app = express();

morgan.token('body', (req, res) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body'),
);

app.use(express.json());
app.use(cors());
app.use(express.static('build'));

const persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get('/info', (request, response) => {
  const entries = persons.length;
  const now = new Date().toString();

  const output = `
  <p>Phonebook has info for ${entries} people</p>
  <p>${now}</p>
  `;

  response.send(output);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const personFound = persons.find((person) => person.id === id);

  if (personFound) {
    return response.json(personFound);
  }

  return response.status(404).end();
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/persons', (request, response, next) => {
  const { body } = request;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  Person.find({ name: body.name })
    .then((matchedPerson) => {
      if (matchedPerson.length > 0) {
        // Person exists
        return response.status(400).json({
          error: 'name already exists',
        });
      }
      // Person doesn't exist
      const person = new Person({
        name: body.name,
        number: body.number,
      });

      person
        .save()
        .then((savedPerson) => response.json(savedPerson))
        .catch((error) => next(error));
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;

  if (!body.name) {
    return response.status(400).json({
      error: 'name missing',
    });
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing',
    });
  }

  const newData = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, newData, { new: true })
    .then((savedPerson) => {
      if (!savedPerson) {
        return response.status(404).end();
      }

      return response.json(savedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
