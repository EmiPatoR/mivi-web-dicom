const SelectField = ({ label, name, value, onChange, required = false, options = [], error = "" }) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  const selectedOption = options.find((option) => option.value === value) || null;
  const displayValue = selectedOption ? selectedOption.label : "";

  React.useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectValue = (newValue) => {
    onChange({ target: { name, value: newValue } });
    setOpen(false);
  };

  return React.createElement(
    FieldFrame,
    { label, name: `${name}-display`, required, error },
    React.createElement(
      "div",
      {
        ref: rootRef,
        className: "relative",
      },
      React.createElement(
        "button",
        {
          id: `${name}-display`,
          type: "button",
          onClick: () => setOpen((prev) => !prev),
          className: `flex w-full items-center justify-between rounded-xl border bg-slate-900/80 px-3.5 py-3 text-left text-sm text-slate-100 outline-none transition-colors duration-150 hover:border-slate-500 ${
            error
              ? "border-rose-500/70 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
              : "border-slate-600/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          }`,
          "aria-expanded": open,
          "aria-haspopup": "listbox",
        },
        React.createElement(
          "span",
          {
            className: displayValue ? "text-slate-100" : "text-slate-500",
          },
          displayValue || "Select an option",
        ),
        React.createElement(
          "span",
          {
            className: "text-slate-400",
          },
          React.createElement(Icon, { name: "chevron-down", size: 14 }),
        ),
      ),
      required &&
        React.createElement("input", {
          tabIndex: -1,
          autoComplete: "off",
          className: "pointer-events-none absolute h-0 w-0 opacity-0",
          value,
          onChange: () => {},
          required: true,
          "aria-hidden": true,
        }),
      open &&
        React.createElement(
          "div",
          {
            className:
              "absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-900/95 p-1 shadow-2xl backdrop-blur-xl",
            role: "listbox",
          },
          ...options.map((option) =>
            React.createElement(
              "button",
              {
                key: option.value,
                type: "button",
                onClick: () => selectValue(option.value),
                className: `flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                  option.value === value
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "text-slate-200 hover:bg-slate-800"
                }`,
                role: "option",
                "aria-selected": option.value === value,
              },
              option.label,
              option.value === value && React.createElement(Icon, { name: "check", size: 12 }),
            )
          ),
        ),
    ),
  );
};
