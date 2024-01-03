import UserModel, {User} from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import { createTextSpanFromBounds } from "typescript";




const getUserById = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    try {
        const user = await UserModel.findById(userId);
        if (user) {
            res.status(200).json({success: true, message: "User has been found", data: user})
          } else {
            res.status(404).json({ error: 'User not found' });
          }

    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

const getAllUsers = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    const user = req.params.user;
    try {
     const allUsers = await UserModel.find({user})
     res.status(200).json({success: true, message: "All users have been found", data: allUsers });
    } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})

const updateUser = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    try {
        const user = await UserModel.findById(userId, { name, email, password });
    } catch (error) {
    }
})

const deleteUser = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        
    } catch (error) {
        
    }
})

module.exports = { deleteUser, getUserById, getAllUsers, updateUser}