import React, { useState, useEffect } from 'react';

const AddEditPatient = ({ onPatientAdded }) => {
  const [form, setForm] = useState({
    full_name: '',
    age: '',
    gender: '',
    contact_number: '',
    email: '',
    patient_code: 'PAT' + Math.floor(Math.random() * 1000000),
    ref_by: '',
    address: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    // Check for empty required fields
    const requiredFields = ['full_name', 'age', 'gender', 'contact_number', 'email', 'address'];
    for (let field of requiredFields) {
      if (!form[field] || String(form[field]).trim() === '') {
        setError('Please fill all required fields.');
        return;
      }
    }
    try {
      const res = await fetch('http://localhost:5000/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
        }),
      });
      if (res.ok) {
        setMessage('Patient added successfully!');
        setForm({
          full_name: '',
          age: '',
          gender: '',
          contact_number: '',
          email: '',
          patient_code: 'PAT' + Math.floor(Math.random() * 1000000),
          ref_by: '',
          address: '',
        });
        if (onPatientAdded) onPatientAdded();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add patient');
      }
    } catch (err) {
      setError('Failed to connect to backend');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">Add New Patient</h2>
      <p className="text-gray-600 mb-6">Enter patient details to create a new record</p>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Full Name *</label>
          <input type="text" name="full_name" value={form.full_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter patient's full name" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Age *</label>
          <input type="number" name="age" value={form.age} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter age" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Gender *</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Contact Number *</label>
          <input type="text" name="contact_number" value={form.contact_number} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter contact number" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email *</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter email address" required />
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Patient Code *</label>
          <input type="text" name="patient_code" value={form.patient_code} readOnly className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1">REF. BY</label>
          <input type="text" name="ref_by" value={form.ref_by} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Dr. Name / Self / Clinic Name" />
          <span className="text-xs text-gray-400">Leave empty for "Self" referral</span>
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1">Address *</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter complete address" rows={2} required></textarea>
        </div>
        <div className="md:col-span-2 flex gap-4 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700">Save Patient</button>
          <button type="reset" className="border px-8 py-2 rounded hover:bg-gray-100" onClick={() => { setForm({
            full_name: '',
            age: '',
            gender: '',
            contact_number: '',
            email: '',
            patient_code: 'PAT' + Math.floor(Math.random() * 1000000),
            ref_by: '',
            address: '',
          }); setMessage(''); setError(''); }}>Clear Form</button>
        </div>
        <div className="md:col-span-2 mt-2">
          {message && <div className="text-green-600 font-semibold">{message}</div>}
          {error && <div className="text-red-600 font-semibold">{error}</div>}
        </div>
      </form>
    </div>
  );
};

const PatientList = ({ refreshFlag }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/patients');
        if (!res.ok) throw new Error('Failed to fetch patients');
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        setError('Could not load patients');
      }
      setLoading(false);
    };
    fetchPatients();
  }, [refreshFlag]);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.patient_code.toLowerCase().includes(q) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      (p.ref_by && p.ref_by.toLowerCase().includes(q))
    );
  });

  const handleEdit = (p) => {
    setEditPatient(p.id);
    setEditForm({ ...p });
    setEditError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  const handleEditSave = async () => {
    setEditError('');
    // Validate required fields
    const requiredFields = ['full_name', 'age', 'gender', 'contact_number', 'email', 'address'];
    for (let field of requiredFields) {
      if (!editForm[field] || String(editForm[field]).trim() === '') {
        setEditError('Please fill all required fields.');
        return;
      }
    }
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${editPatient}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, age: Number(editForm.age) }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.message || 'Failed to update patient');
        return;
      }
      setEditPatient(null);
      setEditForm(null);
      setEditError('');
      // Refresh
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      setEditError('Failed to connect to backend');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeletingId(null);
      // Refresh
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      setDeletingId(null);
      alert('Failed to delete patient');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (patients.length === 0) return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
      <span className="text-5xl text-gray-300 mb-4">👥</span>
      <div className="text-xl font-semibold text-gray-500 mb-2">No patients found.</div>
      <div className="text-gray-400">Add patients to see them here.</div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">Patient List</h2>
      <input
        className="mb-4 w-full border rounded px-3 py-2"
        placeholder="Search patients by name, code, email, or referral..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Patient Code</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Age</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">Contact</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">REF. BY</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="even:bg-gray-50">
                {editPatient === p.id ? (
                  <>
                    <td className="px-4 py-2 border">{p.patient_code}</td>
                    <td className="px-4 py-2 border"><input className="border rounded px-2 py-1 w-24" name="full_name" value={editForm.full_name} onChange={handleEditChange} /></td>
                    <td className="px-4 py-2 border"><input className="border rounded px-2 py-1 w-12" name="age" value={editForm.age} onChange={handleEditChange} type="number" /></td>
                    <td className="px-4 py-2 border">
                      <select name="gender" value={editForm.gender} onChange={handleEditChange} className="border rounded px-2 py-1">
                        <option value="male">male</option>
                        <option value="female">female</option>
                        <option value="other">other</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 border"><input className="border rounded px-2 py-1 w-24" name="contact_number" value={editForm.contact_number} onChange={handleEditChange} /></td>
                    <td className="px-4 py-2 border"><input className="border rounded px-2 py-1 w-32" name="email" value={editForm.email} onChange={handleEditChange} /></td>
                    <td className="px-4 py-2 border"><input className="border rounded px-2 py-1 w-20" name="ref_by" value={editForm.ref_by} onChange={handleEditChange} /></td>
                    <td className="px-4 py-2 border flex gap-2 items-center">
                      <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={handleEditSave} title="Save"><span>✔️</span></button>
                      <button className="bg-gray-300 text-gray-700 px-2 py-1 rounded" onClick={() => setEditPatient(null)} title="Cancel"><span>✖️</span></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2 border">{p.patient_code}</td>
                    <td className="px-4 py-2 border font-bold">{p.full_name}</td>
                    <td className="px-4 py-2 border">{p.age}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${p.gender === 'female' ? 'bg-pink-100 text-pink-700' : p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>{p.gender}</span>
                    </td>
                    <td className="px-4 py-2 border">{p.contact_number}</td>
                    <td className="px-4 py-2 border">{p.email}</td>
                    <td className="px-4 py-2 border"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{p.ref_by}</span></td>
                    <td className="px-4 py-2 border flex gap-2 items-center">
                      <button className="bg-white border px-2 py-1 rounded" onClick={() => handleEdit(p)} title="Edit"><span role="img" aria-label="edit">✏️</span></button>
                      <button className="bg-white border px-2 py-1 rounded text-red-600" disabled={deletingId === p.id} onClick={() => handleDelete(p.id)} title="Delete"><span role="img" aria-label="delete">🗑️</span></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {editError && <div className="text-red-600 mt-2">{editError}</div>}
      </div>
    </div>
  );
};

const Patients = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const handlePatientAdded = () => setRefreshFlag(f => f + 1);

  return (
    <div className="p-8 ml-64">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('add')}
        >
          Add/Edit Patient
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('list')}
        >
          Patient List
        </button>
      </div>
      {activeTab === 'add' ? <AddEditPatient onPatientAdded={handlePatientAdded} /> : <PatientList refreshFlag={refreshFlag} />}
    </div>
  );
};

export default Patients;
