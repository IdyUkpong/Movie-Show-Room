import { Request, Response } from "express";
import { UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { registerUserSchema, options, loginUserSchema } from "../utils/utils";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MovieInstance } from "../model/movieModel";

const jwtsecret = process.env.JWT_SECRET as string;


export const Register = async (req: Request, res: Response) => {
    try {
      const { email, firstName, userName, password, confirm_password } = req.body;
      const iduuid = uuidv4();
    
      const validationResult = registerUserSchema.validate(req.body, options);
  
      if (validationResult.error) {
        return res.render("Register", {error: validationResult.error.details[0].
        message})
      }
  
      // Hash password
      const passwordHash = await bcrypt.hash(password, 8);
  
      // Create user
      // -check if user exist
      const user = await UserInstance.findOne({
        where: { email: email },
      });
  
      if (!user) {
        let newUser = await UserInstance.create({
          id: iduuid,
          email,
          firstName,
          userName,
          password: passwordHash,
        });
  
        // Generate token for user
        const User = (await UserInstance.findOne({
          where: { email: email },
        })) as unknown as { [key: string]: string };
  
        const { id } = User;
  
        const token = jwt.sign({ id }, jwtsecret, { expiresIn: "30mins" });
  
        res.cookie('token', token, {httpOnly:true, maxAge:30 * 60 * 1000})
  
      
  
        return res.redirect("/login")
      }
  
     return res.render("Register", {error:"email is already taken"})
  
    } catch (error) {
      console.log(error);
    }
  };
  
  export const Login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      // Validate with Joi or Zod
      const validationResult = loginUserSchema.validate(req.body, options);
  
      if (validationResult.error) {
        return res.render("Login", {error:validationResult.error.details[0].message})
      }
  
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as { [key: string]: string };

      if (!User) {
        res.render("Login", {error:"Invalid email/password"})
      }
  
      const { id } = User;
  
      const token = jwt.sign({ id }, jwtsecret, { expiresIn: "30d" });
  
       res.cookie('token', token, {httpOnly:true, maxAge:30 * 24 * 60 * 60 * 1000})
  
      const validUser = await bcrypt.compare(password, User.password);
  
      if (validUser) {
        return res.redirect('/dashboard')
      }
  
      res.render("Login", {error:"Invalid email/password"})
      
    } catch (error) {
      console.log(error);
   
    }
  };
  
  
  export const getUserAndMovie = async(req:Request, res:Response)=>{
      try {
    
  
      const getAllUser = await UserInstance.findAndCountAll({
          include:[{
              model:MovieInstance,
              as:"movie"
          }]
      });
  
      return res.status(200).json({
          msg: "You have successfully retrieved all data",
          count: getAllUser.count,
          movie: getAllUser.rows
      })
      } catch (error) {
          console.log(error)
      }
  }


  export const Logout = async (req:Request, res:Response) => {
    res.clearCookie('token');
    res.redirect('/login')
}

