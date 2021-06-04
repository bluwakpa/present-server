//manage database interactions for students
const StudentsServices = {
    getAllStudents(knex){
        return knex
         .select('*')
         .from('students');
    },
    insertStudent(knex, newStudent){
        return knex
         .insert(newStudent)
         .into('students')
         .returning('*')
         .then(rows => { return rows[0] });
    },
    getStudentById(knex, id){
        return knex
         .select('*')
         .from('students')
         .where('id', id)
         .first(); //get student itself
    },
    deleteStudent(knex, id){
        return knex('students')
         .where('id', id)
         .delete();
    },
    updateStudent(knex, id, updatedStudent){
        return knex('students')
         .where('id', id)
         .update(updatedStudent);
    }
};

module.exports = StudentsServices;