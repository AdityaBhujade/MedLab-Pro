import React, { useState, useEffect, useRef } from 'react';

const Reports = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef();
  const [testResults, setTestResults] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/patients');
        if (res.ok) {
          setPatients(await res.json());
        }
      } catch (e) {
        setPatients([]);
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatient) {
      setTestResults([]);
      return;
    }
    const fetchTests = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tests/patient/${selectedPatient}`);
        if (res.ok) {
          setTestResults(await res.json());
        } else {
          setTestResults([]);
        }
      } catch (e) {
        setTestResults([]);
      }
    };
    fetchTests();
  }, [selectedPatient]);

  const patientObj = patients.find(p => String(p.id) === String(selectedPatient));

  // Print handler: show preview modal, then print only the report content
  const handlePrint = async () => {
    // Send company details to backend
    try {
      await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: company,
          address,
          phone,
          email
        })
      });
    } catch (e) {}
    setShowPreview(true);
  };

  // Print only the report content
  const handlePrintReport = () => {
    // Increment reports generated count
    try {
      let count = parseInt(localStorage.getItem('reportsGenerated') || '0', 10);
      localStorage.setItem('reportsGenerated', String(count + 1));
    } catch (e) {}
    if (!previewRef.current) return;
    const printContents = previewRef.current.innerHTML;
    const win = window.open('', '', 'height=900,width=800');
    win.document.write('<html><head><title>Lab Report</title>');
    win.document.write('<style>@media print { body { margin: 0; } .report-content { width: 210mm; min-height: 297mm; padding: 24px; box-sizing: border-box; } }</style>');
    win.document.write('</head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  // PDF generation using html2pdf.js
  const handleDownloadPDF = () => {
    // Increment reports generated count
    try {
      let count = parseInt(localStorage.getItem('reportsGenerated') || '0', 10);
      localStorage.setItem('reportsGenerated', String(count + 1));
    } catch (e) {}
    if (!previewRef.current) return;
    // Find the report-content div inside the preview
    const reportDiv = previewRef.current.querySelector('.report-content') || previewRef.current;
    import('html2pdf.js').then(html2pdf => {
      html2pdf.default(reportDiv, {
        margin: 0.5,
        filename: 'Lab_Report.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      });
    });
  };

  // Email/WhatsApp confirmation
  const handleEmail = async () => {
    if (!patientObj) return;
    if (window.confirm(`Send this report to patient's email: ${patientObj.email}?`)) {
      try {
        // Generate PDF first
        const reportDiv = previewRef.current.querySelector('.report-content') || previewRef.current;
        const pdfBlob = await import('html2pdf.js').then(html2pdf => 
          html2pdf.default(reportDiv, {
            margin: 0.5,
            filename: 'Lab_Report.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          }).output('blob')
        );

        // Create form data
        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'Lab_Report.pdf');
        formData.append('email', patientObj.email);
        formData.append('patientName', patientObj.full_name);

        // Send to backend
        const response = await fetch('http://localhost:5000/api/send-email', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          alert('Report has been sent to the patient\'s email successfully!');
        } else {
          throw new Error('Failed to send email');
        }
      } catch (error) {
        alert('Failed to send email. Please try again later.');
        console.error('Email error:', error);
      }
    }
  };

  const handleWhatsApp = async () => {
    if (!patientObj) return;
    if (window.confirm(`Send this report to patient's WhatsApp: ${patientObj.contact_number}?`)) {
      try {
        // Generate PDF first
        const reportDiv = previewRef.current.querySelector('.report-content') || previewRef.current;
        const pdfBlob = await import('html2pdf.js').then(html2pdf => 
          html2pdf.default(reportDiv, {
            margin: 0.5,
            filename: 'Lab_Report.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          }).output('blob')
        );

        // Create form data
        const formData = new FormData();
        formData.append('pdf', pdfBlob, 'Lab_Report.pdf');
        formData.append('phone', patientObj.contact_number);
        formData.append('patientName', patientObj.full_name);

        // Send to backend
        const response = await fetch('http://localhost:5000/api/send-whatsapp', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          alert('Report has been sent to the patient\'s WhatsApp successfully!');
        } else {
          throw new Error('Failed to send WhatsApp message');
        }
      } catch (error) {
        alert('Failed to send WhatsApp message. Please try again later.');
        console.error('WhatsApp error:', error);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!selectedPatient) {
      setError('Please select a patient first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate PDF
      const pdfBlob = await generatePDF();
      const formData = new FormData();
      formData.append('pdf', pdfBlob, 'report.pdf');
      formData.append('email', selectedPatient.email);
      formData.append('patientName', selectedPatient.name);
      formData.append('companyEmail', 'your-company-email@example.com'); // Replace with your company email

      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      // Show success message in a modal
      setShowSuccessModal(true);
      setSuccessMessage(data.details || 'Email sent successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Report preview component styled as in the image
  const ReportPreview = React.forwardRef(function ReportPreview(props, ref) {
    if (!patientObj) return null;
    const now = new Date();
    // Helper to flatten all test rows
    const allTests = testResults.flatMap(tr => (tr.tests || []).map(t => ({
      ...t,
      category: tr.category,
      notes: tr.notes,
      timestamp: tr.timestamp,
    })));
    return (
      <div ref={ref} className="report-content" style={{ background: '#fff', color: '#222', width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif', margin: '0 auto', padding: 24, boxSizing: 'border-box' }}>
        {/* Company Info at the top */}
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ color: '#1976d2', fontWeight: 'bold', fontSize: 28, margin: 0 }}>{company || 'Company Name'}</h2>
            <div style={{ fontSize: 16, color: '#222', marginBottom: 2 }}>{address}</div>
            <div style={{ fontSize: 16, color: '#222', marginBottom: 2 }}>Phone: {phone}</div>
            <div style={{ fontSize: 16, color: '#222' }}>Email: {email}</div>
          </div>
          <div style={{ background: '#e3f2fd', color: '#1976d2', borderRadius: 8, padding: '8px 16px', fontWeight: 'bold', fontSize: 14, textAlign: 'right' }}>
            NABL Accredited<br />ISO 15189:2012<br />CAP Certified
          </div>
        </div>
        <hr style={{ margin: '16px 0 8px 0', border: 'none', borderTop: '2px solid #1976d2' }} />
        <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 22, margin: '16px 0' }}>LABORATORY INVESTIGATION REPORT</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0' }}>
          <div style={{ flex: 1, marginRight: 16 }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: 8 }}>PATIENT INFORMATION</h4>
            <div><b>Name:</b> {patientObj.full_name}</div>
            <div><b>Age/Sex:</b> {patientObj.age} Years / {patientObj.gender && patientObj.gender[0].toUpperCase()}</div>
            <div><b>Patient ID:</b> {patientObj.patient_code}</div>
            <div><b>Contact:</b> {patientObj.contact_number}</div>
          </div>
          <div style={{ flex: 1, background: '#f7f7f7', padding: 12, borderRadius: 8 }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: 8 }}>REPORT DETAILS</h4>
            <div><b>Report Date:</b> {now.toLocaleDateString()}</div>
            <div><b>Report Time:</b> {now.toLocaleTimeString()}</div>
            <div><b>REF. BY:</b> {patientObj.ref_by}</div>
            <div><b>Lab Ref No:</b> LAB{Math.floor(Math.random() * 1000000)}</div>
          </div>
        </div>
        <div style={{ background: '#eaf2fb', padding: 8, fontWeight: 'bold', fontSize: 16, marginBottom: 0, borderLeft: '4px solid #1976d2' }}>URINE TESTS PROFILE</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#f7f7f7' }}>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>TEST NAME</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>RESULT</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>UNIT</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>REFERENCE RANGE</th>
              <th style={{ border: '1px solid #ccc', padding: 8 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {allTests.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16 }}>No test results found for this patient.</td></tr>
            ) : (
              allTests.map((t, idx) => {
                // Determine status (High/Low/Normal)
                let status = 'Normal', arrow = '', color = '#388e3c';
                let value = parseFloat(t.value);
                let refRange = t.normalRange || t.ref || '';
                let min = null, max = null;
                if (refRange && refRange.includes('–')) {
                  const [minStr, maxStr] = refRange.split('–');
                  min = parseFloat(minStr);
                  max = parseFloat(maxStr);
                } else if (refRange && refRange.startsWith('<')) {
                  max = parseFloat(refRange.replace(/[^0-9.\-]/g, ''));
                } else if (refRange && refRange.startsWith('>')) {
                  min = parseFloat(refRange.replace(/[^0-9.\-]/g, ''));
                }
                if (min !== null && value < min) {
                  status = 'Low'; arrow = '↓'; color = '#d32f2f';
                } else if (max !== null && value > max) {
                  status = 'High'; arrow = '↑'; color = '#d32f2f';
                }
                return (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.testName || t.name}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, color }}>{t.value} {arrow}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{t.unit}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{refRange}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, color, fontWeight: 'bold' }}>{status}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div style={{ background: '#fffbe6', borderLeft: '4px solid #ffeb3b', padding: 16, marginBottom: 16 }}>
          <b>CLINICAL INTERPRETATION</b>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Values marked with ↑ (High) or ↓ (Low) are outside the reference range</li>
            <li>Reference ranges may vary based on age, gender, and laboratory methodology</li>
            <li>Please correlate with clinical findings and consult your physician for interpretation</li>
          </ul>
        </div>
        <div style={{ marginTop: 32, fontSize: 14 }}>
          <div>Lab Director: Dr. Sarah Johnson, MD<br />Pathologist & Laboratory Director</div>
          <div style={{ float: 'right', textAlign: 'right' }}>
            This is a computer generated report<br />
            Report generated on: {now.toLocaleDateString()}, {now.toLocaleTimeString()}
          </div>
        </div>
        <div style={{ clear: 'both', marginTop: 32, fontSize: 12, color: '#555', background: '#f7f7f7', padding: 12, borderRadius: 8 }}>
          <b>IMPORTANT MEDICAL DISCLAIMER:</b><br />
          This report contains confidential medical information. The results should be interpreted by a qualified healthcare professional in conjunction with clinical history and other diagnostic tests. Normal values may vary between laboratories due to differences in equipment, reagents, and methodologies. For any queries regarding this report, please contact our laboratory at the above mentioned contact details.
        </div>
      </div>
    );
  });

  return (
    <div className="p-8 ml-64">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Professional Medical Reports</h1>
      <p className="text-gray-600 mb-6">Generate and share professional diagnostic reports with PDF attachments</p>
      {/* Generate Medical Report Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold mb-1">Generate Medical Report</h2>
        <p className="text-gray-600 mb-4">Select a patient to generate their professional laboratory report</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Company Name</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={company} onChange={e => setCompany(e.target.value)} placeholder="Enter company name" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Address</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter address" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email address" />
          </div>
        </div>
        <select className="w-full border rounded px-3 py-2 mb-6" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
          <option value="">{loading ? 'Loading...' : 'Select a patient'}</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.full_name} ({p.patient_code})</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-4 mt-6">
          <button className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 flex items-center" onClick={handlePrint} disabled={!patientObj}>Print</button>
          <button className="border px-8 py-2 rounded flex items-center" onClick={handleEmail} disabled={!patientObj}>Email PDF</button>
          <button className="border px-8 py-2 rounded flex items-center" onClick={handleWhatsApp} disabled={!patientObj}>WhatsApp PDF</button>
        </div>
      </div>
      {/* Modal for report preview */}
      {showPreview && patientObj && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, maxWidth: 900, width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
            <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, background: 'none', border: 'none', cursor: 'pointer' }}>✖</button>
            <button onClick={handlePrintReport} style={{ position: 'absolute', top: 16, right: 56, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Print</button>
            <button onClick={handleDownloadPDF} style={{ position: 'absolute', top: 16, right: 140, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Download PDF</button>
            <div ref={previewRef}><ReportPreview /></div>
          </div>
        </div>
      )}
      {/* No Patients Available Card */}
      {patients.length === 0 && !loading && (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center" style={{minHeight: '250px'}}>
          <span className="text-5xl text-gray-300 mb-4">📄</span>
          <div className="text-xl font-semibold text-gray-500 mb-2">No patients available</div>
          <div className="text-gray-400">Add patients first to generate reports</div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Success!</h3>
              <p className="text-sm text-gray-500 mb-4">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
