// frontend/app.js - Main Application Entry Point with DD/MM/YYYY format
console.log('🚀 Loading DICOM Worklist Manager...');

const { useState, useEffect } = React;

// Import API utilities (defined below)
const API = {
  async fetchWorklists() {
    const response = await fetch('/api/worklists');
    if (!response.ok) throw new Error('Failed to fetch worklists');
    return response.json();
  },

  async createWorklist(data) {
    const response = await fetch('/api/worklists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create worklist');
    }
    return response.json();
  },

  async deleteWorklist(filename) {
    const response = await fetch(`/api/worklists/${filename}`, { 
      method: 'DELETE' 
    });
    if (!response.ok) throw new Error('Failed to delete worklist');
    return response.json();
  }
};

// Utility functions
const Utils = {
  // Updated to DD/MM/YYYY format
  formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return dateStr;
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    // Handle both HHMM and HH:MM formats
    if (timeStr.length === 4 && !timeStr.includes(':')) {
      return timeStr.substring(0, 2) + ':' + timeStr.substring(2, 4);
    }
    return timeStr;
  },

  generateAccessionNumber(modality) {
    const timestamp = Date.now().toString().slice(-6);
    return `${modality}${timestamp}`;
  },

  generatePatientId() {
    const timestamp = Date.now().toString().slice(-4);
    return `PAT${timestamp}`;
  }
};

// Main Application Component
function App() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [formData, setFormData] = useState({
    patientName: '',
    patientFirstName: '',
    patientMiddleName: '',
    patientId: '',
    birthDate: '',
    sex: 'M',
    requestingPhysician: '',
    referringPhysician: '',
    procedureDescription: '',
    scheduledDate: '',
    scheduledTime: '',
    modality: 'US',
    stationAET: 'WS80A'
  });

  useEffect(() => {
    console.log('🔄 App mounted');
    loadWorklists();
    setTimeout(() => setLoading(false), 800); // Reduced loading time
  }, []);

  const loadWorklists = async () => {
    try {
      const data = await API.fetchWorklists();
      console.log('📡 Got data:', data);
      setPatients(data);
    } catch (error) {
      console.error('❌ Error:', error);
      showNotification('❌ Failed to load patient data', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      accessionNumber: formData.accessionNumber || Utils.generateAccessionNumber(formData.modality),
      patientId: formData.patientId || Utils.generatePatientId(),
      procedureStepId: formData.procedureStepId || Utils.generateAccessionNumber(formData.modality),
      stationName: 'US_THYROID',
      location: 'ULTRASOUND'
    };

    try {
      await API.createWorklist(finalData);
      console.log('✅ Success!');
      
      // Reset form
      setFormData({
        patientName: '',
        patientFirstName: '',
        patientMiddleName: '',
        patientId: '',
        birthDate: '',
        sex: 'M',
        requestingPhysician: '',
        referringPhysician: '',
        procedureDescription: '',
        scheduledDate: '',
        scheduledTime: '',
        modality: 'US',
        stationAET: 'WS80A'
      });
      
      setShowForm(false);
      loadWorklists();
      showNotification('✅ Patient created successfully!', 'success');
    } catch (error) {
      console.error('❌ Error:', error);
      showNotification(`❌ Error: ${error.message}`, 'error');
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm('🗑️ Are you sure you want to delete this patient record?')) return;

    try {
      await API.deleteWorklist(filename);
      loadWorklists();
      showNotification('🗑️ Patient record deleted successfully!', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification('❌ Failed to delete patient record', 'error');
    }
  };

  if (loading) {
    return React.createElement(LoadingScreen);
  }

  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900'
  },
    React.createElement(Notification, { notification }),
    
    React.createElement('div', {
      className: 'pb-8'
    },
      React.createElement('div', {
        className: 'bg-slate-800/50 backdrop-blur-sm shadow-2xl border border-slate-700/50 overflow-hidden'
      },
        React.createElement(Header, { patientCount: patients.length }),
        React.createElement(ActionBar, {
          patientCount: patients.length,
          showForm,
          onToggleForm: () => setShowForm(!showForm)
        }),
        showForm && React.createElement(PatientForm, {
          formData,
          onInputChange: handleInputChange,
          onSubmit: handleSubmit,
          onCancel: () => setShowForm(false)
        }),
        React.createElement(PatientList, {
          patients,
          onDelete: handleDelete,
          formatDate: Utils.formatDate,
          formatTime: Utils.formatTime
        })
      )
    ),
    
    // Footer
    React.createElement('div', {
      className: 'text-center py-8'
    },
      React.createElement('p', {
        className: 'text-slate-400 text-sm'
      }, '© 2025 MiVi - Medical Imaging Virtual Intelligence | Professional DICOM Workflow Solutions')
    )
  );
}

// Render the app
console.log('🚀 Rendering MiVi Worklist Manager...');
try {
  const container = document.getElementById('root');
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
  console.log('✅ MiVi Worklist Manager loaded successfully!');
} catch (error) {
  console.error('❌ Render error:', error);
}
