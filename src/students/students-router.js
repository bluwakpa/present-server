const express = require('express');
const xss = require('xss');
const StudentsService = require('./students-service');
const StudentsRouter = express.Router();
const jsonParser = express.json();

//serialize student in case of xss attack
const serializeStudent = student => ({
    first_name: xss(student.first_name),
    last_name: xss(student.last_name),
    id: student.id,
    modified: student.modified,
    attendance: {"Today": false, "Yesterday": true}
});

//get all students and add new student
studentsRouter
 .route('/')
 .get((req, res, next) => {
     const knexInstance = req.app.get('db');
     StudentsService.getAllStudents(knexInstance)
      .then(students => { 
          res.json(students.map(serializeStudent)) })
      .catch(next);
 })
 .post(jsonParser, (req, res, next) => {
     const knexInstance = req.app.get('db');
     const { first_name, last_name, id, modified, attendance } = req.body;
     const newStudent = { first_name, last_name, id, modified, attendance };

     //each value in new student is required, verify that they were sent
     for(const [key, value] of Object.entries(newStudent)){
         if(value == null){
             return res.status(400).json({
                 error: { message: `Missing '${key}' in request body'`}
             });
         }
     }

     StudentsService.insertStudent(knexInstance, newStudent)
      .then(student => {
          res
            .status(201)
            .location(req.originalUrl + `/${student.id}`)
            .json(serializeStudent(student))
      })
      .catch(next);
 });

 //get, update, or delete specific student
 studentsRouter
  .route('/:id')
  .all((req, res, next) => {
      const knexInstance = req.app.get('db');
      const studentId = req.params.id;

      StudentsService.getStudentById(knexInstance, studentId)
       .then(student => {
           if(!student){ 
               return res.status(404).json({
                   error: { message: `Student doesn't exist`}
               });
           }
           res.student = student;
           next();
       })
       .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.student));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const deleteStudentId = res.student.id;

    StudentsService.deleteStudent(knexInstance, deleteStudentId)
       .then(() => res.status(204).end())
       .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const updateStudentId = res.student.id;
    const { first_name, last_name, id, modified, attendance } = req.body;
    const updatedStudent = { first_name, last_name, id, modified, attendance };

    //check that at least one field is getting updated in order to patch
    const numberOfValues = Object.values(updatedStudent).filter(Boolean).length 
    if(numberOfValues === 0){
        return res.status(400).json({
            error: { 
                message: `Request body must contain either 'first_name, last_name, id, modified, or attendance'`
            }
        });
    }

    updatedStudent.date_modified = new Date();

    StudentsService.updateStudent(knexInstance, updateStudentId, updatedStudent)
     .then(() => res.status(204).end())
     .catch(next);
  });

 module.exports = studentsRouter;