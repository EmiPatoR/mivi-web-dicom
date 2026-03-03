const Header = ({ patientCount }) => {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return React.createElement(
    "header",
    {
      className: "border-b border-slate-700/60 bg-slate-950/50 backdrop-blur-xl",
    },
    React.createElement(
      "div",
      {
        className: "mx-auto max-w-7xl px-6 py-5 sm:px-8",
      },
      React.createElement(
        "div",
        {
          className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        },
        React.createElement(
          "div",
          {
            className: "flex items-center gap-4",
          },
          React.createElement(
            "div",
            {
              className:
                "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-extrabold tracking-wide text-slate-950 shadow-md",
            },
            "MV",
          ),
          React.createElement(
            "div",
            null,
            React.createElement(
              "h1",
              {
                className: "text-2xl font-semibold tracking-tight text-slate-50",
              },
              "DICOM Worklist Manager",
            ),
            React.createElement(
              "p",
              {
                className: "text-sm text-slate-300",
              },
              "MiVi Clinical Operations",
            ),
          ),
        ),
        React.createElement(
          "div",
          {
            className: "flex items-center gap-3",
          },
          React.createElement(
            "div",
            {
              className: "rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-2",
            },
            React.createElement(
              "p",
              {
                className: "inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400",
              },
              React.createElement(Icon, { name: "users", size: 13 }),
              "Scheduled Patients",
            ),
            React.createElement(
              "p",
              {
                className: "text-2xl font-semibold text-cyan-200",
              },
              patientCount,
            ),
          ),
          React.createElement(
            "div",
            {
              className:
                "hidden rounded-xl border border-slate-700/70 bg-slate-900/50 px-4 py-3 text-right sm:block",
            },
            React.createElement(
              "p",
              {
                className: "inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400",
              },
              React.createElement(Icon, { name: "calendar", size: 12 }),
              "Today",
            ),
            React.createElement(
              "p",
              {
                className: "font-mono text-sm font-semibold text-slate-200",
              },
              today,
            ),
          ),
        ),
      ),
    ),
  );
};
