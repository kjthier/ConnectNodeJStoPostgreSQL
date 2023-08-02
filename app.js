const express = require('express');
const app = express();
const port = 3000;
const pg = require('pg');

// middleware to handle parsing the HTTP request body (from api client, ie insomnia))
app.use(express.json())


// setup db connection to elephantSQL
var conString = "postgres://gwwggekp:FthhupUhL8VRRBDypM05lF_tMuV4cBB5@snuffleupagus.db.elephantsql.com/gwwggekp"
var client = new pg.Client(conString);

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  } else {
    console.log('Connected to the database');

    // get all the users
    app.get('/', (req, res) => {
      client.query('SELECT * FROM users', (error, result) => {
        if (error) {
          console.error('Error fetching users:', error);
          res.status(500).send('Error fetching users');
        } else {
          res.status(200).send(result.rows);
        }
    })
    });

    // get one user (with the id)
    app.get('/:id', (req, res) => {
      client.query('SELECT * FROM users WHERE id = $1', [req.params.id], (error, result) => {
        if (error) {
          console.error('Error fetching user:', error);
          res.status(500).send('Error fetching user');
        } else {
          res.status(200).send(result.rows);
        }
      })
    })

    // create a new user
    app.post('/', (req, res) => {
      client.query('INSERT INTO users (first_name, last_name, age) VALUES ($1, $2, $3)', [req.body.first_name, req.body.last_name, req.body.age], (error, result) => {
        if (error) {
          console.error('Error creating user:', error);
          res.status(500).send('Error creating user');
        } else {
          res.status(201).send('User added successfully!');
        }
      })
    })

    // edit one user
    app.put('/:id', (req, res) => {
      client.query('UPDATE users SET first_name = $1, last_name = $2, age = $3 WHERE id = $4', [req.body.first_name, req.body.last_name, req.body.age, req.params.id], (error, result) => {
        if (error) {
          console.error('Error updating user:', error);
          res.status(500).send('Error updating user');
        } else {
          res.status(200).send('User updated successfully!');
        }
      })
    })

    // delete one user
    app.delete('/:id', (req, res) => {
      client.query('DELETE FROM users WHERE id = $1', [req.params.id], (error, result) => {
        if (error) {
          console.error('Error deleting user:', error);
          res.status(500).send('Error deleting user');
        } else {
          res.status(200).send('User deleted successfully!');
        }
      })
    })
//practice making requests
//cont with #6

  }
});



// start the server
app.listen(port, (error) => {
  if(!error) {
    console.log(`Server is running on port ${port}`);
  } else {
    console.log(error);
  }
});



