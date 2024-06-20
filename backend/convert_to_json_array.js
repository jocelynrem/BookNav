const fs = require('fs');

// Read the file
fs.readFile('books.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    // Add brackets around the content to make it a JSON array
    const jsonArray = `[${data.split('\n').filter(line => line.trim() !== '').join(',')}]`;

    // Write the updated content back to the file
    fs.writeFile('books_array.json', jsonArray, 'utf8', (err) => {
        if (err) {
            console.error('Error writing the file:', err);
            return;
        }
        console.log('File successfully updated to JSON array format.');
    });
});
