const ActionBar = ({ patientCount, showForm, onToggleForm }) => {
  return React.createElement(
    "div",
    {
      className: "border-b border-slate-700/60 bg-slate-950/35 px-6 py-4 sm:px-8",
    },
    React.createElement(
      "div",
      {
        className: "mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
      },
      React.createElement(
        "div",
        null,
        React.createElement(
          "h2",
          {
            className: "inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-slate-100 sm:text-xl",
          },
          React.createElement(Icon, { name: "clipboard", size: 16, className: "text-cyan-300" }),
          "Today's Worklist",
        ),
        React.createElement(
          "p",
          {
            className: "text-sm text-slate-400",
          },
          `${patientCount} scheduled ${patientCount === 1 ? "exam" : "exams"}`,
        ),
      ),
      React.createElement(
        "button",
        {
          onClick: onToggleForm,
          className: `${
            showForm
              ? "border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700"
              : "border-cyan-500/50 bg-cyan-500 text-slate-950 hover:bg-cyan-400"
          } inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors duration-150`,
        },
        React.createElement(Icon, { name: showForm ? "x" : "plus", size: 14 }),
        showForm ? "Close Form" : "Schedule Patient",
      ),
    ),
  );
};
