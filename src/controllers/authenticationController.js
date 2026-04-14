const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const { getValidationErrorMessage } = require("../utils/validationUtils");

const saltRounds = Number(process.env.SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;



const registerController = async (req, res) => {
  try {
    const { userName, email, password, imageUrl, contactNo } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) {
      res.status(400).json({ message: "email id already exists" });
    } else {
      bcrypt.hash(password, saltRounds, async function (err, hash) {
        console.log(err);
        if (hash) {
          try {
            const newUser = await UserModel.create({
              userName,
              email,
              password: hash,
              imageUrl,
              contactNo,
            });
            res.json({ message: "User Registered Successfully" });
          } catch (err) {
            if (err.name === "ValidationError") {
              const message = getValidationErrorMessage(err);

              res.status(400).json({ message: message });
            } else {
              res
                .status(400)
                .json({
                  message:
                    "something went wrong in the server, please try again later",
                });
            }
          }
        } else {
          res
            .status(400)
            .json({ message: "something went wrong, please try again" });
        }
      });
    }
  } catch (err) {
    res.json({ message: "Something went wrong" });
  }
};

const loginController = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res
        .status(400)
        .json({ message: "Email and password is required" });
    }
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    
    if (user && user.isActive === false) {
      return res
        .status(401)
        .json({ message: "Account is inactive, please contact admin" });
    }

    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
          var token = jwt.sign({ email }, JWT_SECRET);
          res
            .cookie("token", token, {
              maxAge: 30 * 24 * 60 * 60 * 1000,
              httpOnly: true,
              sameSite: "None",
              secure: true,
            })
            .json({ message: "success",user });
        } else {
          res.status(401).json({ message: "invalid credentials" });
        }
      });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { registerController, loginController };
