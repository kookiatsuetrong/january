var mysql = require('mysql')
var server = {
    host: '35.189.167.56',
    user: 'james',
    password: 'bond',
    database: 'web'
}
var pool = mysql.createPool(server)
pool.query('select * from member', function (error, data) {
    console.log(data)
})

// npm install mysql
// node test.js