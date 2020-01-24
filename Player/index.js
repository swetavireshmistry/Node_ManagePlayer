var express = require('express');

var multer = require('multer');
var bcrypt = require('bcrypt');
const router = express.Router();


var Player = require('../schema/Player');
router.use(express.json());
const jwthelper = require('../helper/jwtHelper');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './Upload');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png"||file.mimetype === "image/PNG")
        cb(null, true);
    else {
        req.fileValidationError = 'Only Image file are allowed!!';
        cb(new Error('Only Image file are allowed!!'), false);
    }
}

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
}).single('profile');

router.post('/create', async function (req, res) {
    upload(req, res, async function (err) {
        if (req.fileValidationError)
            return res.status(500).send(req.fileValidationError);
        const body = req.body;
        let hash = bcrypt.hashSync(body.password, 5);
        try {
            body.password = hash;
            var player = await Player.create({ ...body, profile: req.file.filename });
            return res.status(200).json(player);
        }
        catch (error) {
            if (error.code == 11000)
                return res.status(500).send('duplicate username not allowed');
            return res.status(500).send('an error occured while create User');
        }
    })
});
router.put('/update/:id', async function (req, res) {
    upload(req, res, async function (err) {
        if (req.fileValidationError)
            return res.status(500).send(req.fileValidationError);
        const body = req.body;
        var filenm="";
        if(req.file)
            filenm=req.file.filename
        else
            filenm=body.profile
        try{
            var player = await Player.findByIdAndUpdate(req.params.id,{ ...body, profile: filenm });
            return res.status(200).json(player);
        }
        catch (error) {
            if (error.code == 11000)
                return res.status(500).send('duplicate username not allowed');
            return res.status(500).send('an error occured while update User'+error);
        }
    })
});
router.post('/login', async function (req, res, next) {
    const body = req.body;
    try {
        var player = await Player.findOne({ username: body.username });
        req.oldpwd = player.password;
        return next();
    } catch (error) {
        return res.status(500).send('Username is invalid!!');
    }
},
    async function (req, res) {
        const body = req.body;
        try {
            const match = await bcrypt.compare(body.password, req.oldpwd);
            if (match) {
                var player = await Player.findOne({ password: req.oldpwd });
                var token = await jwthelper.sign(player._id, "some secret");
                return res.status(200).json({ "Id": player._id, "userrole": player.userrole, "token": token });
            }
            else
                return res.status(500).send('Password is invalid!!');
        } catch (error) {
            return res.status(500).send('Username or Password is invalid!!');
        }
    });

router.get('/get', async function (req, res) {
    try {
        var pageno=Number(req.query.pageNo)
        var size=3
        var tot_record = await Player.find({userrole:{$ne:"Admin"}}).count();
        if(pageno<=0)
        {
            return res.status(500).send('Invalid PageNo should start with 1');
        }
        var player = await Player.find({userrole:{$ne:"Admin"}}).sort({createdAt:-1}).limit(size).skip(size*(pageno-1));
        return res.status(200).json({"player":player,"tot_record":tot_record,"limit":size,"current_Page":pageno});
    } catch (error) {
        return res.status(500).send('an error occured while get player detail');
    }
});
router.post('/list', async function (req, res) {
    try {
        const body=req.body.id
        console.log(req.body)
       var player = await Player.find({_id:body});
        return res.status(200).json(player);
    } catch (error) {
        return res.status(500).send('an error occured while get player details');
    }
});
router.get('/find', async function (req, res) {
    try {
        const text=req.query.search
        var pageno=Number(req.query.pageNo)
        var team=req.query.team
        var sort=req.query.sort
        if(sort=="desc")
            sort=-1
        else
            sort=1
     
        var size=3
        if(pageno<=0)
        {
            return res.status(500).send('Invalid PageNo should start with 1');
        }
        console.log(team)
        if(team!=""){
            var query={
                $and:[
                    {$or:[{username:{'$regex':text,'$options':'i'}},{role:{'$regex':text,'$options':'i'}},{bowlerstyle:{'$regex':text,'$options':'i'}},{batsmanstyle:{'$regex':text,'$options':'i'}},{team:{'$regex':text,'$options':'i'}}]},
                    {userrole:{$ne:"Admin"}},
                    {team:team}
                ]};
        }
        else{
            var query={
                $and:[
                    {$or:[{username:{'$regex':text,'$options':'i'}},{role:{'$regex':text,'$options':'i'}},{bowlerstyle:{'$regex':text,'$options':'i'}},{batsmanstyle:{'$regex':text,'$options':'i'}},{team:{'$regex':text,'$options':'i'}}]},
                    {userrole:{$ne:"Admin"}}
                ]};
        }
        var tot_record = await Player.find(query).count();
       var player = await Player.find(query).sort({username:sort}).limit(size).skip(size*(pageno-1));
       return res.status(200).json({"player":player,"tot_record":tot_record,"limit":size,"current_Page":pageno});
    } catch (error) {
        return res.status(500).send('No Search Record Found');
    }
});
router.delete('/delete/:id', async function (req, res) {
    try {
        var player = await Player.findByIdAndDelete({_id:req.params.id});
        return res.status(200).json(player);
    } catch (error) {
        return res.status(500).send('an error occured while delete user');
    }
});

module.exports = router;