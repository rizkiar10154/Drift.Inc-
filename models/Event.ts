import mongoose, { Schema, models } from "mongoose";

const EventSchema = new Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    description: String,
    coverImage: String,
    status: { type: String, enum: ["upcoming", "past"], default: "upcoming" },
  },
  { timestamps: true }
);

export const Event = models.Event || mongoose.model("Event", EventSchema);
