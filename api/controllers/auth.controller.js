import bcrypt from "bcryptjs/dist/bcrypt.js";
import User from "../models/user.model.js";
import {errorHandler} from "../utils/error.js";
import jwt from "jsonwebtoken";

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
export const signin = async (req, res, next)=> {

    const { email, password} = req.body;
    
    try{

        const validUser = await User.findOne({ email });
        if (!validUser) {

            return next(errorHandler(404, "User not found"));
        }

        const validPassword = bcrypt.compareSync(password, validUser.password);
        if(!validPassword) { return next(errorHandler(401, "Wrong Credentials"))}
        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET )
        const {password: pass, ...rest}  = validUser._doc;
        res.cookie('access_token', token, {httpOnly: true, expires: new Date(Date.now() + 24 *60 *60 * 1000)})
        .status(200)
        .json(rest)
     
        

    } catch(error) {
        next(error);
    }

};