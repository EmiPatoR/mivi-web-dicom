const PatientCard = ({ patient, onDelete, formatDate, formatTime }) => {
  const modalityMap = {
    US: "Ultrasound",
    CT: "CT",
    MR: "MRI",
    MRI: "MRI",
    XR: "X-Ray",
  };

  const modalityCode = (patient.modality || "").toUpperCase();
  const modalityLabel = modalityMap[modalityCode] || patient.modality || "Unknown";
  const sex = (patient.sex || "N/A").toString().toUpperCase();

  return React.createElement(
    "article",
    {
      className:
        "list-stagger rounded-2xl border border-slate-700/80 bg-slate-900/70 p-4 shadow-lg transition-all duration-150 hover:border-cyan-400/40 hover:bg-slate-900",
    },
    React.createElement(
      "div",
      {
        className: "grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_auto]",
      },
      React.createElement(
        "div",
        {
          className: "min-w-0",
        },
        React.createElement(
          "h3",
          {
            className: "truncate text-lg font-semibold text-slate-100",
            title: patient.patientName || "Unknown Patient",
          },
          patient.patientName || "Unknown Patient",
        ),
        React.createElement(
          "div",
          {
            className: "mt-2 flex flex-wrap items-center gap-2 text-xs",
          },
          React.createElement(
            "span",
            {
              className: "inline-flex items-center gap-1 rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1 text-slate-300",
            },
            React.createElement(Icon, { name: "id", size: 12 }),
            `ID ${patient.patientId || "N/A"}`,
          ),
          React.createElement(
            "span",
            {
              className: "inline-flex items-center gap-1 rounded-md border border-slate-600 bg-slate-800 px-2.5 py-1 text-slate-300",
            },
            React.createElement(Icon, { name: "user", size: 12 }),
            `Sex ${sex}`,
          ),
          React.createElement(
            "span",
            {
              className:
                "inline-flex items-center gap-1 rounded-md border border-cyan-500/40 bg-cyan-900/30 px-2.5 py-1 font-semibold text-cyan-200",
            },
            React.createElement(Icon, { name: "scan", size: 12 }),
            modalityLabel,
          ),
          React.createElement(
            "span",
            {
              className: "inline-flex items-center gap-1 font-mono text-[11px] text-slate-500",
            },
            React.createElement(Icon, { name: "file", size: 11 }),
            patient.filename || "",
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "space-y-2",
        },
        React.createElement(
          "p",
          {
            className: "text-sm text-slate-200",
          },
          patient.procedureDescription || "No procedure specified",
        ),
        React.createElement(
          "div",
          {
            className: "flex items-center gap-4 text-xs text-slate-400",
          },
          React.createElement(
            "span",
            {
              className: "inline-flex items-center gap-1 font-mono",
            },
            React.createElement(Icon, { name: "calendar", size: 12 }),
            formatDate(patient.scheduledDate) || "Date N/A",
          ),
          React.createElement(
            "span",
            {
              className: "inline-flex items-center gap-1 font-mono",
            },
            React.createElement(Icon, { name: "clock", size: 12 }),
            formatTime(patient.scheduledTime) || "Time N/A",
          ),
        ),
      ),
      React.createElement(
        "div",
        {
          className: "flex items-center gap-3 xl:justify-end",
        },
        React.createElement(
          "span",
          {
            className:
              "inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-200",
          },
          React.createElement(Icon, { name: "check", size: 12 }),
          "Ready",
        ),
        React.createElement(
          "button",
          {
            onClick: () => onDelete(patient),
            className:
              "inline-flex items-center gap-1 rounded-lg border border-rose-500/50 bg-rose-900/25 px-3 py-2 text-xs font-semibold text-rose-200 transition-colors duration-150 hover:bg-rose-900/45",
          },
          React.createElement(Icon, { name: "trash", size: 12 }),
          "Delete",
        ),
      ),
    ),
  );
};
