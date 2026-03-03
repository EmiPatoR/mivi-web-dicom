const PatientForm = ({ formData, fieldErrors = {}, onInputChange, onSubmit, onCancel }) => {
  return React.createElement(
    "div",
    {
      className: "form-drawer-overlay fixed inset-0 z-40",
    },
    React.createElement("div", {
      className: "absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]",
      onClick: onCancel,
    }),
    React.createElement(
      "aside",
      {
        className:
          "form-drawer-panel absolute right-0 top-0 h-full w-full max-w-2xl border-l border-slate-700/70 bg-slate-900/95 shadow-2xl",
      },
      React.createElement(
        "div",
        {
          className: "flex h-full flex-col",
        },
        React.createElement(
          "div",
          {
            className: "border-b border-slate-700/70 px-6 py-5",
          },
          React.createElement(
            "h3",
            {
              className: "text-xl font-semibold text-slate-50",
            },
            "Schedule New Patient",
          ),
          React.createElement(
            "p",
            {
              className: "mt-1 text-sm text-slate-400",
            },
            "Add patient demographics and procedure details for the worklist.",
          ),
        ),
        React.createElement(
          "form",
          {
            onSubmit,
            noValidate: true,
            className: "flex min-h-0 flex-1 flex-col",
          },
          React.createElement(
            "div",
            {
              className: "flex-1 space-y-8 overflow-y-auto px-6 py-6",
            },
            React.createElement(
              "section",
              {
                className: "space-y-4",
              },
              React.createElement(
                "h4",
                {
                  className: "text-sm font-semibold uppercase tracking-[0.12em] text-cyan-300",
                },
                "Identity",
              ),
              React.createElement(
                "div",
                {
                  className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
                },
                React.createElement(FormInput, {
                  label: "Last Name",
                  name: "patientName",
                  value: formData.patientName,
                  onChange: onInputChange,
                  required: true,
                  error: fieldErrors.patientName,
                }),
                React.createElement(FormInput, {
                  label: "First Name",
                  name: "patientFirstName",
                  value: formData.patientFirstName,
                  onChange: onInputChange,
                  required: true,
                  error: fieldErrors.patientFirstName,
                }),
                React.createElement(FormInput, {
                  label: "Middle Name",
                  name: "patientMiddleName",
                  value: formData.patientMiddleName,
                  onChange: onInputChange,
                  error: fieldErrors.patientMiddleName,
                }),
                React.createElement(FormInput, {
                  label: "Patient ID",
                  name: "patientId",
                  value: formData.patientId,
                  onChange: onInputChange,
                  placeholder: "Auto-generated if empty",
                  error: fieldErrors.patientId,
                }),
                React.createElement(FormInput, {
                  label: "Birth Date",
                  type: "date",
                  name: "birthDate",
                  value: formData.birthDate,
                  onChange: onInputChange,
                  required: true,
                  error: fieldErrors.birthDate,
                }),
                React.createElement(FormInput, {
                  label: "Sex",
                  type: "select",
                  name: "sex",
                  value: formData.sex,
                  onChange: onInputChange,
                  required: true,
                  error: fieldErrors.sex,
                  options: [
                    { value: "M", label: "Male" },
                    { value: "F", label: "Female" },
                    { value: "O", label: "Other" },
                  ],
                }),
              ),
            ),
            React.createElement(
              "section",
              {
                className: "space-y-4",
              },
              React.createElement(
                "h4",
                {
                  className: "text-sm font-semibold uppercase tracking-[0.12em] text-cyan-300",
                },
                "Clinical",
              ),
              React.createElement(FormInput, {
                label: "Procedure Description",
                name: "procedureDescription",
                value: formData.procedureDescription,
                onChange: onInputChange,
                required: true,
                placeholder: "e.g. Thyroid US bilateral",
                error: fieldErrors.procedureDescription,
              }),
              React.createElement(
                "div",
                {
                  className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
                },
                React.createElement(FormInput, {
                  label: "Modality",
                  type: "select",
                  name: "modality",
                  value: formData.modality,
                  onChange: onInputChange,
                  error: fieldErrors.modality,
                  options: [
                    { value: "US", label: "Ultrasound" },
                    { value: "CT", label: "CT" },
                    { value: "MR", label: "MRI" },
                    { value: "XR", label: "X-Ray" },
                  ],
                }),
                React.createElement(FormInput, {
                  label: "Station AET",
                  name: "stationAET",
                  value: formData.stationAET,
                  onChange: onInputChange,
                  error: fieldErrors.stationAET,
                }),
              ),
            ),
            React.createElement(
              "section",
              {
                className: "space-y-4",
              },
              React.createElement(
                "h4",
                {
                  className: "text-sm font-semibold uppercase tracking-[0.12em] text-cyan-300",
                },
                "Scheduling",
              ),
              React.createElement(
                "div",
                {
                  className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
                },
                React.createElement(FormInput, {
                  label: "Scheduled Date",
                  type: "date",
                  name: "scheduledDate",
                  value: formData.scheduledDate,
                  onChange: onInputChange,
                  required: true,
                  error: fieldErrors.scheduledDate,
                  minDate: "today",
                }),
                React.createElement(FormInput, {
                  label: "Scheduled Time",
                  type: "time",
                  name: "scheduledTime",
                  value: formData.scheduledTime,
                  onChange: onInputChange,
                  required: true,
                  error: fieldErrors.scheduledTime,
                  selectedDate: formData.scheduledDate,
                }),
                React.createElement(FormInput, {
                  label: "Requesting Physician",
                  name: "requestingPhysician",
                  value: formData.requestingPhysician,
                  onChange: onInputChange,
                  placeholder: "Dr. Smith",
                  error: fieldErrors.requestingPhysician,
                }),
                React.createElement(FormInput, {
                  label: "Referring Physician",
                  name: "referringPhysician",
                  value: formData.referringPhysician,
                  onChange: onInputChange,
                  placeholder: "Dr. Johnson",
                  error: fieldErrors.referringPhysician,
                }),
              ),
            ),
          ),
          React.createElement(
            "div",
            {
              className:
                "border-t border-slate-700/70 bg-slate-900/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80",
            },
            React.createElement(
              "div",
              {
                className: "flex items-center justify-end gap-3",
              },
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: onCancel,
                  className:
                    "rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors duration-150 hover:bg-slate-700",
                },
                "Cancel",
              ),
              React.createElement(
                "button",
                {
                  type: "submit",
                  className:
                    "rounded-xl border border-cyan-400/60 bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-cyan-400",
                },
                "Create Patient",
              ),
            ),
          ),
        ),
      ),
    ),
  );
};
