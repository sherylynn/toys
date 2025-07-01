import sqlite3
import csv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from urllib.parse import unquote
import uvicorn

app = FastAPI()

# --- Database Setup ---
DB_FILE = "data.db"
category_map = {}

def setup_database():
    global category_map
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    # Drop table if it exists to ensure fresh data and schema
    cursor.execute("DROP TABLE IF EXISTS chart_data")
    # Create table with new columns
    cursor.execute('''
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
    ''')

    # Populate the database from CSV
    with open('data.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        raw_data = []
        for row in reader:
            raw_data.append({
                'category': row['category'].strip(),
                'value': row['value'],
                'hospital': row['hospital'],
                'patient_name': row['patient_name'],
                'gender': row['gender'],
                'age': row['age']
            })

    # Assign unique IDs to categories and build the map
    unique_categories = sorted(list(set([d['category'] for d in raw_data])))
    category_map = {cat: idx for idx, cat in enumerate(unique_categories)}

    to_db = []
    for d in raw_data:
        cat_id = category_map[d['category']]
        to_db.append((cat_id, d['category'], d['value'], d['hospital'], d['patient_name'], d['gender'], d['age']))

    cursor.executemany(
        "INSERT INTO chart_data (category_id, category, value, hospital, patient_name, gender, age) VALUES (?, ?, ?, ?, ?, ?, ?);",
        to_db,
    )
    conn.commit()
    conn.close()


@app.on_event("startup")
async def startup_event():
    print("Running startup event...")
    setup_database()


# --- API Endpoints ---
@app.get("/api/data")
async def get_data():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    # Aggregate data for the pie chart, returning category_id as well
    cursor.execute("SELECT category_id, category, SUM(value) as value FROM chart_data GROUP BY category_id, category")
    data = cursor.fetchall()
    conn.close()
    return [dict(row) for row in data]


@app.get("/api/details/{category_id}")
async def get_details(category_id: int):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get the category name from the category_map using the category_id
    category_name = None
    for cat, cat_id in category_map.items():
        if cat_id == category_id:
            category_name = cat
            break

    if category_name is None:
        raise HTTPException(status_code=404, detail="Category not found")

    cursor.execute("SELECT hospital, patient_name, gender, age FROM chart_data WHERE category = ?", (category_name,))
    details = cursor.fetchall()
    conn.close()
    return [dict(row) for row in details]


# --- Static Files ---
app.mount("/static", StaticFiles(directory="."), name="static")


@app.get("/")
async def read_index():
    return FileResponse('index.html')


# --- Main (for direct execution, though uvicorn is preferred) ---
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9999)