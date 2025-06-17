import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    content:{
        type:String,
        required:true
    },
    photo:{
        url:{
            type:String,
            default:""
        },
        public_id:{
            type:String,
            default:""
        }
    }
},{timestmaps:true});

export const Tweet = mongoose.model("Tweet",tweetSchema);