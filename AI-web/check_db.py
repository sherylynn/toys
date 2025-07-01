import sqlite3

DB_FILE = "data.db"

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

cursor.execute("SELECT * FROM chart_data")
rows = cursor.fetchall()

for row in rows:
    print(row)

conn.close()
