import React, { useState, useEffect } from 'react';

// Test catalog (biochemistry, hematology, microbiology, urine/stool)
const TEST_CATALOG = [
  // Biochemistry
  { category: 'Biochemistry', name: 'Fasting Blood Sugar (FBS)', unit: 'mg/dL', ref: '70–110' },
  { category: 'Biochemistry', name: 'Postprandial Blood Sugar (PPBS)', unit: 'mg/dL', ref: '110–160' },
  { category: 'Biochemistry', name: 'Random Blood Sugar (RBS)', unit: 'mg/dL', ref: '70–140' },
  { category: 'Biochemistry', name: 'HbA1c', unit: '%', ref: '4.4–6.7' },
  { category: 'Biochemistry', name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', ref: '25–40' },
  { category: 'Biochemistry', name: 'Serum Creatinine', unit: 'mg/dL', ref: '0.6–1.5' },
  { category: 'Biochemistry', name: 'Uric Acid', unit: 'mg/dL', ref: 'M: 3.5–7.2; F: 2.6–6.0' },
  { category: 'Biochemistry', name: 'Total Bilirubin', unit: 'mg/dL', ref: '0–1.2' },
  { category: 'Biochemistry', name: 'Direct Bilirubin', unit: 'mg/dL', ref: '0–0.2' },
  { category: 'Biochemistry', name: 'Indirect Bilirubin', unit: 'mg/dL', ref: '0.1–1.1' },
  { category: 'Biochemistry', name: 'SGOT (AST)', unit: 'U/L', ref: '8–40' },
  { category: 'Biochemistry', name: 'SGPT (ALT)', unit: 'U/L', ref: '8–40' },
  { category: 'Biochemistry', name: 'Alkaline Phosphatase (ALP)', unit: 'U/L', ref: '108–306' },
  { category: 'Biochemistry', name: 'Gamma GT (GGT)', unit: 'U/L', ref: 'Up to 60' },
  { category: 'Biochemistry', name: 'Total Protein', unit: 'g/dL', ref: '6–8' },
  { category: 'Biochemistry', name: 'Albumin', unit: 'g/dL', ref: '3.5–5.5' },
  { category: 'Biochemistry', name: 'Globulin', unit: 'g/dL', ref: '2.5–3.5' },
  { category: 'Biochemistry', name: 'A/G Ratio', unit: 'Ratio', ref: '1.2–2.2' },
  { category: 'Biochemistry', name: 'Calcium (Total)', unit: 'mg/dL', ref: '8.5–10.5' },
  { category: 'Biochemistry', name: 'Phosphorus', unit: 'mg/dL', ref: '2.5–5.0' },
  { category: 'Biochemistry', name: 'Sodium', unit: 'mEq/L', ref: '135–145' },
  { category: 'Biochemistry', name: 'Potassium', unit: 'mEq/L', ref: '3.5–5.0' },
  { category: 'Biochemistry', name: 'Chloride', unit: 'mEq/L', ref: '98–119' },
  { category: 'Biochemistry', name: 'Lipid Profile', unit: '-', ref: 'Varies per component' },
  { category: 'Biochemistry', name: 'Amylase', unit: 'U/L', ref: 'Up to 85' },
  { category: 'Biochemistry', name: 'Lipase', unit: 'U/L', ref: 'Up to 200' },
  // Hematology
  { category: 'Hematology', name: 'Hemoglobin (Hb)', unit: 'g/dL', ref: 'M: 13–16; F: 11.5–14.5' },
  { category: 'Hematology', name: 'Total Leukocyte Count (TLC)', unit: 'x10³/μL', ref: '4–11' },
  { category: 'Hematology', name: 'Red Blood Cell Count (RBC)', unit: 'x10⁶/μL', ref: 'M: 4.5–6.0; F: 4.0–4.5' },
  { category: 'Hematology', name: 'Packed Cell Volume (PCV)', unit: '%', ref: 'M: 42–52; F: 36–48' },
  { category: 'Hematology', name: 'Mean Corpuscular Volume (MCV)', unit: 'fL', ref: '82–92' },
  { category: 'Hematology', name: 'Mean Corpuscular Hemoglobin (MCH)', unit: 'pg', ref: '27–32' },
  { category: 'Hematology', name: 'Mean Corpuscular Hemoglobin Concentration (MCHC)', unit: 'g/dL', ref: '32–36' },
  { category: 'Hematology', name: 'Differential Leukocyte Count (DLC)', unit: '%', ref: 'Neutrophils: 40–75; Lymphocytes: 20–45; Monocytes: 2–8; Eosinophils: 1–6; Basophils: 0–1' },
  { category: 'Hematology', name: 'Erythrocyte Sedimentation Rate (ESR)', unit: 'mm/hr', ref: 'M: up to 15; F: up to 20' },
  { category: 'Hematology', name: 'Reticulocyte Count', unit: '%', ref: 'Adult: 0.5–2; Infant: 2–6' },
  { category: 'Hematology', name: 'Bleeding Time', unit: 'minutes', ref: '2–7' },
  { category: 'Hematology', name: 'Clotting Time', unit: 'minutes', ref: '4–9' },
  { category: 'Hematology', name: 'Prothrombin Time (PT)', unit: 'seconds', ref: '10–14' },
  { category: 'Hematology', name: 'International Normalized Ratio (INR)', unit: 'Ratio', ref: '<1.1' },
  { category: 'Hematology', name: 'Activated Partial Thromboplastin Time (APTT)', unit: 'seconds', ref: '30–40' },
  // Microbiology & Serology
  { category: 'Microbiology', name: 'Widal Test', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'HIV Test', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'HCV Test', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'HBsAg Test', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'Dengue NS1 Antigen', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'Dengue IgG/IgM', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'Malaria Parasite Test', unit: '-', ref: 'Negative' },
  { category: 'Microbiology', name: 'Mantoux Test', unit: 'mm', ref: '<5 mm (negative)' },
  // Urine and Stool
  { category: 'Urine/Stool', name: 'Urine Routine Examination', unit: '-', ref: 'Normal' },
  { category: 'Urine/Stool', name: 'Urine Pregnancy Test', unit: '-', ref: 'Negative' },
  { category: 'Urine/Stool', name: 'Stool Routine Examination', unit: '-', ref: 'Normal' },
];

const AddTestResults = ({ onTestAdded }) => {
  const [tests, setTests] = useState([
    { testName: '', value: '', normalRange: '', unit: '' },
  ]);
  const [patient, setPatient] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const res = await fetch('http://localhost:5000/api/patients');
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (e) {
        setPatients([]);
      }
      setLoadingPatients(false);
    };
    fetchPatients();
  }, []);

  const categoryOptions = [
    ...Array.from(new Set(TEST_CATALOG.map(tc => tc.category))).map(cat => ({ value: cat, label: cat }))
  ];

  const handleTestChange = (idx, field, value) => {
    setTests((prev) => prev.map((t, i) => {
      if (i !== idx) return t;
      if (field === 'testName') {
        const found = TEST_CATALOG.find(tc => tc.name === value);
        return {
          ...t,
          testName: value,
          unit: found ? found.unit : '',
          normalRange: found ? found.ref : '',
        };
      }
      return { ...t, [field]: value };
    }));
  };

  const addTestRow = () => {
    setTests([...tests, { testName: '', value: '', normalRange: '', unit: '' }]);
  };

  const removeTestRow = (idx) => {
    setTests(tests.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!patient || !category || tests.some(t => !t.testName || !t.value)) {
      setError('Please fill all required fields.');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          category,
          tests,
          notes,
        }),
      });
      if (res.ok) {
        setMessage('Test results saved successfully!');
        setTests([{ testName: '', value: '', normalRange: '', unit: '' }]);
        setPatient('');
        setCategory('');
        setNotes('');
        if (onTestAdded) onTestAdded();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to save test results');
      }
    } catch (err) {
      setError('Failed to connect to backend');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">Add Test Results</h2>
      <p className="text-gray-600 mb-6">Enter laboratory test results for a patient</p>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Patient *</label>
          <select className="w-full border rounded px-3 py-2" value={patient} onChange={e => setPatient(e.target.value)} required>
            <option value="">{loadingPatients ? 'Loading...' : 'Select a patient'}</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Test Category *</label>
          <select className="w-full border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select test category</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <div className="bg-gray-50 border rounded p-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            {tests.map((test, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Test Name *</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={test.testName}
                    onChange={e => handleTestChange(idx, 'testName', e.target.value)}
                    required
                  >
                    <option value="">Select test name</option>
                    {TEST_CATALOG.map(tc => (
                      <option key={tc.name} value={tc.name}>{tc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Value *</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 14.5"
                    value={test.value}
                    onChange={e => handleTestChange(idx, 'value', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Normal Range</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 12-16"
                    value={test.normalRange}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., g/dL"
                    value={test.unit}
                    readOnly
                  />
                </div>
                <div className="flex items-center mt-6">
                  {tests.length > 1 && (
                    <button type="button" className="text-red-500 hover:text-red-700 ml-2" onClick={() => removeTestRow(idx)}>
                      <span role="img" aria-label="delete">🗑️</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-4">
              <button type="button" className="flex items-center px-4 py-2 bg-gray-100 rounded hover:bg-gray-200" onClick={addTestRow}>
                <span className="mr-2 text-lg font-bold">+</span> Add Test
              </button>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1 mt-4">Additional Notes</label>
          <textarea className="w-full border rounded px-3 py-2" placeholder="Any additional notes or observations..." rows={2} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
        </div>
        <div className="md:col-span-2 flex gap-4 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700">Save Test Results</button>
          <button type="reset" className="border px-8 py-2 rounded hover:bg-gray-100" onClick={() => { setTests([{ testName: '', value: '', normalRange: '', unit: '' }]); setPatient(''); setCategory(''); setNotes(''); setMessage(''); setError(''); }}>Clear Form</button>
        </div>
        <div className="md:col-span-2 mt-2">
          {message && <div className="text-green-600 font-semibold">{message}</div>}
          {error && <div className="text-red-600 font-semibold">{error}</div>}
        </div>
      </form>
    </div>
  );
};

const TestHistory = ({ refreshFlag }) => {
  const [testResults, setTestResults] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [testRes, patientRes] = await Promise.all([
          fetch('http://localhost:5000/api/tests'),
          fetch('http://localhost:5000/api/patients'),
        ]);
        if (!testRes.ok || !patientRes.ok) throw new Error('Failed to fetch data');
        const testData = await testRes.json();
        const patientData = await patientRes.json();
        setTestResults(testData);
        setPatients(patientData);
      } catch (err) {
        setError('Could not load test history');
      }
      setLoading(false);
    };
    fetchData();
  }, [refreshFlag]);

  const getPatientName = (id) => {
    const p = patients.find(p => p.id === id);
    return p ? p.full_name : 'Unknown';
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (testResults.length === 0) return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center">
      <span className="text-5xl text-gray-300 mb-4">🧪</span>
      <div className="text-xl font-semibold text-gray-500 mb-2">No test history found.</div>
      <div className="text-gray-400">Add test results to see them here.</div>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold mb-2">Test History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">#</th>
              <th className="px-4 py-2 border">Patient</th>
              <th className="px-4 py-2 border">Category</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Tests</th>
              <th className="px-4 py-2 border">Notes</th>
            </tr>
          </thead>
          <tbody>
            {testResults.map((tr, idx) => (
              <tr key={tr.id} className="even:bg-gray-50">
                <td className="px-4 py-2 border">{idx + 1}</td>
                <td className="px-4 py-2 border">{getPatientName(tr.patient_id)}</td>
                <td className="px-4 py-2 border">{tr.category}</td>
                <td className="px-4 py-2 border">{tr.timestamp ? new Date(tr.timestamp).toLocaleString() : ''}</td>
                <td className="px-4 py-2 border">
                  <ul>
                    {tr.tests.map((t, i) => (
                      <li key={i}>
                        <b>{t.testName}</b>: {t.value} {t.unit} <span className="text-xs text-gray-500">(Normal: {t.normalRange})</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2 border">{tr.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Test = () => {
  const [activeTab, setActiveTab] = useState('add');
  const [refreshFlag, setRefreshFlag] = useState(0);
  const handleTestAdded = () => setRefreshFlag(f => f + 1);

  return (
    <div className="p-8 ml-64">
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('add')}
        >
          Add Test Results
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          onClick={() => setActiveTab('history')}
        >
          Test History
        </button>
      </div>
      {activeTab === 'add' ? <AddTestResults onTestAdded={handleTestAdded} /> : <TestHistory refreshFlag={refreshFlag} />}
    </div>
  );
};

export default Test;
