const express = require('express');
const controller = require('../controller/controller.js');
const app = express();

app.get('/', controller.getIndex); //show all the data from db 
app.get('/filter', controller.getIndex); //filter data from db
app.get('/deleteAppointment', controller.getDeleteAppointment); //get index to delete data from db
app.get('/editAppointment', controller.getEditAppointment); //get index to edit data from db

app.post('/addAppointment', controller.postAddAppointment); //post add data to db
app.post('/updateAppointment', controller.postUpdateAppointment); //post update data to db

module.exports = app;