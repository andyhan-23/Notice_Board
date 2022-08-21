const express = require('express')
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({extended: true}));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
require('dotenv').config()

var db;


function 로그인유무(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.redirect('/login');
    }
}


MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function(에러, client){

    if(에러) return console.log(에러)

    db = client.db('blog');
    
    app.listen(process.env.PORT, function() {
        console.log('listening on 8080')
    });


});

const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 


app.get('/', function(req, res) {
    res.render('main.ejs');
})


app.get('/login', function(req, res){
    res.render('login.ejs');
})

app.get('/register', function(req, res) {
    res.render('register.ejs');
})

app.get('/write', 로그인유무, function(req, res){ 
    res.render('write.ejs');
})

app.get('/fail', function(req, res) {
    res.send('<script type="text/javascript">alert("이메일 혹은 비밀번호가 올바르지 않습니다.");window.location = document.referrer;</script>') 
})

app.post('/register', function(req, res){ 
    
    db.collection('login').findOne({email : req.body.email} , function(에러, 결과) {
        if(결과 != null) {
            if(req.body.email == 결과.email)
                res.json('중복된이메일');
            }else {
                db.collection('login').insertOne({ nickname : req.body.nickname, email : req.body.email, password : req.body.password, gender : req.body.gender, recommendation : req.body.recommendation}, function(에러, 결과){
                    console.log('저장')
                    res.redirect('/login');
                }) 
            }
        })
    })

    app.post('/checkName', function(req, res) {
        db.collection('login').findOne({nickname : req.body.checkNickname}, function(에러, 결과){
            if(결과 != null) {
                res.json('사용불가능');
            } else {
                res.json('사용가능');
            }
        })
    })

app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(req, res) {
    res.redirect('/');
});


app.post('/add', function(req, res) {
    
    var 이동할곳 = req.body.category;

    db.collection('counter').findOne({name : '게시물갯수'}, function(에러, 결과){
        console.log(결과.totalPost);
        var 총게시물갯수 = 결과.totalPost;
    
    db.collection('post').insertOne({_id : 총게시물갯수 + 1, nickname : req.user.nickname, title : req.body.title, contents : req.body.contents, category : req.body.category, date : new Date()}, function(에러, 결과) {
        console.log('글 저장 완료')

        db.collection('counter').updateOne({name : '게시물갯수'}, {$inc : {totalPost : 1}}, function(에러, 결과) {
            if(에러) {return console.log(에러)}
        })
        res.redirect('/' + 이동할곳);
    })

});
});

app.get('/mypage',로그인유무, function(req, res) {
    db.collection('post').find({nickname : req.user.nickname}).toArray(function(에러, 결과) {
    res.render('mypage.ejs', {posts : 결과})
    })
})

app.get('/sports', function(req, res) {
    db.collection('post').find({category : 'sports'}).toArray(function(에러, 결과){
        res.render('sports.ejs', {posts : 결과})
    })
})

app.get('/music', function(req, res) {
    db.collection('post').find({category : 'music'}).toArray(function(에러, 결과){
        res.render('music.ejs', {posts : 결과})
    })
})

app.get('/incident', function(req, res) {
    db.collection('post').find({category : 'incident'}).toArray(function(에러, 결과){
        res.render('incident.ejs', {posts : 결과})
    })
})

app.get('/list', function(req, res) {
    db.collection('post').find({category : 'incident'}).toArray(function(에러, 결과){
        res.render('list.ejs', {posts : 결과})
    })
})



app.get('/others', function(req, res) {
    db.collection('post').find({category : 'others'}).toArray(function(에러, 결과){
        res.render('others.ejs', {posts : 결과})
    })
})

app.get('/detail:id', function(req, res) {
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(에러, 결과) {
        res.render('detail.ejs', {data : 결과})
    })
})





passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    session: true, //로그인 후 세션을 저장할 것인지
    passReqToCallback: false, //아이디/비번 말고도 다른 정보 검증시
  }, function (입력한이메일, 입력한비밀번호, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ email : 입력한이메일 }, function (에러, 결과) {
      if (에러) return done(에러)
  
      if (!결과) return done(null, false, { message: '존재하지않는 이메일입니다.' })
      if (입력한비밀번호 == 결과.password) { //이 방식은 보안이 안좋음, 암호화 해서 비교해야함 
        return done(null, 결과) //done()은 3개의 파라미터를 가질 수 있다 서버에러, 성공시 사용자 DB데이터(틀리면 false), 에러메시지 
      } else {
        return done(null, false, { message: '비밀번호가 틀렸습니다.' })
      }
    })
  }));

  //세션 만들기, 아이디, 비번이 맞으면 세션을 하나 만들어주고 마이페이지 방문 시 세션을 검사
passport.serializeUser(function(user, done) { //세션을 저장시키는 코드(로그인 성공 시 발동), 아이디, 비번 맞았을 때의 결과가 user로 전송됨
    done(null, user.email) //세션 데이터를 만들고 세션의 id 정보를 쿠키로 보냄
});

//이 세션 데이터를 가진 사람을 DB에서 찾아주세요(마이페이지 접속 시 발동)
passport.deserializeUser(function(이메일, done){ //아이디 == user.id
    db.collection('login').findOne({email : 이메일}, function(에러, 결과) {
        done(null, 결과) //결과 => id : test, 비번 : test
    })
});





app.use(express.static('views'));









