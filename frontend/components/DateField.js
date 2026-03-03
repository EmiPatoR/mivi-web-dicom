const DateField = ({ label, name, value, onChange, required = false, minDate = "", error = "" }) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  const parseValueToDate = (dateValue) => {
    if (!dateValue) return null;
    const [year, month, day] = dateValue.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const formatDisplay = (dateValue) => {
    const date = parseValueToDate(dateValue);
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatIso = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const parseISODate = (dateValue) => {
    if (!dateValue) return null;
    const [year, month, day] = dateValue.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const minDateValue = minDate === "today" ? formatIso(todayStart) : minDate;
  const minDateObj = parseISODate(minDateValue);
  const minDateStart = minDateObj
    ? new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate())
    : null;
  const initialDate = parseValueToDate(value) || today;
  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth());

  React.useEffect(() => {
    const selectedDate = parseValueToDate(value);
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [value]);

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

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (direction) => {
    if (direction === "prev") {
      const prevDate = new Date(viewYear, viewMonth - 1, 1);
      if (minDateStart) {
        const prevMonthStart = new Date(prevDate.getFullYear(), prevDate.getMonth(), 1);
        const minMonthStart = new Date(minDateStart.getFullYear(), minDateStart.getMonth(), 1);
        if (prevMonthStart < minMonthStart) {
          return;
        }
      }

      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((prev) => prev - 1);
      } else {
        setViewMonth((prev) => prev - 1);
      }
      return;
    }

    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingEmpty = (firstDay + 6) % 7;

  const selectedIso = value;

  const dayButtons = [];
  for (let i = 0; i < leadingEmpty; i += 1) {
    dayButtons.push(React.createElement("div", { key: `empty-${i}` }));
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(viewYear, viewMonth, day);
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const iso = formatIso(date);
    const isSelected = iso === selectedIso;
    const isToday = iso === formatIso(today);
    const isDisabled = minDateStart ? dayStart < minDateStart : false;

    dayButtons.push(
      React.createElement(
        "button",
        {
          key: iso,
          type: "button",
          disabled: isDisabled,
          onClick: () => {
            if (isDisabled) return;
            onChange({ target: { name, value: iso } });
            setOpen(false);
          },
          className: `rounded-md px-2 py-1.5 text-sm transition-colors duration-150 ${
            isDisabled
              ? "cursor-not-allowed text-slate-600"
              : isSelected
              ? "bg-cyan-500 text-slate-950"
              : isToday
                ? "border border-cyan-500/40 text-cyan-200 hover:bg-slate-800"
                : "text-slate-200 hover:bg-slate-800"
          }`,
        },
        day,
      ),
    );
  }

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
          "aria-haspopup": "dialog",
        },
        React.createElement(
          "span",
          {
            className: value ? "text-slate-100" : "text-slate-500",
          },
          formatDisplay(value) || "DD/MM/YYYY",
        ),
        React.createElement(Icon, { name: "calendar", size: 14, className: "text-slate-400" }),
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
            className: "absolute z-30 mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl",
          },
          React.createElement(
            "div",
            {
              className: "mb-3 flex items-center justify-between",
            },
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => changeMonth("prev"),
                disabled: minDateStart &&
                  new Date(viewYear, viewMonth, 1) <=
                    new Date(minDateStart.getFullYear(), minDateStart.getMonth(), 1),
                className: "rounded-md p-1.5 text-slate-300 hover:bg-slate-800",
              },
              React.createElement(Icon, { name: "chevron-left", size: 14 }),
            ),
            React.createElement(
              "p",
              {
                className: "text-sm font-semibold text-slate-200",
              },
              monthLabel,
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => changeMonth("next"),
                className: "rounded-md p-1.5 text-slate-300 hover:bg-slate-800",
              },
              React.createElement(Icon, { name: "chevron-right", size: 14 }),
            ),
          ),
          React.createElement(
            "div",
            {
              className: "mb-1 grid grid-cols-7 gap-1 px-1 text-center text-[11px] uppercase tracking-wider text-slate-500",
            },
            ...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) =>
              React.createElement("span", { key: dayName }, dayName)
            ),
          ),
          React.createElement(
            "div",
            {
              className: "grid grid-cols-7 gap-1",
            },
            ...dayButtons,
          ),
        ),
    ),
  );
};
