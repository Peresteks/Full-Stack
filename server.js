const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Renderöidään etusivu
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ladataan ja näytetään JSON-data muotoiltuna
app.get('/guestbook', (req, res) => {
    fs.readFile(path.join(__dirname, 'data', 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading guestbook data');
        }
        const jsonData = JSON.parse(data);
        res.render('guestbook', { messages: jsonData });
    });
});

// Renderöidään syöttölomake uuden viestin lisäämistä varten
app.get('/newmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'newmessage.html'));
});

app.post('/newmessage', (req, res) => {
    const { username, country, message } = req.body;
    if (!username || !country || !message) {
        return res.status(400).send('All fields are required');
    }

    const newMessage = { username, country, message };
    fs.readFile(path.join(__dirname, 'data', 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading guestbook data');
        }
        const jsonData = JSON.parse(data);
        jsonData.push(newMessage);
        fs.writeFile(path.join(__dirname, 'data', 'guestbook.json'), JSON.stringify(jsonData), err => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error writing guestbook data');
            }
            res.redirect('/guestbook');
        });
    });
});

// Renderöidään lomake AJAX-viestin lisäämistä varten
app.get('/ajaxmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'ajaxmessage.html'));
});

// Käsitellään AJAX-viestin lähetys
app.post('/ajaxmessage', (req, res) => {
    const { username, country, message } = req.body;
    if (!username || !country || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const newMessage = { username, country, message };
    fs.readFile(path.join(__dirname, 'data', 'guestbook.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error reading guestbook data' });
        }
        const jsonData = JSON.parse(data);
        jsonData.push(newMessage);
        fs.writeFile(path.join(__dirname, 'data', 'guestbook.json'), JSON.stringify(jsonData), err => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error writing guestbook data' });
            }
            res.json({ message: 'Message added successfully', newMessage });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
