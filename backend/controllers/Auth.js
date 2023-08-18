//sendOTP
//signUP
//login
//changePassword
import User from "../models/User.js"
import otpGenerator from "otp-generator"
import OTP from "../models/OTP.js"
import bcrypt from "bcrypt"
import Profile from "../models/Profile.js"
import user from "../models/User.js"


export const sendOTP = async (req, res) => {

    try {
        const { email } = req.body;
        const checkUserPresent = await User.findOne({ email });

        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User already registered',
            })
        }

        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated: ", otp);

        //Check unique otp or not.
        const result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })

            result = await OTP.findOne({ otp: otp });
        }

        const otpPayLoad = { email, otp };

        //create an entry in db

        const otpBody = await OTP.create(otpPayLoad);
        console.log(otpBody);


        //return response successfull
        res.status(200).json({
            success: true,
            message: "OTP Sent Successfully",
            otp,
        })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: error.message,
        })

    }
}

export const signUp = async (req, res, next) => {


    const { firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp } = req.body;


    if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp) {
        return res.status(403).json({
            success: false,
            message: "All fields are requried",
        })
    }

    if (password !== confirmPassword) {
        return res.status(403).json({
            success: false,
            message: "Password and confirmPassword are not same"
        })
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "User is already registered",
        })
    }

    const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log(recentOtp);


    if (recentOtp.length == 0) {
        return res.status(400).json({
            success: false,
            message: "OTP Found",
        })
    } else if (otp !== recentOtp.otp) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP",
        });
    }


    //hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create entry in DB

    const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
    });

    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType,
        additionalDetails: profileDetails._id,
        image:  `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    })

    return res.status(200).json({
        success: true,
        message: 'User is registerd successfully',
        user,
    })













}

