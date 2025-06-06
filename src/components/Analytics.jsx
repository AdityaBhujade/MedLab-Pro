import React, { useState, useEffect } from 'react';

const AGE_GROUPS = [
  { label: '0-17 years', min: 0, max: 17 },
  { label: '18-29 years', min: 18, max: 29 },
  { label: '30-44 years', min: 30, max: 44 },
  { label: '45-59 years', min: 45, max: 59 },
  { label: '60+ years', min: 60, max: 200 },
];

const parseRange = (range) => {
  // Handles ranges like '3.5–5.5', '70–110', '<1.1', 'M: 13–16; F: 11.5–14.5', etc.
  if (!range) return [null, null];
  if (range.includes('–')) {
    const [min, max] = range.split('–').map(s => parseFloat(s.replace(/[^0-9.\-]/g, '')));
    return [min, max];
  }
  if (range.startsWith('<')) {
    return [null, parseFloat(range.replace(/[^0-9.\-]/g, ''))];
  }
  if (range.startsWith('>')) {
    return [parseFloat(range.replace(/[^0-9.\-]/g, '')), null];
  }
  return [null, null];
};

const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      count: 0,
    });
  }
  return months;
};

const Analytics = () => {
  const [summary, setSummary] = useState({
    totalPatients: 0,
    totalTests: 0,
    abnormalResults: 0,
    reportsGenerated: 0,
    genderCounts: { male: 0, female: 0, other: 0 },
    ageGroups: [],
    testCategories: {},
    normalResults: 0,
    reportCompletionRate: 0,
    monthlyTrends: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Demographics');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let patients = [];
    let tests = [];
    let abnormalResults = 0;
    let normalResults = 0;
    let genderCounts = { male: 0, female: 0, other: 0 };
    let ageGroups = AGE_GROUPS.map(g => ({ ...g, count: 0 }));
    let testCategories = {};
    let monthlyTrends = getLast6Months();
    let recentActivity = [];
    // Fetch patients
    try {
      const res = await fetch('http://localhost:5000/api/patients');
      if (res.ok) patients = await res.json();
    } catch (e) {}
    // Fetch tests
    try {
      const res = await fetch('http://localhost:5000/api/tests');
      if (res.ok) tests = await res.json();
    } catch (e) {}
    // Gender distribution & Age groups
    patients.forEach(p => {
      if (p.gender === 'male') genderCounts.male++;
      else if (p.gender === 'female') genderCounts.female++;
      else genderCounts.other++;
      const age = parseInt(p.age, 10);
      for (let g of ageGroups) {
        if (age >= g.min && age <= g.max) {
          g.count++;
          break;
        }
      }
      // Recent activity: patient registered
      recentActivity.push({
        type: 'patient',
        label: `New patient registered: ${p.full_name}`,
        date: p.created_at || '',
        name: p.full_name,
        timestamp: p.created_at || '',
      });
    });
    // Test analytics
    tests.forEach(tr => {
      // Test category
      if (tr.category) {
        testCategories[tr.category] = (testCategories[tr.category] || 0) + 1;
      }
      // Monthly trends
      if (tr.timestamp) {
        const d = new Date(tr.timestamp);
        for (let m of monthlyTrends) {
          if (d.getFullYear() === m.year && d.getMonth() === m.month) {
            m.count++;
            break;
          }
        }
      }
      // Test results
      let hasAbnormal = false;
      (tr.tests || []).forEach(t => {
        const value = parseFloat(t.value);
        const [min, max] = parseRange(t.normalRange);
        if ((min !== null && value < min) || (max !== null && value > max)) {
          abnormalResults++;
          hasAbnormal = true;
        } else {
          normalResults++;
        }
      });
      // Recent activity: test completed
      if (tr.timestamp && tr.patient_id) {
        const patient = patients.find(p => p.id === tr.patient_id);
        recentActivity.push({
          type: 'test',
          label: `Test completed for ${patient ? patient.full_name : 'Unknown'}`,
          date: tr.timestamp,
          name: patient ? patient.full_name : '',
          timestamp: tr.timestamp,
        });
      }
    });
    // Reports generated from localStorage
    let reportsGenerated = 0;
    let reportEvents = [];
    try {
      reportsGenerated = parseInt(localStorage.getItem('reportsGenerated') || '0', 10);
      // For recent activity, store report events in localStorage as an array
      reportEvents = JSON.parse(localStorage.getItem('reportEvents') || '[]');
    } catch (e) {}
    // Add report events to recent activity
    reportEvents.forEach(ev => {
      recentActivity.push({
        type: 'report',
        label: `Report generated for ${ev.name}`,
        date: ev.date,
        name: ev.name,
        timestamp: ev.date,
      });
    });
    // Sort recent activity by timestamp descending
    recentActivity = recentActivity.filter(ev => ev.timestamp).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
    // Report completion rate
    let reportCompletionRate = tests.length > 0 ? Math.round((reportsGenerated / tests.length) * 100) : 0;
    setSummary({
      totalPatients: patients.length,
      totalTests: tests.length || 0,
      abnormalResults,
      reportsGenerated,
      genderCounts,
      ageGroups,
      testCategories,
      normalResults,
      reportCompletionRate,
      monthlyTrends,
      recentActivity,
    });
    setLoading(false);
  };

  const summaryCards = [
    {
      title: 'Total Patients',
      value: summary.totalPatients,
      subtitle: '+0 this month',
      icon: <span className="text-blue-500">📈</span>,
    },
    {
      title: 'Tests Conducted',
      value: summary.totalTests,
      subtitle: '0 today, 0 this week',
      icon: <span className="text-green-500">📊</span>,
    },
    {
      title: 'Abnormal Results',
      value: summary.abnormalResults,
      subtitle: 'Abnormal test results',
      icon: <span className="text-red-500">❗</span>,
    },
    {
      title: 'Reports Generated',
      value: summary.reportsGenerated,
      subtitle: 'Reports printed/downloaded',
      icon: <span className="text-purple-500">📄</span>,
    },
  ];

  return (
    <div className="p-8 ml-64">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics & Patient Statistics</h1>
      <p className="text-gray-600 mb-6">Comprehensive insights into laboratory operations and patient data</p>
      <button onClick={fetchData} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Refresh</button>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">{card.title}</span>
              {card.icon}
            </div>
            <div className="text-2xl font-bold text-gray-800">{loading ? '...' : card.value}</div>
            <div className="text-xs text-gray-500 mt-2">{card.subtitle}</div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded mb-6">
        {['Demographics', 'Test Analytics', 'Trends', 'Recent Activity'].map(tab => (
          <button
            key={tab}
            className={`flex-1 px-4 py-2 font-semibold rounded ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {activeTab === 'Demographics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-1 flex items-center"><span className="mr-2">🕒</span> Gender Distribution</h2>
            <p className="text-gray-600 mb-4 text-sm">Patient demographics by gender</p>
            <div className="mb-2 flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Male <div className="flex-1 mx-2 bg-gray-100 rounded h-2"><div className="bg-blue-500 h-2 rounded" style={{width: `${summary.genderCounts.male / (summary.totalPatients || 1) * 100}%`}}></div></div> <span className="w-8 text-right">{summary.genderCounts.male}</span> <span className="ml-2 text-xs text-gray-500">{summary.totalPatients ? Math.round(summary.genderCounts.male / summary.totalPatients * 100) : 0}%</span></div>
            <div className="mb-2 flex items-center"><span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span>Female <div className="flex-1 mx-2 bg-gray-100 rounded h-2"><div className="bg-pink-500 h-2 rounded" style={{width: `${summary.genderCounts.female / (summary.totalPatients || 1) * 100}%`}}></div></div> <span className="w-8 text-right">{summary.genderCounts.female}</span> <span className="ml-2 text-xs text-gray-500">{summary.totalPatients ? Math.round(summary.genderCounts.female / summary.totalPatients * 100) : 0}%</span></div>
            <div className="mb-2 flex items-center"><span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>Other <div className="flex-1 mx-2 bg-gray-100 rounded h-2"><div className="bg-gray-500 h-2 rounded" style={{width: `${summary.genderCounts.other / (summary.totalPatients || 1) * 100}%`}}></div></div> <span className="w-8 text-right">{summary.genderCounts.other}</span> <span className="ml-2 text-xs text-gray-500">{summary.totalPatients ? Math.round(summary.genderCounts.other / summary.totalPatients * 100) : 0}%</span></div>
          </div>
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-1 flex items-center"><span className="mr-2">📊</span> Age Distribution</h2>
            <p className="text-gray-600 mb-4 text-sm">Patient demographics by age groups</p>
            {summary.ageGroups.map((g, idx) => (
              <div key={g.label} className="mb-2 flex items-center">
                <span className="w-28">{g.label}</span>
                <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                  <div className="bg-blue-500 h-2 rounded" style={{width: `${summary.totalPatients ? (g.count / summary.totalPatients * 100) : 0}%`}}></div>
                </div>
                <span className="w-8 text-right">{g.count}</span>
                <span className="ml-2 text-xs text-gray-500">{summary.totalPatients ? Math.round(g.count / summary.totalPatients * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'Test Analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Categories */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-1 flex items-center"><span className="mr-2">🧪</span> Test Categories</h2>
            <p className="text-gray-600 mb-4 text-sm">Distribution of tests by category</p>
            {Object.keys(summary.testCategories).length === 0 && <div className="text-gray-400">No data</div>}
            {Object.entries(summary.testCategories).map(([cat, count]) => (
              <div key={cat} className="mb-2 flex items-center">
                <span className="w-32">{cat}</span>
                <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                  <div className="bg-blue-500 h-2 rounded" style={{width: `${summary.totalTests ? (count / summary.totalTests * 100) : 0}%`}}></div>
                </div>
                <span className="w-8 text-right">{count}</span>
                <span className="ml-2 text-xs text-gray-500">{summary.totalTests ? Math.round(count / summary.totalTests * 100) : 0}%</span>
              </div>
            ))}
          </div>
          {/* Test Performance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-1 flex items-center"><span className="mr-2">📈</span> Test Performance</h2>
            <p className="text-gray-600 mb-4 text-sm">Quality metrics and performance indicators</p>
            <div className="mb-2 flex items-center"><span className="w-32">Normal Results</span>
              <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                <div className="bg-green-200 h-2 rounded" style={{width: `${summary.normalResults + summary.abnormalResults ? (summary.normalResults / (summary.normalResults + summary.abnormalResults) * 100) : 0}%`}}></div>
              </div>
              <span className="w-8 text-right text-green-700">{summary.normalResults}</span>
            </div>
            <div className="mb-2 flex items-center"><span className="w-32">Abnormal Results</span>
              <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                <div className="bg-red-500 h-2 rounded" style={{width: `${summary.normalResults + summary.abnormalResults ? (summary.abnormalResults / (summary.normalResults + summary.abnormalResults) * 100) : 0}%`}}></div>
              </div>
              <span className="w-8 text-right text-red-700">{summary.abnormalResults}</span>
            </div>
            <div className="mb-2 flex items-center"><span className="w-32">Report Completion Rate</span>
              <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                <div className="bg-blue-300 h-2 rounded" style={{width: `${summary.reportCompletionRate > 100 ? 100 : summary.reportCompletionRate}%`}}></div>
              </div>
              <span className="w-12 text-right text-blue-700">{summary.reportCompletionRate}%</span>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'Trends' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-1 flex items-center"><span className="mr-2">📅</span> Monthly Test Trends</h2>
          <p className="text-gray-600 mb-4 text-sm">Test volume over the last 6 months</p>
          {summary.monthlyTrends.map((m, idx) => (
            <div key={m.label} className="mb-2 flex items-center">
              <span className="w-24">{m.label}</span>
              <div className="flex-1 mx-2 bg-gray-100 rounded h-2">
                <div className="bg-blue-500 h-2 rounded" style={{width: `${summary.totalTests ? (m.count / Math.max(...summary.monthlyTrends.map(mt => mt.count), 1) * 100) : 0}%`}}></div>
              </div>
              <span className="w-12 text-right">{m.count} tests</span>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'Recent Activity' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-1 flex items-center"><span className="mr-2">📝</span> Recent Activity</h2>
          <p className="text-gray-600 mb-4 text-sm">Latest system activities and updates</p>
          {summary.recentActivity.length === 0 && <div className="text-gray-400">No recent activity</div>}
          {summary.recentActivity.map((ev, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-gray-100 py-2">
              <div className="flex items-center">
                <span className="mr-2">
                  {ev.type === 'report' && <span>📄</span>}
                  {ev.type === 'test' && <span>🧪</span>}
                  {ev.type === 'patient' && <span>👤</span>}
                </span>
                <span className="font-medium text-gray-700">{ev.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{ev.date ? new Date(ev.date).toLocaleString() : ''}</span>
                <span className="px-2 py-1 rounded bg-gray-100 text-xs text-gray-600 capitalize">{ev.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Analytics;
