require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
   
    afterAll(done => {
      return client.end(done);
    });

    test('POST/ creates a new todo task to the list', async() => {

      const newTodo = 
        {
          todo: 'look pretty',
          completed: false,
        }
      ;

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body.todo).toEqual(newTodo.todo);
      expect(data.body.completed).toEqual(newTodo.completed);
    });

    test('GET/ returns todos list by id', async() => {

      const expectation = [
        {
          id: 4,
          todo: 'look pretty',
          completed: false,
          user_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('PUT/ updates todos/:id list task', async() => {

      const updatedTodo = 
        {
          id: 4,
          todo: 'look pretty',
          completed: true,
          user_id: 2
        }
      ;

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send(updatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body.completed).toEqual(updatedTodo.completed);
    });
  });
});
