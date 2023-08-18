import mongoose from "mongoose";

const courseProgress = new mongoose.Schema(
    {
        courseID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        completedVideos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubSection"
            }
        ]
    });

// Export the Profile model
export default mongoose.model("CourseProgress", courseProgress);