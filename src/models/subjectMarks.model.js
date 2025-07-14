
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const subjectmarksSchema = new Schema({
    subject:{
        type:String,
        required:true,
        index:true
    },
    marks:{
        type:Number,
        required:true,
       
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"userDataModal"
    }
    
},{
    timestamps:true
})


subjectmarksSchema.plugin(mongooseAggregatePaginate)    

export const subjectmarks=mongoose.model("subjectmarks",subjectmarksSchema)