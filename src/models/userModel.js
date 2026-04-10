const mongoose =require("mongoose");

 const userSchema = mongoose.Schema({
    userName: {
        type:String,
        required:[true,"user name is required"],

    },
    email: {
        type: String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        lowercae: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [8, "pasword must be atleast 8 characters"]
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    role: {
        type: String,
        required: true,
        enum: ["superadmin", "admin", "manager", "user"],
      default: "user",
    },
    createdByAdmin: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "user", // references the admin who created/promoted this manager
},

    contactNo:{
         type: String,
        required: [true, "contact number is required"],
        minlength:[10 , "phone number should be atleast 10 numbers"],
        maxlength:[15, " phone number should not exceed 15 numbers"]
    },
    isActive:{
        type:Boolean,
        required:[true,"active status is required"],
        default:true,
    },
     assignedTurfs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Turf" }] 
 },{timestamps: true})


 const UserModel = mongoose.model("user",userSchema)

 module.exports = UserModel;