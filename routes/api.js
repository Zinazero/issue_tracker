'use strict';

const mongoose = require('mongoose');
const Issue = require('./models/issue.js')

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      try {
        let project = req.params.project;
        let query = { project: project };

        Object.assign(query, req.query);
        
        let issues = await Issue.find(query);

        res.json(issues);
      } catch (err) {
        return res.status(500).json({ error: "failed to retrieve project" });
      }
    })
    
    .post(async function (req, res) {
      let project = req.params.project;
      let issueTitle = req.body.issue_title;
      let issueText = req.body.issue_text;
      let createdBy = req.body.created_by;
      let assignedTo = req.body.assigned_to;
      let statusText = req.body.status_text;
      let currentDate = new Date();

      if (!issueTitle || !issueText || !createdBy) {
        return res.json({ error: "required field(s) missing" });
      }

      try {
        var newIssue = new Issue({
          project: project,
          issue_title: issueTitle,
          issue_text: issueText,
          created_on: currentDate,
          updated_on: currentDate,
          created_by: createdBy,
          assigned_to: assignedTo || "",
          open: true, 
          status_text: statusText || ""
        });

        let savedIssue = await newIssue.save();

        return res.json({
          _id: savedIssue._id,
          issue_title: savedIssue.issue_title,
          issue_text: savedIssue.issue_text,
          created_on: savedIssue.created_on,
          updated_on: savedIssue.updated_on,
          created_by: savedIssue.created_by,
          assigned_to: savedIssue.assigned_to,
          open: savedIssue.open,
          status_text: savedIssue.status_text
        });
      } catch (err) {
        return res.status(500).json({ error: "failed to create issue" });
      }
    })
    
    .put(async function (req, res){
      try{
        let _id = req.body._id;
        let newTitle = req.body.issue_title;
        let newText = req.body.issue_text;
        let newCreatedBy = req.body.created_by;
        let newAssignedTo = req.body.assigned_to;
        let newStatusText = req.body.status_text;
        let currentDate = new Date();

        if (!_id) {
          return res.json({ error: "missing _id" });
        }
        if (!newTitle && !newText && !newCreatedBy && !newAssignedTo && !newStatusText) {
          return res.json({ error: "no update field(s) sent", "_id": _id })
        }

        let update = {};
        if (newTitle) {
          update.issue_title = newTitle;
        }
        if (newText) {
          update.issue_text = newText;
        }
        if (newCreatedBy) {
          update.created_by = newCreatedBy;
        }
        if (newAssignedTo) {
          update.assigned_to = newAssignedTo;
        }
        if (newStatusText) {
          update.status_text = newStatusText;
        }
        update.updated_on = currentDate.toISOString();

        let updatedIssue = await Issue.findOneAndUpdate({ _id: _id }, update, { new: true }).exec();

        if (updatedIssue === null) {
          return res.json({ error: "could not update", "_id": _id });
        }
        
        res.json({ result: "successfully updated", "_id": _id });
      } catch (err) {
        return res.status(500).json({ error: "could not update" });
      }
    })
    
    .delete(async function (req, res){
      try {
        let _id = req.body._id;

        if (!_id) {
          return res.json({ error: "missing _id" });
        }

        let deletedIssue = await Issue.deleteOne({ _id: _id });

        if (deletedIssue.deletedCount === 0) {
          return res.json({ error: "could not delete", "_id": _id });
        }
        
        res.json({ result: "successfully deleted", "_id": _id });
      } catch {
        res.status(500).json({ error: "could not delete" });
      }
    });
    
};
