import mongoose,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema=new Schema({
    videofile:{
        type:String,
        required:true,
    },
    thumbnail:{
        type:String,
        required:true,
    }, 
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    duration:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0,
        },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    access:{
        type:String,
        required:true
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate);
export const Video=mongoose.model('Video',videoSchema);  //exporting the model to use it in