import mongoose, { Document, Model, Schema } from "mongoose";
import { z, ZodError } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface User extends Document {
  name: string;
  email: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  courses: Array<{ courseId: string }>;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

// Define Zod schema for user input validation
const userSchemaValidator = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(6),
  avatar: z.object({
    public_id: z.string(),
    url: z.string(),
  }),
  role: z.string(),
  isVerified: z.boolean(),
  courses: z.array(
    z.object({
      courseId: z.string(),
    })
  ),
});

const userSchema: Schema<User> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter a name"],
    },
    email: {
      type: String,
      required: [true, "please enter a email"],
      validate: {
        validator: function (value: string) {
          return emailRegex.test(value) && value;
        },
        message: "Please enter a valid email",
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      minlength: [6, "password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    courses: [
      {
        courseId: String,
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook to validate and hash password using bcrypt
userSchema.pre<User>("save", async function (next) {
  try {
    // Validate input data using Zod
    const validatedData = userSchemaValidator.parse(this.toObject());

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error) {
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
        // If validation fails, pass an error to the next middleware
      next(new Error(error.errors.join(", ")));
    } else {
     // If there's any other error, pass it to the next middleware
      // Explicitly define the type of 'error' or use type assertion
      next(error as Error);
    }
  }
});


// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

// sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

// Method to compare passwords using bcrypt
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

const UserModel = mongoose.model<User>("User", userSchema);

export default UserModel;
