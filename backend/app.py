from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(BASE_DIR, "telemedicine.db")

# Pre-registered doctors data
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


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize the database and insert pre-registered doctors."""
    if os.path.exists(DATABASE):
        os.remove(DATABASE)
        print("Removed old telemedicine.db")

    conn = get_db()
    cursor = conn.cursor()

    print(" Creating tables...")

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

    print(" Tables created successfully.")

    
    for d in DOCTORS:
        hashed_pw = generate_password_hash(d['password'])
        cursor.execute('''
            INSERT INTO doctors (id, name, email, password, specialization, description, license, experience)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            d['id'], d['name'], d['email'], hashed_pw, d['specialization'],
            d['description'], d['license'], d['experience']
        ))

    conn.commit()
    conn.close()
    print(" Doctors inserted successfully.\nDatabase ready!")


# API ROUTES 
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if data.get('role') != 'patient':
        return jsonify({'message': 'Only patients can register'}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not all([name, email, password, phone]):
        return jsonify({'message': 'All fields are required'}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM patients WHERE email = ?', (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'message': 'Email already registered'}), 400

    hashed_pw = generate_password_hash(password)
    cursor.execute('''
        INSERT INTO patients (name, email, password, phone)
        VALUES (?, ?, ?, ?)
    ''', (name, email, hashed_pw, phone))

    conn.commit()
    conn.close()
    return jsonify({'message': 'Registration successful'}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Email and password required'}), 400

    conn = get_db()
    cursor = conn.cursor()

    # Check doctors first
    cursor.execute('SELECT * FROM doctors WHERE email = ?', (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user['password'], password):
        conn.close()
        return jsonify({'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': 'doctor'}}), 200

    # Check patients
    cursor.execute('SELECT * FROM patients WHERE email = ?', (email,))
    user = cursor.fetchone()
    if user and check_password_hash(user['password'], password):
        conn.close()
        return jsonify({'user': {'id': user['id'], 'name': user['name'], 'email': user['email'], 'role': 'patient'}}), 200

    conn.close()
    return jsonify({'message': 'Invalid credentials'}), 401


# Consultation Routes
@app.route('/api/consultations', methods=['POST'])
def create_consultation():
    data = request.json
    
    required_fields = ['patient_id', 'doctor_id', 'doctor_name', 'specialization', 
                      'symptoms', 'discharged_from', 'discharge_date']
    
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO consultations 
        (patient_id, doctor_id, doctor_name, specialization, symptoms, discharged_from, 
         discharge_date, medications, urgency, preferred_date, preferred_time)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['patient_id'],
        data['doctor_id'],
        data['doctor_name'],
        data['specialization'],
        data['symptoms'],
        data['discharged_from'],
        data['discharge_date'],
        data.get('medications', ''),
        data.get('urgency', 'normal'),
        data.get('preferred_date', ''),
        data.get('preferred_time', '')
    ))
    
    consultation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({'id': consultation_id, 'message': 'Consultation created successfully'}), 201

@app.route('/api/consultations/patient/<int:patient_id>', methods=['GET'])
def get_patient_consultations(patient_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM consultations 
        WHERE patient_id = ?
        ORDER BY created_at DESC
    ''', (patient_id,))
    
    consultations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(consultations), 200

@app.route('/api/consultations/doctor/<int:doctor_id>', methods=['GET'])
def get_doctor_consultations(doctor_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT * FROM consultations 
        WHERE doctor_id = ?
        ORDER BY created_at DESC
    ''', (doctor_id,))
    
    consultations = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(consultations), 200

@app.route('/api/consultations/<int:consultation_id>/accept', methods=['PUT'])
def accept_consultation(consultation_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE consultations 
        SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (consultation_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Consultation accepted'}), 200

@app.route('/api/consultations/<int:consultation_id>/complete', methods=['PUT'])
def complete_consultation(consultation_id):
    data = request.json
    notes = data.get('notes', '')
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE consultations 
        SET status = 'completed', notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (notes, consultation_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Consultation completed'}), 200

@app.route('/api/consultations/<int:consultation_id>/reschedule', methods=['PUT'])
def reschedule_consultation(consultation_id):
    data = request.json
    preferred_date = data.get('preferred_date')
    preferred_time = data.get('preferred_time')
    
    if not all([preferred_date, preferred_time]):
        return jsonify({'message': 'Date and time required'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        UPDATE consultations 
        SET preferred_date = ?, preferred_time = ?, status = 'pending', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    ''', (preferred_date, preferred_time, consultation_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Consultation rescheduled'}), 200


@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, specialization, description, license, experience FROM doctors')
    doctors = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(doctors), 200


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'TeleMed Care API running!'}), 200


if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        print(" No database found — initializing now...")
        init_db()
    else:
        print(" Database already exists — skipping initialization.")

    app.run( host='0.0.0.0', port=5000)
    
