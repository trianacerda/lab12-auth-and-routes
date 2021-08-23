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

    test('GET/ returns todos list', async() => {

      const expectation = [
        {
          id: 1,
          todo: 'feed the animals',
          completed: false,
          user_id: 1
        },
        {
          id: 2,
          todo: 'take out the trash',
          completed: false,
          user_id: 1
        },
        {
          id: 3,
          todo: 'clean the litter box',
          completed: false,
          user_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('POST/ creates a new todo task to the list', async() => {

      const newTodo = 
        {
          id: 4,
          todo: 'look pretty',
          completed: false,
          user_id: 2
        }
      ;

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(newTodo);
    });
  });
});
