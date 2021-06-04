const express = require('express');
const xss = require('xss');
const StudentsServices = require('./students-services');
const StudentsRouter = express.Router();
const jsonParser = express.json();

//serialize student in case of xss attack
const serializeStudent = student => ({
    first_name: xss(student.first_name),
    last_name: xss(student.last_name),
    id: student.id,
    modified: student.modified,
    attendance: student.attendance
});

//get all students and add new student
StudentsRouter
 .route('/')
 .get((req, res, next) => {
     const knexInstance = req.app.get('db');
     StudentsServices.getAllStudents(knexInstance)
      .then(students => { 
          res.json(students.map(serializeStudent)) })
      .catch(next);
 })
 .post(jsonParser, (req, res, next) => {
     const knexInstance = req.app.get('db');
     const { first_name, last_name, modified, attendance } = req.body;
     const newStudent = { first_name, last_name, modified, attendance };

     //each value in new student is required, verify that they were sent
     for(const [key, value] of Object.entries(newStudent)){
         if(value == null){
             return res.status(400).json({
                 error: { message: `Missing '${key}' in request body'`}
             });
         }
     }

     StudentsServices.insertStudent(knexInstance, newStudent)
      .then(student => {
          res
            .status(201)
            .location(req.originalUrl + `/${student.id}`)
            .json(serializeStudent(student))
      })
      .catch(next);
 });

 //get, update, or delete specific student
 StudentsRouter
  .route('/:id')
  .all((req, res, next) => {
      const knexInstance = req.app.get('db');
      const id = Number(req.params.id);

      StudentsServices.getStudentById(knexInstance, id)
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
    res.json(serializeStudent(res.student));
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const deleteStudentId = res.student.id;

    StudentsServices.deleteStudent(knexInstance, deleteStudentId)
       .then(() => res.status(204).end())
       .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const updateStudentId = res.student.id;
    const { first_name, last_name, id, modified, attendance } = req.body;
    console.log(req.body)
    const updatedStudent = {};
    if (first_name) updatedStudent.first_name = first_name; 
    if (last_name) updatedStudent.last_name = last_name;
    if (id) updatedStudent.id = id;
    if (modified) updatedStudent.modified = modified;
    if (attendance) updatedStudent.attendance = attendance;

    //check that at least one field is getting updated in order to patch
    const numberOfValues = Object.values(updatedStudent).filter(Boolean).length 
    if(numberOfValues === 0){
        return res.status(400).json({
            error: { 
                message: `Request body must contain either 'first_name, last_name, id, modified, or attendance'`
            }
        });
    }

    updatedStudent.modified = new Date();

    StudentsServices.updateStudent(knexInstance, updateStudentId, updatedStudent)
     .then(() => res.json(serializeStudent(updatedStudent)))
     .catch(next);
  });

 module.exports = StudentsRouter;