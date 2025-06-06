from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Patient, TestResult, Company

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///patients.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

def create_tables():
    with app.app_context():
        db.create_all()

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.json
    print('Received data:', data)  # Log incoming data
    required_fields = ['full_name', 'age', 'gender', 'contact_number', 'email', 'patient_code', 'address']
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            return jsonify({'message': f'Missing or empty required field: {field}'}), 400
    # Check for unique patient_code
    if Patient.query.filter_by(patient_code=data['patient_code']).first():
        return jsonify({'message': 'Patient code must be unique'}), 400
    try:
        patient = Patient(
            full_name=data['full_name'],
            age=data['age'],
            gender=data['gender'],
            contact_number=data['contact_number'],
            email=data['email'],
            patient_code=data['patient_code'],
            ref_by=data.get('ref_by', ''),
            address=data['address']
        )
        db.session.add(patient)
        db.session.commit()
        return jsonify({'message': 'Patient added successfully'}), 201
    except Exception as e:
        print('Error saving patient:', e)
        db.session.rollback()
        return jsonify({'message': 'Failed to add patient'}), 400

@app.route('/api/patients', methods=['GET'])
def get_patients():
    patients = Patient.query.all()
    result = []
    for p in patients:
        result.append({
            'id': p.id,
            'full_name': p.full_name,
            'age': p.age,
            'gender': p.gender,
            'contact_number': p.contact_number,
            'email': p.email,
            'patient_code': p.patient_code,
            'ref_by': p.ref_by,
            'address': p.address
        })
    return jsonify(result)

@app.route('/api/patients/<int:id>', methods=['PUT'])
def update_patient(id):
    data = request.json
    patient = Patient.query.get(id)
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404
    for field in ['full_name', 'age', 'gender', 'contact_number', 'email', 'ref_by', 'address']:
        if field in data:
            setattr(patient, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Patient updated successfully'})

@app.route('/api/patients/<int:id>', methods=['DELETE'])
def delete_patient(id):
    patient = Patient.query.get(id)
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404
    db.session.delete(patient)
    db.session.commit()
    return jsonify({'message': 'Patient deleted successfully'})

@app.route('/api/tests', methods=['POST'])
def add_test_result():
    data = request.json
    test_result = TestResult(
        patient_id=data['patient'],
        category=data['category'],
        tests=data['tests'],
        notes=data.get('notes', '')
    )
    db.session.add(test_result)
    db.session.commit()
    return jsonify({'message': 'Test results saved successfully'}), 201

@app.route('/api/tests', methods=['GET'])
def get_test_results():
    results = TestResult.query.order_by(TestResult.timestamp.desc()).all()
    out = []
    for r in results:
        out.append({
            'id': r.id,
            'patient_id': r.patient_id,
            'category': r.category,
            'tests': r.tests,
            'notes': r.notes,
            'timestamp': r.timestamp.isoformat() if r.timestamp else None
        })
    return jsonify(out)

@app.route('/api/tests/patient/<int:patient_id>', methods=['GET'])
def get_tests_by_patient(patient_id):
    results = TestResult.query.filter_by(patient_id=patient_id).order_by(TestResult.timestamp.desc()).all()
    out = []
    for r in results:
        out.append({
            'id': r.id,
            'patient_id': r.patient_id,
            'category': r.category,
            'tests': r.tests,
            'notes': r.notes,
            'timestamp': r.timestamp.isoformat() if r.timestamp else None
        })
    return jsonify(out)

@app.route('/api/companies', methods=['POST'])
def add_company():
    data = request.json
    if not data.get('name'):
        return jsonify({'message': 'Company name is required'}), 400
    # Check for unique name
    if Company.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Company name must be unique'}), 400
    company = Company(
        name=data['name'],
        address=data.get('address', ''),
        phone=data.get('phone', ''),
        email=data.get('email', '')
    )
    db.session.add(company)
    db.session.commit()
    return jsonify({'message': 'Company added successfully', 'id': company.id}), 201

@app.route('/api/companies', methods=['GET'])
def get_companies():
    companies = Company.query.all()
    out = []
    for c in companies:
        out.append({
            'id': c.id,
            'name': c.name,
            'address': c.address,
            'phone': c.phone,
            'email': c.email
        })
    return jsonify(out)

if __name__ == '__main__':
    create_tables()
    app.run(debug=True) 