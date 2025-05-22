// frontend/components/PatientForm.js
const PatientForm = ({ formData, onInputChange, onSubmit, onCancel }) => {
  return React.createElement('div', {
    className: 'bg-slate-800/90 backdrop-blur-sm p-8 border-b border-slate-700/50'
  },
    React.createElement('div', {
      className: 'max-w-7xl mx-auto'
    },
      React.createElement('div', {
        className: 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50'
      },
        React.createElement('div', {
          className: 'flex items-center mb-8 pb-6 border-b border-slate-700/50'
        },
          React.createElement('div', {
            className: 'bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 rounded-xl mr-6 shadow-lg'
          },
            React.createElement('span', {
              className: 'text-3xl'
            }, '👤')
          ),
          React.createElement('div', {},
            React.createElement('h3', {
              className: 'text-2xl font-bold text-slate-100 mb-2'
            }, 'New Patient Registration'),
            React.createElement('p', {
              className: 'text-slate-400 text-lg'
            }, 'Enter patient details for ultrasound examination')
          )
        ),
        React.createElement('form', { onSubmit },
          React.createElement('div', {
            className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10'
          },
            // Patient Information Section
            React.createElement(FormInput, {
              label: 'Patient Last Name',
              name: 'patientName',
              value: formData.patientName,
              onChange: onInputChange,
              required: true,
              icon: '👤'
            }),
            React.createElement(FormInput, {
              label: 'Patient First Name',
              name: 'patientFirstName',
              value: formData.patientFirstName,
              onChange: onInputChange,
              required: true,
              icon: '👤'
            }),
            React.createElement(FormInput, {
              label: 'Middle Name',
              name: 'patientMiddleName',
              value: formData.patientMiddleName,
              onChange: onInputChange,
              icon: '👤'
            }),
            
            // Demographics Section
            React.createElement(FormInput, {
              label: 'Birth Date',
              type: 'date',
              name: 'birthDate',
              value: formData.birthDate,
              onChange: onInputChange,
              required: true,
              icon: '🎂'
            }),
            React.createElement(FormInput, {
              label: 'Sex',
              type: 'select',
              name: 'sex',
              value: formData.sex,
              onChange: onInputChange,
              required: true,
              icon: '⚧️',
              options: [
                { value: 'M', label: 'Male' },
                { value: 'F', label: 'Female' },
                { value: 'O', label: 'Other' }
              ]
            }),
            React.createElement(FormInput, {
              label: 'Patient ID',
              name: 'patientId',
              value: formData.patientId,
              onChange: onInputChange,
              placeholder: 'Auto-generated if empty',
              icon: '🆔'
            }),
            
            // Medical Information Section
            React.createElement('div', {
              className: 'md:col-span-2'
            },
              React.createElement(FormInput, {
                label: 'Procedure Description',
                name: 'procedureDescription',
                value: formData.procedureDescription,
                onChange: onInputChange,
                required: true,
                placeholder: 'e.g., Thyroid US bilateral, Carotid Doppler study',
                icon: '🔬'
              })
            ),
            React.createElement(FormInput, {
              label: 'Modality',
              type: 'select',
              name: 'modality',
              value: formData.modality,
              onChange: onInputChange,
              icon: '🩺',
              options: [
                { value: 'US', label: 'Ultrasound' },
                { value: 'CT', label: 'CT Scan' },
                { value: 'MR', label: 'MRI' },
                { value: 'XR', label: 'X-Ray' }
              ]
            }),
            
            // Scheduling Section
            React.createElement(FormInput, {
              label: 'Scheduled Date',
              type: 'date',
              name: 'scheduledDate',
              value: formData.scheduledDate,
              onChange: onInputChange,
              required: true,
              icon: '📅'
            }),
            React.createElement(FormInput, {
              label: 'Scheduled Time',
              type: 'time',
              name: 'scheduledTime',
              value: formData.scheduledTime,
              onChange: onInputChange,
              required: true,
              icon: '⏰'
            }),
            
            // Physician Information Section
            React.createElement(FormInput, {
              label: 'Requesting Physician',
              name: 'requestingPhysician',
              value: formData.requestingPhysician,
              onChange: onInputChange,
              placeholder: 'Dr. Smith',
              icon: '👨‍⚕️'
            }),
            React.createElement(FormInput, {
              label: 'Referring Physician',
              name: 'referringPhysician',
              value: formData.referringPhysician,
              onChange: onInputChange,
              placeholder: 'Dr. Johnson',
              icon: '👩‍⚕️'
            }),
            React.createElement(FormInput, {
              label: 'Station AET',
              name: 'stationAET',
              value: formData.stationAET,
              onChange: onInputChange,
              icon: '🖥️'
            })
          ),
          
          // Form Actions
          React.createElement('div', {
            className: 'flex justify-end space-x-6 pt-8 border-t border-slate-700/50'
          },
            React.createElement('button', {
              type: 'button',
              onClick: onCancel,
              className: 'px-8 py-4 border-2 border-slate-600 text-slate-300 bg-slate-700/50 backdrop-blur-sm rounded-xl hover:bg-slate-600/50 font-semibold transition-all duration-150 hover:scale-105 flex items-center space-x-2'
            },
              React.createElement('span', {}, '❌'),
              React.createElement('span', {}, 'Cancel')
            ),
            React.createElement('button', {
              type: 'submit',
              className: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-10 py-4 rounded-xl hover:from-emerald-700 hover:to-emerald-800 font-semibold shadow-lg transform transition-all duration-150 hover:scale-105 border-2 border-emerald-500 flex items-center space-x-2'
            },
              React.createElement('span', {}, '💾'),
              React.createElement('span', {}, 'Create Patient Record')
            )
          )
        )
      )
    )
  );
};
