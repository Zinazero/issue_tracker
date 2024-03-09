const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(5000);
  //Test 1
  test('Create an issue with every field', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test1", issue_text: "testing", created_by: "tester", assigned_to: "testee", status_text: "tested" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "test1");
        assert.equal(res.body.issue_text, "testing");
        assert.equal(res.body.created_by, "tester");
        assert.equal(res.body.assigned_to, "testee");
        assert.equal(res.body.status_text, "tested");
        done();
      });
  });
  //Test 2
  test('Create an issue with only required fields', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test2", issue_text: "testing", created_by: "tester" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "test2");
        assert.equal(res.body.issue_text, "testing");
        assert.equal(res.body.created_by, "tester");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        done();
      });
  });
  //Test 3
  test('Create an issue with missing required fields', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test3" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.throw(() => {
          throw new Error(res.body.error);
        }, Error, "required field(s) missing");
        done();
      });
  });
  //Test 4
  test('View issues on a project', function (done) {
    chai.request(server)
      .get('/api/issues/:project')
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });
  //Test 5
  test('View issues on a project with one filter', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test5", issue_text: "testing", created_by: "tester" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        chai.request(server)
          .get('/api/issues/:project')
          .query({ created_by: "tester" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isTrue(res.body.every(issue => issue.created_by === "tester"));
            done();
          });
      });
  });
  //Test 6
  test('View issues on a project with multiple filters', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test6", issue_text: "testing", created_by: "tester", assigned_to: "testee" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        chai.request(server)
          .get('/api/issues/:project')
          .query({ created_by: "tester", assigned_to: "testee", open: true })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isTrue(res.body.every(issue => issue.created_by === "tester"));
            assert.isTrue(res.body.every(issue => issue.assigned_to === "testee"));
            assert.isTrue(res.body.every(issue => issue.open === true));        
            done();
          });
      });
  });
  //Test 7
  test('Update one field on an issue', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test7", issue_text: "testing", created_by: "tester" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const _id = res.body._id;
        chai.request(server)
          .put('/api/issues/:project')
          .send({ _id: _id, issue_title: "test7" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully updated", "_id": _id });
            done();
          });
      });
  });
  //Test 8
  test('Update multiple fields on an issue', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test8", issue_text: "testing", created_by: "tester" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const _id = res.body._id;
        chai.request(server)
          .put('/api/issues/:project')
          .send({ _id: _id, issue_title: "test8", assigned_to: "other testee" })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully updated", "_id": _id });
            done();
          });
      });
  });
  //Test 9
  test('Update an issue with missing _id', function (done) {
    chai.request(server)
      .put('/api/issues/:project')
      .send({ issue_title: "test9" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.throw(() => {
          throw new Error(res.body.error);
        }, Error, "missing _id");
        done();
      });
  });
  //Test 10
  test('Update an issue with no fields to update', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test10", issue_text: "testing", created_by: "tester" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const _id = res.body._id;
        chai.request(server)
          .put('/api/issues/:project')
          .send({ _id: _id })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.throw(() => {
              throw new Error(res.body.error);
            }, Error, "no update field(s) sent", { error: "no update field(s) sent", _id: _id });
            done();
          });
      });
  });
  //Test 11
  test('Update an issue with an invalid _id', function (done) {
    chai.request(server)
      .put('/api/issues/:project')
      .send({ _id: "invalidID", issue_title: "test11" })
      .end(function (err, res) {
        assert.equal(res.status, 500);
        assert.throw(() => {
          throw new Error(res.body.error);
        }, Error, "could not update", { error: "could not update", _id: "invalidID" });
        done();
      });
  });
  //Test 12
  test('Delete an issue', function (done) {
    chai.request(server)
      .post('/api/issues/:project')
      .send({ issue_title: "test12", issue_text: "testing", created_by: "tester" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        const _id = res.body._id;
        chai.request(server)
          .delete('/api/issues/:project')
          .send({ _id: _id })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { result: "successfully deleted", "_id": _id });
            done();
          });
      });
  });
  //Test 13
  test('Delete an issue with an invalid _id', function (done) {
    chai.request(server)
      .delete('/api/issues/:project')
      .send({ _id: "invalidID" })
      .end(function (err, res) {
        assert.equal(res.status, 500);
        assert.throw(() => {
          throw new Error(res.body.error);
        }, Error, "could not delete", { error: "could not delete", _id: "invalidID" });
        done();
      });
  });
  //Test 14
  test('Delete an issue with missing _id', function (done) {
    chai.request(server)
      .delete('/api/issues/:project')
      .send({ _id: "" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.throw(() => {
          throw new Error(res.body.error);
        }, Error, "missing _id");
        done();
      });
  });
  after(function() {
    chai.request(server)
      .get('/')
  });
});
