// frontend/components/PatientCard.js - Enhanced with Modality Display
const PatientCard = ({ patient, onDelete, formatDate, formatTime }) => {
  // Fix gender emoji bug - properly handle sex field with fallback
  const getGenderEmoji = (patientData) => {
    // Check various possible field names for sex/gender
    const sex = patientData.sex || patientData.gender || patientData.patientSex || 'M';
    
    // Handle different sex representations
    if (sex === 'F' || sex === 'Female' || sex === 'female') {
      return '👩';
    } else if (sex === 'M' || sex === 'Male' || sex === 'male') {
      return '👨';
    } else {
      return '👤'; // Neutral icon for other/unknown
    }
  };

  // Get modality icon based on type
  const getModalityIcon = (modality) => {
    switch (modality?.toUpperCase()) {
      case 'US':
        return '🔊'; // Ultrasound icon
      case 'CT':
        return '🏥'; // CT scan icon
      case 'MR':
      case 'MRI':
        return '🧲'; // MRI icon
      case 'XR':
        return '☢️'; // X-Ray icon
      default:
        return '🩺'; // General medical icon
    }
  };

  // Get modality full name
  const getModalityName = (modality) => {
    switch (modality?.toUpperCase()) {
      case 'US':
        return 'Ultrasound';
      case 'CT':
        return 'CT Scan';
      case 'MR':
      case 'MRI':
        return 'MRI';
      case 'XR':
        return 'X-Ray';
      default:
        return modality || 'Unknown';
    }
  };

  return React.createElement('div', {
    className: 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-slate-700/50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-blue-500/50 hover:scale-[1.02] transform'
  },
    React.createElement('div', {
      className: 'flex items-center justify-between'
    },
      React.createElement('div', {
        className: 'flex items-center space-x-6'
      },
        React.createElement('div', {
          className: 'bg-gradient-to-br from-blue-600 to-indigo-700 w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-blue-500/50 shadow-lg'
        },
          React.createElement('span', {
            className: 'text-3xl'
          }, getGenderEmoji(patient))
        ),
        React.createElement('div', {
          className: 'flex-1'
        },
          React.createElement('h3', {
            className: 'text-xl font-bold text-slate-100 mb-2'
          }, patient.patientName || 'Unknown Patient'),
          React.createElement('div', {
            className: 'flex items-center space-x-3 mb-3 flex-wrap'
          },
            React.createElement('span', {
              className: 'text-slate-300 bg-slate-700/50 px-3 py-1 rounded-lg text-sm font-medium'
            }, `ID: ${patient.patientId || 'N/A'}`),
            React.createElement('span', {
              className: 'text-slate-300 bg-slate-700/50 px-3 py-1 rounded-lg text-sm font-medium'
            }, `Sex: ${patient.sex || 'N/A'}`),
            // Enhanced modality display
            React.createElement('span', {
              className: 'text-blue-200 bg-blue-900/60 px-3 py-1 rounded-lg text-sm font-medium border border-blue-700/50 backdrop-blur-sm flex items-center space-x-1'
            },
              React.createElement('span', {}, getModalityIcon(patient.modality)),
              React.createElement('span', {}, getModalityName(patient.modality))
            ),
            React.createElement('span', {
              className: 'text-xs bg-slate-600/50 text-slate-400 px-2 py-1 rounded border border-slate-600'
            }, patient.filename || 'N/A')
          ),
          React.createElement('div', {
            className: 'space-y-3'
          },
            React.createElement('div', {
              className: 'inline-block bg-purple-900/60 text-purple-200 px-4 py-2 rounded-lg text-sm font-medium border border-purple-700/50 backdrop-blur-sm max-w-full'
            }, `🔬 ${patient.procedureDescription || 'No procedure specified'}`),
            React.createElement('div', {
              className: 'text-slate-400 text-sm flex items-center space-x-4 flex-wrap'
            },
              React.createElement('span', {
                className: 'flex items-center space-x-1'
              },
                React.createElement('span', {}, '📅'),
                React.createElement('span', {}, formatDate(patient.scheduledDate))
              ),
              React.createElement('span', {
                className: 'flex items-center space-x-1'
              },
                React.createElement('span', {}, '⏰'),
                React.createElement('span', {}, formatTime(patient.scheduledTime))
              )
            )
          )
        )
      ),
      React.createElement('div', {
        className: 'flex items-center space-x-4'
      },
        React.createElement('div', {
          className: 'text-right space-y-2'
        },
          React.createElement('div', {
            className: 'bg-emerald-900/60 text-emerald-200 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-700/50 backdrop-blur-sm'
          }, '✅ Ready'),
          React.createElement('p', {
            className: 'text-xs text-slate-500'
          }, 'DICOM converted')
        ),
        React.createElement('button', {
          onClick: () => onDelete(patient.filename),
          className: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-xl transition-all duration-200 hover:scale-110 transform border-2 border-red-500/50 shadow-lg'
        }, '🗑️')
      )
    )
  );
};
