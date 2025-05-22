// frontend/components/PatientList.js
const PatientList = ({ patients, onDelete, formatDate, formatTime }) => {
  if (patients.length === 0) {
    return React.createElement('div', {
      className: 'text-center py-20 bg-gradient-to-br from-slate-900 to-slate-800'
    },
      React.createElement('div', {
        className: 'bg-slate-800/50 backdrop-blur-sm w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-slate-700/50 shadow-lg'
      },
        React.createElement('span', {
          className: 'text-6xl'
        }, '📋')
      ),
      React.createElement('h3', {
        className: 'text-2xl font-bold text-slate-200 mb-4'
      }, 'No patients scheduled'),
      React.createElement('p', {
        className: 'text-slate-400 max-w-lg mx-auto text-lg leading-relaxed'
      }, 'Get started by creating your first patient worklist entry. All patient data will be converted to DICOM format automatically.')
    );
  }

  return React.createElement('div', {
    className: 'p-8 bg-gradient-to-br from-slate-900 to-slate-800 min-h-[400px]'
  },
    React.createElement('div', {
      className: 'max-w-7xl mx-auto space-y-6'
    }, 
      ...patients.map((patient, index) => 
        React.createElement(PatientCard, {
          key: `patient-${index}`,
          patient,
          onDelete,
          formatDate,
          formatTime
        })
      )
    )
  );
};
