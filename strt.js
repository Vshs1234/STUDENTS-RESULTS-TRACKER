const express=require("express");
const bodyParser=require("body-parser");
const mysql=require("mysql2");

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));


//connectingggg 


var con=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:".........",
    database:"marksdb"
});


con.connect(function(err){
    if(err){
        console.log(err);
    }
    else{
        console.log("successfully connected to marks database");


        // con.query("CREATE DATABASE marksdb",function(err){
        //     if(err)console.log(err);
        //     else console.log("created database successfully");
        // })

        // var qry="CREATE TABLE students_details (stuid INT PRIMARY KEY,dept varchar(255),stuname varchar(255));"
        // con.query(qry,function(err){
        //     if(err)console.log(err);
        //     else console.log("created table");
        // })




        // var qry="CREATE TABLE marks_details (stuid INT,marks varchar(255),FOREIGN KEY (stuid) REFERENCES students_details(stuid));"
        // con.query(qry,function(err){
        //     if(err)console.log(err);
        //     else console.log("created table");
        // })


    }

})




app.get("/",function(req,res){
    res.sendFile(__dirname+"/public/index.html");
})

app.get("/tops",function(req,res){
    var qry="WITH DeptAvg AS (SELECT s.dept, s.stuid, s.stuname AS name, AVG(m.marks) AS avg, RANK() OVER (PARTITION BY s.dept ORDER BY AVG(m.marks) DESC) AS rnk FROM students_details s JOIN marks_details m ON s.stuid = m.stuid GROUP BY s.dept, s.stuid, s.stuname) SELECT dept, stuid, name, avg FROM DeptAvg WHERE rnk = 1 ORDER BY stuid,dept, avg DESC;";
    con.query(qry,function(err,result){
        if(err)console.log(err);
        else{
            // var name=result[0].name;
            // var dept=result[0].dept;
            // var avg=result[0].avg;

            res.render('top',{
                result:result
            });
        }
    })
})

app.get("/add",function(req,res){
    res.sendFile(__dirname+"/public/login.html");
})

app.post('/add',function(req,res){
    var fname=req.body.fname;
    var lname=req.body.lname;
    var dept=req.body.dept;
    var idno=req.body.idno;
    var marks=req.body.marks;
    var fullname=fname+" "+lname;
    var marksarr=marks.split(",");

    //inserting into students_details
    var qry1="INSERT INTO students_details VALUES ('"+idno+"','"+dept+"','"+fullname+"');"
    con.query(qry1,function(err){
        if(err)console.log(err);
        else console.log("1 row inserted");
    })
    //inserting into marks_details
    for(var m in marksarr){
        var qry2="INSERT INTO marks_details VALUES ('"+idno+"','"+marksarr[m]+"');";

        con.query(qry2,function(err){
            if(err)console.log(err);
            else console.log("1 row inserted");
        })
    }

    res.redirect('/success.html');
})

app.get('/failed',function(req,res){
    var qry="SELECT s.stuid,dept,stuname as name FROM students_details s  JOIN marks_details m ON s.stuid=m.stuid where m.marks<40 GROUP BY dept,stuname,s.stuid ORDER BY dept;";
    con.query(qry,function(err,result){
        if(err)console.log(err);
        else{
            res.render('fail',{
                result:result
            })
        }
    })
})

app.get('/all',function(req,res){
    var qry="select s.stuid,s.stuname,s.dept,AVG(m.marks) as a from students_details s JOIN marks_details m ON s.stuid=m.stuid GROUP BY s.dept,s.stuid,s.stuname HAVING a>=40";
    con.query(qry,function(err,result){
        if(err) console.log(err);
        else{
            res.render('all',{
                result:result
            })
        }
    })
})

app.get('/dev',function(req,res){
    res.redirect('/dev.html');
})

app.listen( process.env.PORT || 3000,function(){
    console.log("successfully running on port 3000");
})
