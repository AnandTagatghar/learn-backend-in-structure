import mongoose, { Schema } from "mongoose";

const subscribSchema = new Schema(
  {
    subscribe: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Subscribe = mongoose.model("Subscribe", subscribSchema);

export { Subscribe };
