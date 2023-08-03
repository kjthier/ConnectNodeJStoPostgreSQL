const express = require('express');
const { check, validationResult } = require('express-validator');
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

    // get all users
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

    // get all orders
    app.get('/orders', (req, res) => {
      client.query('SELECT * FROM orders', (error, result) => {
        if (error) {
          console.error('Error fetching orders:', error);
          res.status(500).send('Error fetching orders');
        } else {
          res.status(200).send(result.rows);
        }
      });
    });

    // get one order (with the id)
    app.get('/orders/:id', (req, res) => {
      client.query('SELECT * FROM orders WHERE id = $1', [req.params.id], (error, result) => {
        if (error) {
          console.error('Error fetching order:', error);
          res.status(500).send('Error fetching order');
        } else {
          res.status(200).send(result.rows);
        }
      });
    });

    // create a new order, with validation
    app.post('/orders', [
      check('price').notEmpty().isFloat(),
      check('user_id').notEmpty().isInt(),
    ], (req, res) => {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      // if no validation errors, proceed with db query
      const currentDate = new Date(); // get the current date/time
      client.query('INSERT INTO orders (price, date, user_id) VALUES ($1, $2, $3)', [req.body.price, currentDate, req.body.user_id], (error, result) => {
        if (error) {
          console.error('Error creating order:', error);
          return res.status(500).send('Error creating order');
        } else {
          return res.status(201).send('Order added successfully!');
        }
      });
    });

    // edit one order, with validation
    app.put('/orders/:id', [
      check('price').notEmpty().isFloat(),
      check('date').notEmpty().isDate(),
      check('amount').notEmpty().isInt(),
    ], (req, res) => {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }           
      // if no validation errors, proceed with db query
      client.query('UPDATE orders SET price = $1, date = $2, user_id = $3 WHERE id = $4', [req.body.price, req.body.date, req.body.user_id, req.params.id], (error, result) => {    
        if (error) {
          console.error('Error updating order:', error);
          res.status(500).send('Error updating order');
        } else {
          res.status(200).send('Order updated successfully!');
        }
      });
    });

    // delete one order
    app.delete('/orders/:id', (req, res) => {
      client.query('DELETE FROM orders WHERE id = $1', [req.params.id], (error, result) => {
        if (error) {
          console.error('Error deleting order:', error);
          res.status(500).send('Error deleting order');
        } else {
          res.status(200).send('Order deleted successfully!');
        }
      });
    });

    // get all orders from one user, with validation
    app.get('/:id/orders', [
      check('id').notEmpty().exists(),
    ], (req, res) => {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      // if no validation errors, proceed with db query
      client.query('SELECT * FROM orders WHERE user_id = $1', [req.params.id], (error, result) => {
        if (error) {
          console.error('Error fetching orders:', error);
          res.status(500).send('Error fetching orders');
        } else {
          res.status(200).send(result.rows);
        }
      });
    });

    // set user as inactive if they have no orders
    // app.put('/:id/inactive', (req, res) => {
    //   client.query('UPDATE users SET active = false WHERE id = $1', [req.params.id], (error, result) => {
    //     if (error) {
    //       console.error('Error updating user:', error);
    //       res.status(500).send('Error updating user');
    //     } else {
    //       res.status(200).send('User updated successfully!');
    //     }
    //   })
    // })

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

    // create a new user, with validation
    app.post('/', [
      check('first_name').notEmpty().isString(),
      check('last_name').notEmpty().isString(),
      check('age').notEmpty().isInt(),
    ], (req, res) => {      
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      // if no validation errors, proceed with db query
      client.query('INSERT INTO users (first_name, last_name, age) VALUES ($1, $2, $3)', [req.body.first_name, req.body.last_name, req.body.age], (error, result) => {
        if (error) {
          console.error('Error creating user:', error);
          res.status(500).send('Error creating user');
        } else {
          res.status(201).send('User added successfully!');
        }
      })
    })

    // edit one user, with validation
    app.put('/:id', [
      check('first_name').notEmpty().isString(),
      check('last_name').notEmpty().isString(),
      check('age').notEmpty().isInt(),
    ], (req, res) => {
      // check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      // if no validation errors, proceed with db query
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



