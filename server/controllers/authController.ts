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
require("dotenv").config;

interface RegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registerUser = CatchAsyncError(
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
          template: "activation -mail.ejs",
          data,
        });
        res
          .status(200)
          .json({
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
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};
