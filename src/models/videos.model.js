import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String,
      required: [true, "video file url is missing"],
    },

    videoFilePublicId: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: [true, "thumbnail url is missing"],
    },
    thumbnailPublicId: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      require: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
    },
    duration: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
videoSchema.index({ title: "text", description: "text" });
const Video = mongoose.model("Video", videoSchema);

export { Video };
