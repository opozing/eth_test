const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const App = express();

App.use(express.static('public'));


App.get('/', function(req, res) {
    res.send('Node.js working...');
});

App.listen(5000, 'localhost', () => {
    console.log('Server running...');
});