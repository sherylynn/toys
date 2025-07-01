const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const { parse } = require('fast-csv');

const app = express();
const PORT = 9999;
const DB_FILE = 'data.db';

let categoryMap = {};

// Function to set up the database
async function setupDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
            } else {
                console.log('Connected to the SQLite database.');
                db.serialize(() => {
                    // Drop table if it exists to ensure fresh data and schema
                    db.run('DROP TABLE IF EXISTS chart_data', (err) => {
                        if (err) reject(err); 
                        // Create table with new columns
                        db.run(`
                            CREATE TABLE chart_data (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                category_id INTEGER NOT NULL,
                                category TEXT NOT NULL,
                                value INTEGER NOT NULL,
                                hospital TEXT,
                                patient_name TEXT,
                                gender TEXT,
                                age INTEGER
                            )
                        `, (err) => {
                            if (err) reject(err);
                            console.log('chart_data table created or reset.');

                            const rawData = [];
                            fs.createReadStream('data.csv')
                                .pipe(parse({ headers: true }))
                                .on('data', (row) => {
                                    rawData.push({
                                        category: row.category.trim(),
                                        value: parseInt(row.value),
                                        hospital: row.hospital,
                                        patient_name: row.patient_name,
                                        gender: row.gender,
                                        age: parseInt(row.age)
                                    });
                                })
                                .on('end', () => {
                                    const uniqueCategories = [...new Set(rawData.map(d => d.category))].sort();
                                    categoryMap = {};
                                    uniqueCategories.forEach((cat, idx) => {
                                        categoryMap[cat] = idx;
                                    });

                                    const stmt = db.prepare("INSERT INTO chart_data (category_id, category, value, hospital, patient_name, gender, age) VALUES (?, ?, ?, ?, ?, ?, ?)");
                                    rawData.forEach(d => {
                                        const catId = categoryMap[d.category];
                                        stmt.run(catId, d.category, d.value, d.hospital, d.patient_name, d.gender, d.age);
                                    });
                                    stmt.finalize((err) => {
                                        if (err) reject(err);
                                        console.log('Data inserted into chart_data table.');
                                        db.close();
                                        resolve();
                                    });
                                })
                                .on('error', (err) => reject(err));
                        });
                    });
                });
            }
        });
    });
}

// API Endpoints
app.get('/api/data', (req, res) => {
    const db = new sqlite3.Database(DB_FILE);
    db.all('SELECT category_id, category, SUM(value) as value FROM chart_data GROUP BY category_id, category', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
    db.close();
});

app.get('/api/details/:category_id', (req, res) => {
    const categoryId = parseInt(req.params.category_id);
    const db = new sqlite3.Database(DB_FILE);

    let categoryName = null;
    for (const cat in categoryMap) {
        if (categoryMap[cat] === categoryId) {
            categoryName = cat;
            break;
        }
    }

    if (categoryName === null) {
        res.status(404).json({ error: 'Category not found' });
        return;
    }

    db.all('SELECT hospital, patient_name, gender, age FROM chart_data WHERE category = ?', [categoryName], (err, details) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Aggregate data for bar chart (hospital counts)
        db.all('SELECT hospital, COUNT(*) as count FROM chart_data WHERE category = ? GROUP BY hospital', [categoryName], (err, hospitalCounts) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ details, hospitalCounts });
            db.close();
        });
    });
});

// Serve static files
app.use(express.static(__dirname));

// Serve index.html for the root path
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Start the server and set up the database
setupDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`Access the application at http://bwh3.sherylynn.win:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to set up database and start server:', err);
});
