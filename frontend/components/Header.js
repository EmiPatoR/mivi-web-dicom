// frontend/components/Header.js
const Header = ({ patientCount }) => {
  return React.createElement('div', {
    className: 'bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 p-8 text-white border-b border-slate-700/50'
  },
    React.createElement('div', {
      className: 'flex items-center justify-between max-w-7xl mx-auto'
    },
      React.createElement('div', {
        className: 'flex items-center space-x-6'
      },
        React.createElement('div', {
          className: 'bg-gradient-to-br from-blue-400 to-indigo-500 p-4 rounded-xl shadow-lg'
        },
          React.createElement('div', {
            className: 'w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm'
          }, 'MV')
        ),
        React.createElement('div', {},
          React.createElement('h1', {
            className: 'text-4xl font-bold tracking-tight text-slate-100 mb-2'
          }, 'DICOM Worklist Manager'),
          React.createElement('p', {
            className: 'text-blue-200 text-xl font-medium mb-1'
          }, 'MiVi - Medical Imaging Virtual Intelligence'),
          React.createElement('p', {
            className: 'text-slate-300'
          }, 'Professional ultrasound workflow management system')
        )
      ),
      React.createElement('div', {
        className: 'text-right'
      },
        React.createElement('div', {
          className: 'bg-slate-700/50 backdrop-blur-sm px-6 py-4 rounded-xl border border-slate-600/50 shadow-lg'
        },
          React.createElement('p', {
            className: 'text-slate-300 text-sm font-medium mb-1'
          }, 'Active Patients'),
          React.createElement('p', {
            className: 'text-3xl font-bold text-blue-300'
          }, patientCount)
        )
      )
    )
  );
};
