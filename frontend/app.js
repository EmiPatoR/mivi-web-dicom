// frontend/app.js
console.log('🚀 Loading DICOM Worklist Manager...');

const { useState, useEffect } = React;

// Professional App Component with MiVi branding
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
    fetchWorklists();
    setLoading(false);
  }, []);

  const fetchWorklists = async () => {
    try {
      const response = await fetch('/api/worklists');
      const data = await response.json();
      console.log('📡 Got data:', data);
      setPatients(data);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateAccessionNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `${formData.modality}${timestamp}`;
  };

  const generatePatientId = () => {
    const timestamp = Date.now().toString().slice(-4);
    return `PAT${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalData = {
      ...formData,
      accessionNumber: formData.accessionNumber || generateAccessionNumber(),
      patientId: formData.patientId || generatePatientId(),
      procedureStepId: formData.procedureStepId || generateAccessionNumber(),
      stationName: 'US_THYROID',
      location: 'ULTRASOUND'
    };

    try {
      const response = await fetch('/api/worklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        console.log('✅ Success!');
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
        fetchWorklists();
        setNotification({ message: '✅ Patient created successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 4000);
      } else {
        const error = await response.json();
        setNotification({ message: `❌ Error: ${error.error || 'Failed to create patient'}`, type: 'error' });
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      setNotification({ message: '❌ Network error occurred', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm('🗑️ Are you sure you want to delete this patient record?')) return;

    try {
      const response = await fetch(`/api/worklists/${filename}`, { method: 'DELETE' });
      if (response.ok) {
        fetchWorklists();
        setNotification({ message: '🗑️ Patient record deleted successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 2) + ':' + timeStr.substring(2, 4);
  };

  if (loading) {
    return React.createElement('div', {
      className: 'min-h-screen bg-slate-900 flex items-center justify-center'
    }, React.createElement('div', {
      className: 'text-center bg-slate-800 p-8 rounded-xl shadow-xl border border-slate-700'
    }, 
      React.createElement('div', {
        className: 'w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'
      }),
      React.createElement('p', {
        className: 'text-slate-200 text-lg'
      }, 'Loading MiVi Worklist Manager...'),
      React.createElement('p', {
        className: 'text-slate-400 text-sm mt-2'
      }, 'Medical Imaging Virtual Intelligence')
    ));
  }

  // Header with MiVi branding - Dark Medical Theme
  const headerElement = React.createElement('div', {
    className: 'bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 p-6 rounded-t-xl text-white border-b border-slate-700'
  },
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      React.createElement('div', {
        className: 'flex items-center space-x-4'
      },
        React.createElement('div', {
          className: 'bg-white bg-opacity-10 p-3 rounded-lg border border-white border-opacity-20'
        },
          React.createElement('img', {
            src: '/logo.png',
            alt: 'MiVi Logo',
            className: 'w-8 h-8',
            onError: (e) => {
              // Fallback to placeholder div if logo doesn't exist
              e.target.style.display = 'none';
              const placeholder = React.createElement('div', {
                className: 'w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded flex items-center justify-center text-white font-bold text-sm'
              }, 'MV');
              e.target.parentNode.appendChild(placeholder);
            }
          }),
          // Backup placeholder that shows initially
          React.createElement('div', {
            className: 'w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded flex items-center justify-center text-white font-bold text-sm'
          }, 'MV')
        ),
        React.createElement('div', {},
          React.createElement('h1', {
            className: 'text-3xl font-bold tracking-tight text-slate-100'
          }, 'DICOM Worklist Manager'),
          React.createElement('p', {
            className: 'text-blue-200 text-lg mt-1 font-medium'
          }, 'MiVi - Medical Imaging Virtual Intelligence'),
          React.createElement('p', {
            className: 'text-slate-300 text-sm'
          }, 'Professional ultrasound workflow management system')
        )
      ),
      React.createElement('div', {
        className: 'text-right'
      },
        React.createElement('div', {
          className: 'bg-slate-700 bg-opacity-50 px-4 py-3 rounded-lg border border-slate-600'
        },
          React.createElement('p', {
            className: 'text-slate-300 text-sm font-medium'
          }, 'Active Patients'),
          React.createElement('p', {
            className: 'text-2xl font-bold text-blue-300'
          }, patients.length)
        )
      )
    )
  );

  // Action bar - Dark theme
  const actionBarElement = React.createElement('div', {
    className: 'bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between'
  },
    React.createElement('div', {
      className: 'flex items-center space-x-4'
    },
      React.createElement('h2', {
        className: 'text-xl font-semibold text-slate-200'
      }, 'Patient Worklist'),
      React.createElement('div', {
        className: 'bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-700'
      }, `${patients.length} patient${patients.length !== 1 ? 's' : ''}`)
    ),
    React.createElement('button', {
      onClick: () => setShowForm(!showForm),
      className: `${showForm 
        ? 'bg-slate-600 hover:bg-slate-700 border-slate-500' 
        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-emerald-500'
      } text-white px-6 py-3 rounded-lg font-medium shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center space-x-2 border`
    },
      React.createElement('span', {
        className: 'text-lg'
      }, showForm ? '❌' : '➕'),
      React.createElement('span', {}, showForm ? 'Cancel' : 'New Patient')
    )
  );

  // Enhanced form with dark theme
  const formElement = !showForm ? null : React.createElement('div', {
    className: 'bg-slate-800 p-6 border-b border-slate-700'
  },
    React.createElement('div', {
      className: 'bg-slate-900 rounded-lg shadow-md p-6 border border-slate-700'
    },
      React.createElement('div', {
        className: 'flex items-center mb-6'
      },
        React.createElement('div', {
          className: 'bg-emerald-900 p-2 rounded-lg mr-4 border border-emerald-700'
        },
          React.createElement('span', {
            className: 'text-2xl'
          }, '👤')
        ),
        React.createElement('div', {},
          React.createElement('h3', {
            className: 'text-xl font-bold text-slate-100'
          }, 'New Patient Registration'),
          React.createElement('p', {
            className: 'text-slate-400'
          }, 'Enter patient details for ultrasound examination')
        )
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        },
          // Patient Name Fields
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '👤 Patient Last Name *'),
            React.createElement('input', {
              type: 'text',
              name: 'patientName',
              value: formData.patientName,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '👤 Patient First Name *'),
            React.createElement('input', {
              type: 'text',
              name: 'patientFirstName',
              value: formData.patientFirstName,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '👤 Middle Name'),
            React.createElement('input', {
              type: 'text',
              name: 'patientMiddleName',
              value: formData.patientMiddleName,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          // Demographics
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '🎂 Birth Date *'),
            React.createElement('input', {
              type: 'date',
              name: 'birthDate',
              value: formData.birthDate,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '⚧️ Sex *'),
            React.createElement('select', {
              name: 'sex',
              value: formData.sex,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            },
              React.createElement('option', { value: 'M' }, 'Male'),
              React.createElement('option', { value: 'F' }, 'Female'),
              React.createElement('option', { value: 'O' }, 'Other')
            )
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '🆔 Patient ID'),
            React.createElement('input', {
              type: 'text',
              name: 'patientId',
              value: formData.patientId,
              onChange: handleInputChange,
              placeholder: 'Auto-generated if empty',
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          // Medical Info
          React.createElement('div', {
            className: 'col-span-1 md:col-span-2'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '🔬 Procedure Description *'),
            React.createElement('input', {
              type: 'text',
              name: 'procedureDescription',
              value: formData.procedureDescription,
              onChange: handleInputChange,
              required: true,
              placeholder: 'e.g., Thyroid US bilateral, Carotid Doppler study',
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '🩺 Modality'),
            React.createElement('select', {
              name: 'modality',
              value: formData.modality,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            },
              React.createElement('option', { value: 'US' }, 'Ultrasound'),
              React.createElement('option', { value: 'CT' }, 'CT Scan'),
              React.createElement('option', { value: 'MR' }, 'MRI'),
              React.createElement('option', { value: 'XR' }, 'X-Ray')
            )
          ),
          // Scheduling
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '📅 Scheduled Date *'),
            React.createElement('input', {
              type: 'date',
              name: 'scheduledDate',
              value: formData.scheduledDate,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '⏰ Scheduled Time *'),
            React.createElement('input', {
              type: 'time',
              name: 'scheduledTime',
              value: formData.scheduledTime,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          // Physicians
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '👨‍⚕️ Requesting Physician'),
            React.createElement('input', {
              type: 'text',
              name: 'requestingPhysician',
              value: formData.requestingPhysician,
              onChange: handleInputChange,
              placeholder: 'Dr. Smith',
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '👩‍⚕️ Referring Physician'),
            React.createElement('input', {
              type: 'text',
              name: 'referringPhysician',
              value: formData.referringPhysician,
              onChange: handleInputChange,
              placeholder: 'Dr. Johnson',
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-slate-300 mb-2'
            }, '🖥️ Station AET'),
            React.createElement('input', {
              type: 'text',
              name: 'stationAET',
              value: formData.stationAET,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400'
            })
          )
        ),
        React.createElement('div', {
          className: 'flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-700'
        },
          React.createElement('button', {
            type: 'button',
            onClick: () => setShowForm(false),
            className: 'px-6 py-3 border border-slate-600 text-slate-300 bg-slate-700 rounded-lg hover:bg-slate-600 font-medium transition-colors duration-200'
          }, '❌ Cancel'),
          React.createElement('button', {
            type: 'submit',
            className: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 font-medium shadow-lg transform transition-all duration-200 hover:scale-105 border border-emerald-500'
          }, '💾 Create Patient Record')
        )
      )
    )
  );
    React.createElement('div', {
      className: 'bg-white rounded-lg shadow-md p-6'
    },
      React.createElement('div', {
        className: 'flex items-center mb-6'
      },
        React.createElement('div', {
          className: 'bg-green-100 p-2 rounded-lg mr-4'
        },
          React.createElement('span', {
            className: 'text-2xl'
          }, '👤')
        ),
        React.createElement('div', {},
          React.createElement('h3', {
            className: 'text-xl font-bold text-gray-900'
          }, 'New Patient Registration'),
          React.createElement('p', {
            className: 'text-gray-600'
          }, 'Enter patient details for ultrasound examination')
        )
      ),
      React.createElement('form', { onSubmit: handleSubmit },
        React.createElement('div', {
          className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
        },
          // Patient Name Fields
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '👤 Patient Last Name *'),
            React.createElement('input', {
              type: 'text',
              name: 'patientName',
              value: formData.patientName,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '👤 Patient First Name *'),
            React.createElement('input', {
              type: 'text',
              name: 'patientFirstName',
              value: formData.patientFirstName,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '👤 Middle Name'),
            React.createElement('input', {
              type: 'text',
              name: 'patientMiddleName',
              value: formData.patientMiddleName,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          // Demographics
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '🎂 Birth Date *'),
            React.createElement('input', {
              type: 'date',
              name: 'birthDate',
              value: formData.birthDate,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '⚧️ Sex *'),
            React.createElement('select', {
              name: 'sex',
              value: formData.sex,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            },
              React.createElement('option', { value: 'M' }, 'Male'),
              React.createElement('option', { value: 'F' }, 'Female'),
              React.createElement('option', { value: 'O' }, 'Other')
            )
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '🆔 Patient ID'),
            React.createElement('input', {
              type: 'text',
              name: 'patientId',
              value: formData.patientId,
              onChange: handleInputChange,
              placeholder: 'Auto-generated if empty',
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          // Medical Info
          React.createElement('div', {
            className: 'col-span-1 md:col-span-2'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '🔬 Procedure Description *'),
            React.createElement('input', {
              type: 'text',
              name: 'procedureDescription',
              value: formData.procedureDescription,
              onChange: handleInputChange,
              required: true,
              placeholder: 'e.g., Thyroid US bilateral, Carotid Doppler study',
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '🩺 Modality'),
            React.createElement('select', {
              name: 'modality',
              value: formData.modality,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            },
              React.createElement('option', { value: 'US' }, 'Ultrasound'),
              React.createElement('option', { value: 'CT' }, 'CT Scan'),
              React.createElement('option', { value: 'MR' }, 'MRI'),
              React.createElement('option', { value: 'XR' }, 'X-Ray')
            )
          ),
          // Scheduling
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '📅 Scheduled Date *'),
            React.createElement('input', {
              type: 'date',
              name: 'scheduledDate',
              value: formData.scheduledDate,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '⏰ Scheduled Time *'),
            React.createElement('input', {
              type: 'time',
              name: 'scheduledTime',
              value: formData.scheduledTime,
              onChange: handleInputChange,
              required: true,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          // Physicians
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '👨‍⚕️ Requesting Physician'),
            React.createElement('input', {
              type: 'text',
              name: 'requestingPhysician',
              value: formData.requestingPhysician,
              onChange: handleInputChange,
              placeholder: 'Dr. Smith',
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '👩‍⚕️ Referring Physician'),
            React.createElement('input', {
              type: 'text',
              name: 'referringPhysician',
              value: formData.referringPhysician,
              onChange: handleInputChange,
              placeholder: 'Dr. Johnson',
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          ),
          React.createElement('div', {
            className: 'col-span-1'
          },
            React.createElement('label', {
              className: 'block text-sm font-semibold text-gray-700 mb-2'
            }, '🖥️ Station AET'),
            React.createElement('input', {
              type: 'text',
              name: 'stationAET',
              value: formData.stationAET,
              onChange: handleInputChange,
              className: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
            })
          )
        ),
        React.createElement('div', {
          className: 'flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200'
        },
          React.createElement('button', {
            type: 'button',
            onClick: () => setShowForm(false),
            className: 'px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200'
          }, '❌ Cancel'),
          React.createElement('button', {
            type: 'submit',
            className: 'bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-lg transform transition-all duration-200 hover:scale-105'
          }, '💾 Create Patient Record')
        )
      )
    )
  );

  // Enhanced patient list - Dark theme
  let patientListElement;
  if (patients.length === 0) {
    patientListElement = React.createElement('div', {
      className: 'text-center py-16 bg-slate-900'
    },
      React.createElement('div', {
        className: 'bg-slate-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700'
      },
        React.createElement('span', {
          className: 'text-4xl'
        }, '📋')
      ),
      React.createElement('h3', {
        className: 'text-xl font-semibold text-slate-200 mb-2'
      }, 'No patients scheduled'),
      React.createElement('p', {
        className: 'text-slate-400 max-w-md mx-auto'
      }, 'Get started by creating your first patient worklist entry. All patient data will be converted to DICOM format automatically.')
    );
  } else {
    const patientElements = [];
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const patientCard = React.createElement('div', {
        key: `patient-${i}`,
        className: 'bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-500 hover:bg-slate-750'
      },
        React.createElement('div', {
          className: 'flex items-center justify-between'
        },
          React.createElement('div', {
            className: 'flex items-center space-x-4'
          },
            React.createElement('div', {
              className: 'bg-gradient-to-br from-blue-600 to-indigo-700 w-16 h-16 rounded-full flex items-center justify-center border border-blue-500'
            },
              React.createElement('span', {
                className: 'text-2xl'
              }, patient.sex === 'F' ? '👩' : '👨')
            ),
            React.createElement('div', {},
              React.createElement('h3', {
                className: 'text-lg font-bold text-slate-100'
              }, patient.patientName || 'Unknown Patient'),
              React.createElement('div', {
                className: 'flex items-center space-x-4 mt-1'
              },
                React.createElement('span', {
                  className: 'text-sm text-slate-400'
                }, `ID: ${patient.patientId || 'N/A'}`),
                React.createElement('span', {
                  className: 'text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded border border-slate-600'
                }, patient.filename || 'N/A')
              ),
              React.createElement('div', {
                className: 'flex items-center space-x-2 mt-2'
              },
                React.createElement('span', {
                  className: 'text-sm bg-blue-900 text-blue-200 px-2 py-1 rounded border border-blue-700'
                }, '🔬 ' + (patient.procedureDescription || 'No procedure specified')),
                React.createElement('span', {
                  className: 'text-xs text-slate-500'
                }, `📅 ${formatDate(patient.scheduledDate)} ⏰ ${formatTime(patient.scheduledTime)}`)
              )
            )
          ),
          React.createElement('div', {
            className: 'flex items-center space-x-3'
          },
            React.createElement('div', {
              className: 'text-right'
            },
              React.createElement('div', {
                className: 'bg-emerald-900 text-emerald-200 px-3 py-1 rounded-full text-xs font-medium border border-emerald-700'
              }, '✅ Ready'),
              React.createElement('p', {
                className: 'text-xs text-slate-500 mt-1'
              }, 'DICOM converted')
            ),
            React.createElement('button', {
              onClick: () => handleDelete(patient.filename),
              className: 'bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors duration-200 hover:scale-105 transform border border-red-500'
            }, '🗑️')
          )
        )
      );
      patientElements.push(patientCard);
    }

    patientListElement = React.createElement('div', {
      className: 'p-6 bg-slate-900'
    },
      React.createElement('div', {
        className: 'space-y-4'
      }, ...patientElements)
    );
  }

  // Enhanced notification
  const notificationElement = !notification ? null : React.createElement('div', {
    className: `fixed top-6 right-6 z-50 p-4 rounded-lg shadow-xl border-l-4 ${
      notification.type === 'success' 
        ? 'bg-green-50 border-green-400 text-green-800' 
        : 'bg-red-50 border-red-400 text-red-800'
    } transform transition-all duration-300 animate-pulse`
  },
    React.createElement('div', {
      className: 'flex items-center space-x-3'
    },
      React.createElement('span', {
        className: 'text-lg'
      }, notification.type === 'success' ? '✅' : '❌'),
      React.createElement('span', {
        className: 'font-medium'
      }, notification.message)
    )
  );

  return React.createElement('div', {
    className: 'min-h-screen bg-slate-900 pt-8'
  },
    notificationElement,
    React.createElement('div', {
      className: 'max-w-7xl mx-auto px-4'
    },
      React.createElement('div', {
        className: 'bg-slate-800 shadow-2xl rounded-xl overflow-hidden border border-slate-700'
      },
        headerElement,
        actionBarElement,
        formElement,
        patientListElement
      )
    ),
    // Footer - Dark theme
    React.createElement('div', {
      className: 'text-center py-8'
    },
      React.createElement('p', {
        className: 'text-slate-500 text-sm'
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
