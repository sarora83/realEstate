import bcrypt from "bcryptjs/dist/bcrypt.js";
import User from "../models/user.model.js";


export const signup = async (req, res, next)=> {

    const {username, email, password} = req.body;
    //const salt = await bcrypt.genSaltSync(10);
    //req.body.password = await bcrypt.hash(req.body.password, salt);
    //const salt = bcryptjs.genSaltSync(10)

    var salt =  bcrypt.genSaltSync(10);
    const hashedPassword =  bcrypt.hashSync(req.body.password, salt);
    //const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({username, email, password : hashedPassword});
    try{
        await newUser.save();
        res.status(201).json("User created");

    } catch(error) {
        next(error);
    }

};