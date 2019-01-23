var express    = require('express')  // เรียกใช้ express
var server     = express() // สร้าง object ของ express
server.listen(2000)
var ejs        = require('ejs')
var body       = require('body-parser') // เรียกใช้ body-parser
var readBody   = body.urlencoded({extended:false})  // สร้าง object ของ body-parser
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
var sharp      = require('sharp')
sharp.cache(false)

server.engine('html', ejs.renderFile)

server.get (['/register','/join'],  showRegisterPage)
server.post(['/register', '/join'], readBody, 
                                    registerMember)
server.get('/login',                showLogInPage)
server.post('/login',               readBody, 
                                    checkPassword)
server.get('/profile',              readCookie, 
                                    showProfilePage)
server.post('/change-photo',        readCookie, 
                                    uploadFile.single('photo'), 
                                    changePhoto)
server.post('/save-info',           readCookie, 
                                    readBody,
                                    saveInfo)
server.get('/logout',               readCookie, 
                                    showLogOutPage)

// ถ้าหา path ข้างบนนี้ไม่เจอ ให้ไปดูที่ folder ชื่อ photo
server.use( express.static('photo') )   // ทุก path
server.get( '/*.jpg', showDefaultPhoto) // เฉพาะ file ที่ลงท้ายด้วย .jpg
server.use( showError ) // ทุก path

function showLogOutPage(req, res) {
    var card = req.cookies.card
    delete valid[card]
    res.render('logout.html')
}

function saveInfo(req, res) {
    var card = req.cookies.card
    if (valid[card]) {
        var sql = 'update member set account=?, ' +
            ' first_name=?, family_name=?, dob=?, ' +
            ' gender=? ' +
            ' where id=? '
        if (req.body.account == '') { req.body.account = null }
        if (req.body.dob     == '') { req.body.dob     = null }
        var data = [req.body.account, 
                    req.body['first-name'],
                    req.body['family-name'],
                    req.body.dob,
                    req.body.gender,
                    valid[card].id ]
        pool.query(sql, data, function(e, r) {
            if (e == null) {
                valid[card].account     = req.body.account
                valid[card].first_name  = req.body['first-name']
                valid[card].family_name = req.body['family-name']
                valid[card].dob         = req.body.dob
                valid[card].gender      = req.body.gender
            }
            res.redirect('/profile')
        })
    } else {
        res.redirect('/login')
    }
}

function showError(req, res) {
    res.render('error.html')
}

function showDefaultPhoto(req, res) {
    res.redirect('/default.jpg')
}

function changePhoto(req, res) {
    var card = req.cookies.card
    if (valid[card]) {
        var old  = 'photo/' + req.file.filename
        var next = 'photo/member-' + valid[card].id + '.jpg'
        fs.rename(old, next, function() {
            sharp(next).resize({width:200,height:200})
            .toBuffer().then( function(data) {
                fs.writeFile(next, data, function() {
                    res.redirect('/profile') 
                })
            })
        })
    } else {
        res.redirect('/profile')
    }
}

function showProfilePage(req, res) {
    var card = req.cookies.card
    if (valid[card]) {
        res.render('profile.html', {member: valid[card]})
    } else {
        res.redirect('/login')
    }
}
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

function showRegisterPage(req, res) {
    res.render('register.html')
}

function registerMember(req, res) {
    res.send( req.body )  // readBody อ่านข้อมูลเก็บไว้ที่ req.body
}
