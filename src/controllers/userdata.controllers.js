import { userDataModal } from "../models/newuser.model.js";
import { subjectmarks } from "../models/subjectMarks.model.js";


export const modelusercontroller=async(req,res)=>{
    try {
        const {first_name,last_name,email,gender,age,score}=req.body
        const user=await userDataModal.create({
            first_name,
            last_name,
            email,
            gender,
            age,
            score
        })
        return res.status(201).json({
            success:true,
            message:"user created successfully",
            user
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user not created"
        })
    }
}

export const modelusercount=async(req,res)=>{
    try {
        const {first_name,new_first_name}=req.body
        const user=await userDataModal.findOneAndUpdate({first_name},
            {$set:{first_name:new_first_name}},
            {
                new:true
            })
        return res.status(201).json({
            success:true,
            message:"user created successfully",
            user
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"user not created"
        })
    }
}
export const getsubjecthistory = async (req, res) => {
    try {
        const { first_name } = req.body;
        const userid = req.headers["userid"];

        // Ensure userid is provided
        if (!userid) {
            return res.status(400).json({
                success: false,
                message: "User  ID not found"
            });
        }
        //  const finduser=await userDataModal.aggregate([
        //     { $match: { first_name: first_name } },])

        //     if(finduser){
        //         res.json({finduser})
        //     }
        const subjecthistory = await userDataModal.aggregate([
            { $match: { first_name: first_name } },
            {
                $lookup: {
                    from: "subjectmarks",
                    localField: "subject_marks",
                    foreignField: "_id",
                    as: "subject_marks",
                    pipeline: [
                        {
                            $lookup: {
                                from: "userDataModal",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            first_name: 1,
                                            last_name: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: { $first: "$owner" }
                            }
                        }
                    ]
                }
            }
        ]);

        if (!subjecthistory.length) {
            return res.status(404).json({
                success: false,
                message: "No subject history found for the user"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subject history retrieved successfully",
            subject_marks: subjecthistory,
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving subject history",
            error: error.message // Send the error message in the response
        });
    }
};


export const addsubjects = async (req, res) => {
    try {
        const userid = req.headers["userid"];
        if (!userid) {
            return res.status(400).json({
                success: false,
                message: "User  ID not found"
            });
        }
        const user=await userDataModal.findById(userid)
        if(user){
     const addsubject = await subjectmarks.create({
            subject: req.body.subject,
            marks: req.body.marks,
            owner: userid
        });

        res.status(200).json({
            success: true,
            message: "Subject added successfully",
            addsubject
        });

        }else{
            return res.status(404).json({message:"user not found"})
        }
        
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({
            success: false,
            message: "An error occurred while adding the subject",
            error: error.message // Send the error message in the response
        });
    }
};


