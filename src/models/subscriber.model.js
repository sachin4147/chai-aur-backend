
import mongoose,{Schema, Types} from "mongoose";


const subscribermodel=new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true
}
)

export const Subscription=mongoose.model("subscription",subscribermodel)