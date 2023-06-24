const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userModel = new mongoose.Schema(
    {
        name: {
            type: String,
            minLength: [4, "name must have atleast 4 characters"],
            required: [true, "name is required"],
        },
        email: {
            type: String,
            require: [true, "email is required"],
            validate: [validator.isEmail, "email is invalid"],
        },
        password: {
            type: String,
            select: false,
            minLength: [8, "password must have atleast 8 characters"],
            required: [true, "password field must not empty"],
            match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\d\s:])([^\s]){8,}$/,
        },
        phone: {
          type: String,
          minLength: [10, "phone number must have atleast 10 characters"],
          required: [true, "phone number field must not empty"],
        },
    },
    { timestamps: true }
);

userModel.pre("save", async function () {
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

userModel.methods.comparepassword = function (userpassword) {
    return bcrypt.compareSync(userpassword, this.password);
};

userModel.methods.gettoken = function () {
    return jwt.sign({ id: this._id }, "SECRETKEYJWT", { expiresIn: "1h" });
};

const user = mongoose.model("user", userModel);

module.exports = user;