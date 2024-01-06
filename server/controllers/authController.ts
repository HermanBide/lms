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
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
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
        console.error(error);
        return next(new ErrorHandler(error.message, 400));
      }

      // res.status(200).json(success: true, data: user, onmessage: "Successfully registered User!")
    } catch (error: any) {
      console.error(error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//Create token
interface ActivationToken {
  token: string;
  activationCode: string;
  exp: number;
}
export const createActivationToken = (user: any): ActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresInMinutes = 10;

  const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;

  const token = jwt.sign(
    {
      user,
      activationCode,
      exp,
    },
    process.env.ACTIVATION_SECRET as Secret,
    // {
    //   expiresIn: expiresInMinutes * 60,
    // }
  );
  return { token, activationCode, exp };
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

      const newUser: {
        exp: number;
        user: User;
        activationCode: string;
      } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: User; activationCode: string; exp: number };
      console.log(newUser);
      const now = Math.floor(Date.now() / 1000);

      if (newUser.exp < now) {
        return next(new ErrorHandler("Token has expired", 400));
      }

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }
      const { name, email, password } = newUser.user;
      //is user in our database or not
      const existUser = await UserModel.findOne({ email });
      if (existUser) {
        return next(
          new ErrorHandler("Email already exist Try another email", 400)
        );
      }
      const user = await UserModel.create({ name, email, password });
      res.status(201).json({
        success: true,
        data: user,
        message: "User Activation was successful",
      });
    } catch (error: any) {
      console.error(error.message);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface LoginRequest {
  email: string;
  password: string;
}

const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      const user = await UserModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);
      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      console.log(error)
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export { registerUser, activateUser };
