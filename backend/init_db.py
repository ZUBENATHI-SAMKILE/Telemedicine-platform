"""
Database initialization script for TeleMed Care
Run this to reset or recreate the database.
"""

import sqlite3
from werkzeug.security import generate_password_hash
import os
from datetime import datetime

# === CONFIGURATION ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "telemedicine.db")

DOCTORS = [
    {
        'id': 101,
        'name': 'Dr. Sarah Johnson',
        'email': 'sarah.johnson@telemed.com',
        'password': 'doctor123',
        'specialization': 'Cardiology',
        'description': 'Heart conditions, blood pressure, chest pain, cardiovascular diseases',
        'license': 'MD-12345',
        'experience': '15 years'
    },
    {
        'id': 102,
        'name': 'Dr. Michael Chen',
        'email': 'michael.chen@telemed.com',
        'password': 'doctor123',
        'specialization': 'General Surgery',
        'description': 'Post-operative care, wound complications, surgical follow-ups',
        'license': 'MD-12346',
        'experience': '12 years'
    },
    {
        'id': 103,
        'name': 'Dr. Emily Rodriguez',
        'email': 'emily.rodriguez@telemed.com',
        'password': 'doctor123',
        'specialization': 'Internal Medicine',
        'description': 'Diabetes, infections, general health concerns, chronic diseases',
        'license': 'MD-12347',
        'experience': '10 years'
    },
    {
        'id': 104,
        'name': 'Dr. David Thompson',
        'email': 'david.thompson@telemed.com',
        'password': 'doctor123',
        'specialization': 'Orthopedics',
        'description': 'Bone fractures, joint pain, mobility issues, post-surgery rehabilitation',
        'license': 'MD-12348',
        'experience': '18 years'
    },
    {
        'id': 105,
        'name': 'Dr. Lisa Patel',
        'email': 'lisa.patel@telemed.com',
        'password': 'doctor123',
        'specialization': 'Pulmonology',
        'description': 'Breathing problems, lung conditions, respiratory infections, COPD',
        'license': 'MD-12349',
        'experience': '14 years'
    }
]

def init_database():
    """Initialize the database with tables and pre-registered doctors."""
    # Remove existing database
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
        print(f"🗑️ Removed existing database: {DATABASE}")
    
    # Create connection
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    print("⚙️ Creating tables...")

    # === PATIENTS TABLE ===
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("✓ Created patients table")

    # === DOCTORS TABLE ===
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            specialization TEXT NOT NULL,
            description TEXT,
            license TEXT,
            experience TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("✓ Created doctors table")

    # === CONSULTATIONS TABLE ===
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            doctor_id INTEGER NOT NULL,
            doctor_name TEXT NOT NULL,
            specialization TEXT NOT NULL,
            symptoms TEXT NOT NULL,
            discharged_from TEXT NOT NULL,
            discharge_date TEXT NOT NULL,
            medications TEXT,
            urgency TEXT DEFAULT 'normal',
            preferred_date TEXT,
            preferred_time TEXT,
            status TEXT DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients (id),
            FOREIGN KEY (doctor_id) REFERENCES doctors (id)
        )
    ''')
    print("✓ Created consultations table")

    # === INSERT DEFAULT DOCTORS ===
    print("\n🩺 Inserting pre-registered doctors...")
    for doctor in DOCTORS:
        hashed_pw = generate_password_hash(doctor['password'])
        cursor.execute('''
            INSERT INTO doctors (id, name, email, password, specialization, description, license, experience)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            doctor['id'],
            doctor['name'],
            doctor['email'],
            hashed_pw,
            doctor['specialization'],
            doctor['description'],
            doctor['license'],
            doctor['experience']
        ))
        print(f"  ✓ {doctor['name']} ({doctor['specialization']}) added")

    conn.commit()
    conn.close()

    print("\n" + "="*60)
    print("🎉 Database initialized successfully!")
    print("="*60)
    print("\nRegistered Doctors:")
    print("-" * 60)
    for d in DOCTORS:
        print(f"{d['name']} — {d['specialization']}")
        print(f"   Email: {d['email']}")
        print(f"   Password: {d['password']}")
        print()

if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"\n❌ Error initializing database: {e}")
# === END OF FILE ===