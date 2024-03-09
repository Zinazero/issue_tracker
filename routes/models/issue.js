const mongoose = require("mongoose");

  const Schema = mongoose.Schema;
  const issueSchema = new Schema({
    project: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: String,
    updated_on: String,
    created_by: { type: String, required: true },
    assigned_to: String,
    open: { type: Boolean, default: true },
    status_text: String
  });
  const Issue = new mongoose.model("Issue", issueSchema);
  module.exports = Issue;