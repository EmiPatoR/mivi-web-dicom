const PatientList = ({ patients, onDelete, formatDate, formatTime }) => {
  if (patients.length === 0) {
    return React.createElement(
      "div",
      {
        className: "px-6 py-16 sm:px-8",
      },
      React.createElement(
        "div",
        {
          className:
            "mx-auto max-w-xl rounded-2xl border border-dashed border-slate-600 bg-slate-900/45 px-8 py-12 text-center",
        },
        React.createElement(
          "div",
          {
            className: "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-cyan-300",
          },
          React.createElement(Icon, { name: "clipboard", size: 18 }),
        ),
        React.createElement(
          "p",
          {
            className: "text-xl font-semibold text-slate-100",
          },
          "No patients scheduled",
        ),
        React.createElement(
          "p",
          {
            className: "mt-2 text-sm leading-relaxed text-slate-400",
          },
          "Create the first worklist entry to start routing studies to DICOM.",
        ),
      ),
    );
  }

  return React.createElement(
    "div",
    {
      className: "px-6 py-6 sm:px-8",
    },
    React.createElement(
      "div",
      {
        className: "mx-auto max-w-7xl space-y-3",
      },
      ...patients.map((patient, index) =>
        React.createElement(PatientCard, {
          key: patient.filename || `${patient.patientId || "patient"}-${index}`,
          patient,
          onDelete,
          formatDate,
          formatTime,
        })
      ),
    ),
  );
};
