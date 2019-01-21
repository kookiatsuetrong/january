var express    = require('express')  // เรียกใช้ express
var server     = express() // สร้าง object ของ express
server.listen(2000)
var ejs        = require('ejs')
var body       = require('body-parser') // เรียกใช้ body-parser
var readBody   = body()  // สร้าง object ของ body-parser
var mysql      = require('mysql')
var source     = { host: '35.189.167.56', user: 'james', password: 'bond', 
                   database:'web'}
var pool       = mysql.createPool(source) // source คือ แหล่งข้อมูล
var valid      = [ ]
var cookie     = require('cookie-parser')
var readCookie = cookie()
var multer     = require('multer')
var uploadFile = multer({dest: 'photo'})
var fs         = require('fs')
server.engine('html', ejs.renderFile)
server.post('/change-photo', readCookie, uploadFile.single('photo'), 
                                changePhoto)
function changePhoto(req, res) {
    var card = req.cookies.card
    if (valid[card]) {
        fs.rename(  'photo/' + req.file.filename, 
                    'photo/member-' + valid[card].id + '.jpg',
                    function() {} )
    }
    res.redirect('/profile')
}

server.get('/profile', readCookie, showProfilePage)
function showProfilePage(req, res) {
    var card = req.cookies.card
    if (valid[card]) {
        res.render('profile.html', {member: valid[card]})
    } else {
        res.redirect('/login')
    }
}

server.get('/login', showLogInPage)
server.post('/login', readBody, checkPassword)
function showLogInPage(req, res) {
    res.render('login.html')
}

function checkPassword(req, res) {
    var sql = 'select * from member where email=? and password=sha2(?,512)'
    var data = [req.body.email, req.body.password] // สร้าง array
    pool.query(sql, data, function(error, data) {
        if (data.length == 1) {
            var card = parseInt(Math.random() * 1000000)
            valid[card] = data[0] // เอาข้อมูลผู้ใช้คนนี้ใส่ valid เก็บไว้
            res.header('Set-Cookie', 'card=' + card + ';max-age=' + 60*5)
            res.redirect('/profile')
        }
        if (data.length != 1) { 
            res.redirect('/login?message=Fail') 
        }
    })
}
// npm install express ejs mysql body-parser cookie-parser
// Cookie คือ ข้อมูลขนาดเล็ก ไม่เกิน 4 พันตัวอักษร
// Cookie ถูกสร้างจาก Server ส่งไปที่ Client
// และ Client จะส่งกลับมาทุกครั้ง
// https://github.com/kookiatsuetrong/january
server.get('/register', showRegisterPage)
server.post('/register', readBody, registerMember)
function showRegisterPage(req, res) {
    res.render('register.html')
}
function registerMember(req, res) {
    res.send( req.body )  // read หรือ readBody อ่านข้อมูลเก็บไว้ที่ req.body
}
// express จะเก็บข้อมูลจาก form ไว้ที่ req.query.xxxx
// แต่สำหรับข้อมูลสำคัญที่ส่งผ่านการ post จะไม่ถูกดึงขึ้นมา
// npm install express ejs body-parser

var area = ['Talingchan', 'Bang Plad',
    'Bang Yai', 'Patum Thani', 'Bangkok Noi']
server.get('/search', showSearch)
function showSearch(req, res) {
    var r = 'Your city is not available'
    if (req.query.city == null) {
        r = ''
    }
    if (req.query.city != null) {
        for (var i in area) {
            if (area[i] == req.query.city) {
                r = 'Your city is available'
            }
        }
    }
    res.render('search.html', {result: r})
}

server.get('/car', showCar)
function showCar(req, res) {
    var t = 0
    if (req.query.engine == 'Diesel')
        t = 0.85 * req.query.cc
    if (req.query.engine == 'Benzene')
        t = 1.05 * req.query.cc
    res.render('car.html', {tax: t})
}


server.get('/', showHome)
server.get(['/total', '/cashier'], showTotal)
function showHome(req, res) {
    res.render('index.html', {shop: 'iCoffee'})
}
function showTotal(req, res) {
    var r = 0
    if (req.query.price != null)
        r = req.query.price * 1.08
    res.render('total.html', {result: r})
}  // <select name='engine'>...</select>
// http://localhost:2000/cashier?price=150
// express ได้เก็บค่า 150 ไว้ทีตัวแปร req.query.price