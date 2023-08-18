import mongoose from "mongoose";
import mailSender from "../utils/mailSender";

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5,                    // The document will be automatically deleted after 5 minutes of its creation time
    },
});


// a function to send emails

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification mail from LearnUp", otp);
        console.log("Email sent successfully", mailResponse);

    } catch (error) {
        console.log("Error occured while sending mails: ", error);
        throw error;
    }
}


//Pre middleware.
//Before saving this document in the database. You have to send email with the given otp and email and next you will move to the next middleware.
OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

export default mongoose.model("OTP", OTPSchema);