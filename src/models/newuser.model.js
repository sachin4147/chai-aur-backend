import mongoose, { Schema } from "mongoose";


const userSchemaData= new mongoose.Schema({
first_name:{type:"string",required:true,index:true,unique:true},
last_name:{type:"string",required:true},
email:{type:"string",required:true, index:true,unique:true},
gender:{type:"string",required:true},
age:{type:"number",required:true},
score:{type:"number",required:true},
subject_marks:[
   {
    type:Schema.Types.ObjectId,
    ref:"subjectmarks"
   }
]
},{
    timestamps:true
})

 export const userDataModal=mongoose.model("userdatas",userSchemaData)