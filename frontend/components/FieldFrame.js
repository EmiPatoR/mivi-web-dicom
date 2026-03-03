const FieldFrame = ({ label, name, required = false, error = "", children }) => {
  return React.createElement(
    "div",
    {
      className: "space-y-2",
    },
    React.createElement(
      "label",
      {
        htmlFor: name,
        className: `block text-xs font-semibold uppercase tracking-[0.08em] ${
          error ? "text-rose-300" : "text-slate-400"
        }`,
      },
      `${label}${required ? " *" : ""}`,
    ),
    children,
    error &&
      React.createElement(
        "p",
        {
          className: "text-xs text-rose-300",
        },
        error,
      ),
  );
};
