import UserModel, { User } from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import { Request, Response, NextFunction } from "express";
import path from "path";
//node module to send email.
import ejs from "ejs";
import { createTextSpanFromBounds } from "typescript";
import jwt, { Secret } from "jsonwebtoken";
import sendMail from "../utils/sendMail";
require("dotenv").config();


//Create signup/register function 
interface RegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const isEmailExist = await UserModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }
      const user: RegistrationBody = { name, email, password };

      const activationToken = createActivationToken(user);

      const activationCode = activationToken.activationCode;

      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mail/activation-mail.ejs"),
        data
      );
      //
      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          data,
        });
        res.status(200).json({
          success: true,
          message: `Please check your @email: ${user.email} to activate your account`,
          activation: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }

      // res.status(200).json(success: true, data: user, onmessage: "Successfully registered User!")
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//Create token
interface ActivationToken {
  token: string;
  activationCode: string;
}
export const createActivationToken = (user: any): ActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "10m",
    }
  );
  return { token, activationCode };
};

//Activate User
interface ActivationRequest {
  activation_code: string;
  activation_token: string;
}

const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as ActivationRequest;

      const newUser: { user: User; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: User; activationCode: string };
      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }
      const { name, email, password } = newUser.user
      //is user in our database or not
      const existUser = await UserModel.findOne({ email })
      if(existUser) {
        return next(new ErrorHandler("Email already exist Try another email", 400));
      }
      const user = await UserModel.create({name, email, password})
      res.status(201).json({success: true, data: user, message: "User Activation was successful"})
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export { registerUser, activateUser };
