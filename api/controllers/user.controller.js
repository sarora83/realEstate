import bcrypt from "bcryptjs/dist/bcrypt.js";
import {errorHandler} from "../utils/error.js";
import User from "../models/user.model.js";

export const user = (req,res) => {
    res.send("Hello World");
}

export const updateUser = async (req, res, next) => {

    if(req.user.id !== req.params.id) return next(errorHandler(401, "You can't update other's account"))
       try {
         if(req.body.password){
            req.body.password = bcrypt.hashSync(req.body.password, 10)
         }
         const updateUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username,
                email : req.body.email,
                password: req.body.password,
                avatar: req.body.avatar,
            }
         }, {new: true})

        const {password, ...rest} = updateUser._doc;
         res.status(200).json(rest);

       } catch (error) {
            next(error)
       }
}