const client = require('../lib/client');
// import our seed data:
const usersData = require('./users.js');
const todos = require('./todo123.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      todos.map(item => {
        return client.query(`
                    INSERT INTO todos (todo, completed, user_id)
                    VALUES ($1, $2, $3);
                `,
        [item.todo, item.completed, user.id]);
      })
    );


    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
