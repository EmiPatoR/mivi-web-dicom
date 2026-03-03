const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  required = false,
  error = "",
  placeholder = "",
  options = null,
  ...extraProps
}) => {
  const inputClasses = `w-full rounded-xl border bg-slate-900/80 px-3.5 py-3 text-sm text-slate-100 outline-none transition-colors duration-150 placeholder:text-slate-500 ${
    error
      ? "border-rose-500/70 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20"
      : "border-slate-600/80 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
  }`;

  if (type === "select") {
    return React.createElement(SelectField, {
      label,
      name,
      value,
      onChange,
      required,
      error,
      options: options || [],
    });
  }

  if (type === "date") {
    return React.createElement(DateField, {
      label,
      name,
      value,
      onChange,
      required,
      error,
      ...extraProps,
    });
  }

  if (type === "time") {
    return React.createElement(TimeField, {
      label,
      name,
      value,
      onChange,
      required,
      error,
      ...extraProps,
    });
  }

  return React.createElement(
    FieldFrame,
    { label, name, required, error },
    React.createElement("input", {
      id: name,
      type,
      name,
      value,
      onChange,
      required,
      placeholder,
      className: inputClasses,
    }),
  );
};
