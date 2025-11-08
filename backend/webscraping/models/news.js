import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  newspaper: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  imageURL: {
    type: String,
    required: true,
    unique: true
  },
  politicalTags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});


newsSchema.index({ newspaper: 1, date: -1 });

newsSchema.index({ title: 'text', content: 'text' });

const News = mongoose.model('News', newsSchema);

export default News;