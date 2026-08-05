const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Specific shortcut for /cpn so it always maps correctly
app.get('/cpn', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cpn-packages.html'));
});

// This automatically handles all other pages (tradelines, blogs, contact, etc.)
app.get('/:page', (req, res, next) => {
    const pageName = req.params.page;
    const filePath = path.join(__dirname, 'public', `${pageName}.html`);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            next();
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
