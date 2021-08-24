const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
// const todos = require('..data/todos');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/todos', async(req, res) => {
  try {
    const data = await client.query('SELECT * from todos');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});



app.post('/api/todos', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT into todos (todo, completed, user_id)
    VALUES ($1, $2, $3)
    RETURNING *`
    , [req.body.todo, req.body.completed, req.userId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/todos/:id', async(req, res) => {
  try {

    const data = await client.query(`
    UPDATE todos 
    SET 
    todo=$2,
    completed=$3,
    user_id=$4
    WHERE id = $1
    RETURNING *`
    , [req.params.id, req.body.todo, req.body.completed, req.userId]);
    
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});
app.use(require('./middleware/error'));

module.exports = app;
