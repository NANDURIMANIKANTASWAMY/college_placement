//Data base connnection
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
var serviceAccount = require("./hack_key.json");
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();
//for session storage
const sessionStorage = require('sessionstorage-for-nodejs');
//for alert
const notifier = require('node-notifier');
//for express
const express = require('express');
const app = express();
//for body-parser
const bp = require('body-parser');
app.use(bp.urlencoded({ extended: true }));
//for ejs
const ejs = require('ejs');
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
    res.render("home.ejs")
});
//for node_mailer
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vishnu.placements.test@gmail.com',
        pass: 'vkfk dbzk gbgo jenm'
    }
});
//server start
app.post('/login', (req, res) => {
    const u_id = req.body.u_id;
    const pwd = req.body.pwd;
    const usr = req.body.user;
    console.log(usr);
    if (usr == "student") {
        db.collection(usr).where('roll', '==', u_id).get().then((dbd) => {
            if (dbd.empty) {
                notifier.notify({
                    title: 'Placements Portal',
                    message: "Your details are not found please contact admin",
                    sound: true,
                    wait: true
                });
                res.render('home.ejs')
            }
            else {
                dbd.forEach((doc) => {

                    if (doc.data().pwd == pwd) {
                        sessionStorage.setItem('id', u_id);
                        sessionStorage.setItem('person','student')
                        console.log(sessionStorage.getItem('id'));
                        let n1 = doc.data().name;
                        let n2 = doc.data().notifications.length;
                        let data1 = {
                            name: n1,
                            count: n2
                        }
                        res.render('student_home.ejs', { data: data1 });
                    }
                    else {
                        notifier.notify({
                            title: 'Placements Portal',
                            message: "Incorrect password",
                            sound: true,
                            wait: true
                        });
                        res.render('home.ejs');
                    }
                });
            }
        })
    }
    else if (usr == "coordinator") {
        db.collection(usr).where('id', '==', u_id).get().then((dbd) => {
            if (dbd.empty) {
                notifier.notify({
                    title: 'Placements Portal',
                    message: "Your details are not found please contact admin",
                    sound: true,
                    wait: true
                });
                res.render('home.ejs')
            }
            else {
                dbd.forEach((doc) => {

                    if (doc.data().pwd == pwd) {
                        sessionStorage.setItem('id', u_id);
                        sessionStorage.setItem('person','coordinator')
                        console.log(sessionStorage.getItem('id'));
                        let n1 = doc.data().name;
                        let n2 = doc.data().notifications.length;
                        let data1 = {
                            name: n1,
                            count: n2
                        }
                        res.render('coordinator_home.ejs', { data: data1 });
                    }
                    else {
                        notifier.notify({
                            title: 'Placements Portal',
                            message: "Incorrect password",
                            sound: true,
                            wait: true
                        });
                        res.render('home.ejs');
                    }
                });
            }
        })
    }
    else {
        {
            db.collection(usr).where('id', '==', u_id).get().then((dbd) => {
                if (dbd.empty) {
                    notifier.notify({
                        title: 'Placements Portal',
                        message: "Your details are not found please contact admin",
                        sound: true,
                        wait: true
                    });
                    res.render('home.ejs')
                }
                else {
                    dbd.forEach((doc) => {

                        if (doc.data().pwd == pwd) {
                            sessionStorage.setItem('id', u_id);
                            sessionStorage.setItem('person','admin')
                            console.log(sessionStorage.getItem('id'));
                            let n1 = doc.data().name;
                            let data1 = {
                                name: n1,
                            }
                            res.render('admin_home.ejs', { data: data1 });
                        }
                        else {
                            notifier.notify({
                                title: 'Placements Portal',
                                message: "Incorrect password",
                                sound: true,
                                wait: true
                            });
                            res.render('home.ejs');
                        }
                    });
                }
            })
        }
    }
});
app.get('/std_details', (req, res) => {
    const id1 = sessionStorage.getItem('id');
    console.log(id1);
    db.collection('student').where('roll', '==', id1).get().then((dbd) => {
        dbd.forEach((doc) => {
            let data1 = {
                roll: doc.data().roll,
                name: doc.data().name,
                count: doc.data().notifications.length,
                dept: doc.data().dept,
                dob: doc.data().dob,
                gen: doc.data().gender,
                mail: doc.data().mail,
                phn: doc.data().phn,
                add: doc.data().address.dr_n0 + " , " + doc.data().address.street + " , " + doc.data().address.place + " , " + "pin:" + doc.data().address.pincode
            }
            console.log(data1)
            res.render("std_details.ejs", { data: data1 });
        })

    })
});
app.get("/pla_history", (req, res) => {
    var id1 = sessionStorage.getItem('id');
    console.log(id1);
    let data1 = {
        name: "",
        count: "",
        history: {},
    }
    db.collection('student').where('roll', '==', id1).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            data1.count = doc.data().notifications.length;
            db.collection('placements').where('id', '==', id1).get().then((dbd) => {
                let i = 1
                dbd.forEach((doc1) => {
                    let x = {
                        date: doc1.data().date,
                        company: doc1.data().company,
                        status: doc1.data().status,
                        salary: doc1.data().package
                    }
                    data1.history[i] = x;
                    data1.n = i
                    i = i + 1
                })
                console.log(data1)
                res.render('placement_history.ejs', { data: data1 });
            })
        })
    });



})
app.get('/dept_data', (req, res) => {
    var id1 = sessionStorage.getItem('id');
    console.log(id1);
    let data1 = {
        name: "",
        count: "",
        place: [],
    }
    db.collection('coordinator').where('id', '==', id1).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            data1.count = doc.data().notifications.length;
            db.collection('placements').where('dept', '==', doc.data().dept_id).get().then((dbd) => {
                let i = 0
                dbd.forEach((doc1) => {
                    let x = {
                        id: doc1.data().id,
                        passout: doc1.data().passout,
                        date: doc1.data().date,
                        company: doc1.data().company,
                        status: doc1.data().status,
                        salary: doc1.data().package
                    }
                    data1.place.push(x);
                    data1.n = i
                    i = i + 1
                })
                console.log(data1)
                res.render('depart.ejs', { data: data1 });
            })
        })
    });
})
app.get('/c_filter', (req, res) => {
    var id1 = sessionStorage.getItem('id');
    console.log(id1);
    let data1 = {
        name: "",
        count: "",
        place: [],
    }
    db.collection('coordinator').where('id', '==', id1).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            data1.count = doc.data().notifications.length;
            db.collection('placements').where('dept', '==', doc.data().dept_id).get().then((dbd) => {
                let i = 0
                dbd.forEach((doc1) => {
                    let x = {
                        id: doc1.data().id,
                        passout: doc1.data().passout,
                        date: doc1.data().date,
                        company: doc1.data().company,
                        status: doc1.data().status,
                        salary: doc1.data().package
                    }
                    data1.place.push(x);
                    data1.n = i
                    i = i + 1
                })
                console.log(data1)
                res.render('c_filter.ejs', { data: data1 });
            })
        })
    });
})
app.post('/filter', (req, res) => {
    let option = req.body.opt;
    let yr = req.body.req_year;
    let pkg = parseInt(req.body.base_package);
    let data1 = {
        name: "",
        count: "",
        place: [],
    };
    let u_id = sessionStorage.getItem('id');
    db.collection("coordinator").where('id', '==', u_id).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            data1.count = doc.data().notifications.length;
            if (option == "both") {
                db.collection('placements').where('dept', '==', doc.data().dept_id).where('passout', '==', yr).get().then((dbd1) => {
                    let i = 0;
                    dbd1.forEach((doc1) => {
                        if (parseInt(doc1.data().package) >= pkg) {
                            let x = {
                                id: doc1.data().id,
                                passout: doc1.data().passout,
                                date: doc1.data().date,
                                company: doc1.data().company,
                                status: doc1.data().status,
                                salary: doc1.data().package
                            }
                            data1.place.push(x);
                            data1.n = i
                            i = i + 1
                        }
                    })
                    console.log(data1)
                    res.render('c_filter.ejs', { data: data1 });
                })
            }
            else if (option == "year") {
                db.collection('placements').where('dept', '==', doc.data().dept_id).where('passout', '==', yr).get().then((dbd1) => {
                    let i = 0;
                    dbd1.forEach((doc1) => {
                        let x = {
                            id: doc1.data().id,
                            passout: doc1.data().passout,
                            date: doc1.data().date,
                            company: doc1.data().company,
                            status: doc1.data().status,
                            salary: doc1.data().package
                        }
                        data1.place.push(x);
                        data1.n = i
                        i = i + 1
                    })
                    console.log(data1)
                    res.render('c_filter.ejs', { data: data1 });
                })
            }
            else if (option == "package") {
                db.collection('placements').where('dept', '==', doc.data().dept_id).get().then((dbd1) => {
                    let i = 0;
                    dbd1.forEach((doc1) => {
                        if (parseInt(doc1.data().package) >= pkg) {
                            let x = {
                                id: doc1.data().id,
                                passout: doc1.data().passout,
                                date: doc1.data().date,
                                company: doc1.data().company,
                                status: doc1.data().status,
                                salary: doc1.data().package
                            }
                            data1.place.push(x);
                            data1.n = i
                            i = i + 1
                        }
                    })
                    console.log(data1)
                    res.render('c_filter.ejs', { data: data1 });
                })
            }
            else {
                db.collection('placements').where('dept', '==', doc.data().dept_id).get().then((dbd) => {
                    let i = 0
                    dbd.forEach((doc1) => {
                        let x = {
                            id: doc1.data().id,
                            passout: doc1.data().passout,
                            date: doc1.data().date,
                            company: doc1.data().company,
                            status: doc1.data().status,
                            salary: doc1.data().package
                        }
                        data1.place.push(x);
                        data1.n = i
                        i = i + 1
                    })
                    console.log(data1)
                    res.render('c_filter.ejs', { data: data1 });
                })
            }
        })
    })
})
app.get('/pla_data', (req, res) => {
    var id1 = sessionStorage.getItem('id');
    console.log(id1);
    let data1 = {
        name: "",
        place: [],
    }
    db.collection('admin').where('id', '==', id1).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            db.collection('placements').get().then((dbd1) => {
                let i = 0
                dbd1.forEach((doc1) => {
                    let x = {
                        id: doc1.data().id,
                        dept: doc1.data().dept,
                        passout: doc1.data().passout,
                        date: doc1.data().date,
                        company: doc1.data().company,
                        status: doc1.data().status,
                        salary: doc1.data().package
                    }
                    data1.place.push(x);
                    data1.n = i
                    i = i + 1
                })
                console.log(data1)
                res.render('a_placedata.ejs', { data: data1 });
            })
        })
    });
});
app.get('/a_filters', (req, res) => {
    var id1 = sessionStorage.getItem('id');
    console.log(id1);
    let data1 = {
        name: "",
        place: [],
    }
    db.collection('admin').where('id', '==', id1).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            db.collection('placements').get().then((dbd1) => {
                let i = 0
                dbd1.forEach((doc1) => {
                    let x = {
                        id: doc1.data().id,
                        dept: doc1.data().dept,
                        passout: doc1.data().passout,
                        date: doc1.data().date,
                        company: doc1.data().company,
                        status: doc1.data().status,
                        salary: doc1.data().package
                    }
                    data1.place.push(x);
                    data1.n = i
                    i = i + 1
                })
                console.log(data1)
                res.render('a_filter.ejs', { data: data1 });
            })
        })
    });
})
app.post('/admin_filter', (req, res) => {
    let option = req.body.opt;
    let yr = req.body.req_year;
    let dep = req.body.dept;
    let data1 = {
        name: "",
        count: "",
        place: [],
    };
    let u_id = sessionStorage.getItem('id');
    db.collection("admin").where('id', '==', u_id).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
            if (option == "both") {
                db.collection('placements').where('dept', '==', dep).where('passout', '==', yr).get().then((dbd1) => {
                    let i = 0;
                    dbd1.forEach((doc1) => {
                        if (parseInt(doc1.data().package) >= pkg) {
                            let x = {
                                id: doc1.data().id,
                                dept: doc1.data().dept,
                                passout: doc1.data().passout,
                                date: doc1.data().date,
                                company: doc1.data().company,
                                status: doc1.data().status,
                                salary: doc1.data().package
                            }
                            data1.place.push(x);
                            data1.n = i
                            i = i + 1
                        }
                    })
                    console.log(data1)
                    res.render('a_filter.ejs', { data: data1 });
                })
            }
            else if (option == "year") {
                db.collection('placements').where('passout', '==', yr).get().then((dbd1) => {
                    let i = 0;
                    dbd1.forEach((doc1) => {
                        let x = {
                            id: doc1.data().id,
                            passout: doc1.data().passout,
                            dept: doc1.data().dept,
                            date: doc1.data().date,
                            company: doc1.data().company,
                            status: doc1.data().status,
                            salary: doc1.data().package
                        }
                        data1.place.push(x);
                        data1.n = i
                        i = i + 1
                    })
                    console.log(data1)
                    res.render('a_filter.ejs', { data: data1 });
                })
            }
            else if (option == "department") {
                db.collection('placements').where('dept', '==', dep).get().then((dbd1) => {
                    let i = 0;
                    dbd1.forEach((doc1) => {

                        let x = {
                            id: doc1.data().id,
                            passout: doc1.data().passout,
                            dept: doc1.data().dept,
                            date: doc1.data().date,
                            company: doc1.data().company,
                            status: doc1.data().status,
                            salary: doc1.data().package
                        }
                        data1.place.push(x);
                        data1.n = i
                        i = i + 1

                    })
                    console.log(data1)
                    res.render('a_filter.ejs', { data: data1 });
                })
            }
            else {
                db.collection('placements').get().then((dbd1) => {
                    let i = 0
                    dbd1.forEach((doc1) => {
                        let x = {
                            id: doc1.data().id,
                            passout: doc1.data().passout,
                            dept: doc1.data().dept,
                            date: doc1.data().date,
                            company: doc1.data().company,
                            status: doc1.data().status,
                            salary: doc1.data().package
                        }
                        data1.place.push(x);
                        data1.n = i
                        i = i + 1
                    })
                    console.log(data1)
                    res.render('a_filter.ejs', { data: data1 });
                })
            }
        })
    })
})
app.get('/upload', (req, res) => {
    let data1 = {
        name: ''
    }
    let id = sessionStorage.getItem('id');
    db.collection('admin').where('id', '==', id).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
        })
        res.render('upload.ejs', { data: data1 });
    })
});
app.post('/upload_res', (req, res) => {
    let x = {
        id: req.body.roll,
        dept: req.body.dept,
        company: req.body.company,
        package: req.body.salary,
        date: req.body.date,
        passout: req.body.passout,
        status: req.body.select,
    }
    console.log(x);
    db.collection('placements').add(x).then(() => {
        db.collection('student').where('roll', '==', x.id).get().then((dbd) => {
            dbd.forEach((doc) => {
                var mailOptions = {
                    from: 'vishnu.placements.test@gmail.com',
                    to: doc.data().mail,
                    subject: 'Result of ' + x.company + ' placement drive',
                    text: 'Hello Mr/Ms ' + doc.data().name + '\n' + x.company + ' results has been released\nSTATUS:' + x.status
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            })
        })
        let data1 = {
            name: ''
        }
        let id = sessionStorage.getItem('id');
        db.collection('admin').where('id', '==', id).get().then((dbd) => {
            dbd.forEach((doc) => {
                data1.name = doc.data().name;
            })
            res.render('upload.ejs', { data: data1 });
        })
    }

    );
})
app.get('/notify_s_c', (req, res) => {
    let data1 = {
        name: ''
    }
    let id = sessionStorage.getItem('id');
    db.collection('admin').where('id', '==', id).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
        })
        res.render('a_notify.ejs', { data: data1 });
    })
});
app.post('/post_notification', (req, res) => {
    let msg = req.body.msg;
    console.log(msg);
    db.collection('student').get().then((dbd) => {
        dbd.forEach((doc) => {
            const notifications = doc.data().notifications;
            notifications.push(msg);
            doc.ref.update({ notifications });
        })
        notifier.notify({
            title: 'Placements Portal',
            message: "Notification sent to students successfully",
            sound: true,
            wait: true
        });
    });
    db.collection('coordinator').get().then((dbd) => {
        dbd.forEach((doc) => {
            const notifications = doc.data().notifications;
            notifications.push(msg);
            doc.ref.update({ notifications });
        })
        notifier.notify({
            title: 'Placements Portal',
            message: "Notification sent to coordinators successfully",
            sound: true,
            wait: true
        });
    });
    let data1 = {
        name: ''
    }
    let id = sessionStorage.getItem('id');
    db.collection('admin').where('id', '==', id).get().then((dbd) => {
        dbd.forEach((doc) => {
            data1.name = doc.data().name;
        })
        res.render('a_notify.ejs', { data: data1 });
    })

})
app.get('/logout', (req, res) => {
    sessionStorage.removeItem('id');
    console.log(sessionStorage.getItem('id'))
    res.render('home.ejs');
})
app.get('/notifications',(req,res)=>{
    console.log('hii')
    let id=sessionStorage.getItem('id');
    let person=sessionStorage.getItem('person');
    console.log(id,person)
    if(person=='student'){
        db.collection(person).where('roll','==',id).get().then((dbd)=>{
            dbd.forEach((doc)=>{
                let data1={
                    name:doc.data().name,
                    notifications:doc.data().notifications
                }
                console.log(data1)
                res.render('notifications.ejs',{data:data1});
            })
        })
    }
    else{
        db.collection(person).where('id','==',id).get().then((dbd)=>{
            dbd.forEach((doc)=>{
                let data1={
                    name:doc.data().name,
                    notifications:doc.data().notifications
                }
                console.log(data1)
                res.render('notifications.ejs',{data:data1});
            })
        })
    }
})
app.listen(1234, () => {
    console.log("server started")
})
//rohb txjn qcvy rafc
//vkfk dbzk gbgo jenm