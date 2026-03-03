const TimeField = ({
  label,
  name,
  value,
  onChange,
  required = false,
  selectedDate = "",
  error = "",
}) => {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = React.useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

  const pad2 = (num) => String(num).padStart(2, "0");

  const normalizeStored = (timeValue) => {
    if (!timeValue) return "";
    if (timeValue.length === 4 && !timeValue.includes(":")) {
      return `${timeValue.slice(0, 2)}:${timeValue.slice(2, 4)}`;
    }
    return timeValue;
  };

  const isValidTime = (timeValue) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeValue);

  const parseTime = (timeValue) => {
    if (!isValidTime(timeValue)) return { hour: 8, minute: 0 };
    const [hour, minute] = timeValue.split(":").map(Number);
    return { hour, minute };
  };

  const formatTime = (hour, minute) => `${pad2(hour)}:${pad2(minute)}`;
  const parseISODate = (dateValue) => {
    if (!dateValue) return null;
    const parts = dateValue.split("-");
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };

  const currentValue = normalizeStored(value || "");
  const selected = parseTime(currentValue);
  const minuteStep = Math.floor(selected.minute / 5) * 5;
  const now = new Date();
  const selectedDateValue = parseISODate(selectedDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDayStart = selectedDateValue
    ? new Date(selectedDateValue.getFullYear(), selectedDateValue.getMonth(), selectedDateValue.getDate())
    : null;
  const isPastDay = selectedDayStart ? selectedDayStart < todayStart : false;
  const isToday = selectedDayStart ? selectedDayStart.getTime() === todayStart.getTime() : false;
  const nowHour = now.getHours();
  const nextMinuteStep = Math.ceil(now.getMinutes() / 5) * 5;
  const minimumHour = isToday ? (nextMinuteStep >= 60 ? nowHour + 1 : nowHour) : 0;
  const availableHours = isPastDay ? [] : hours.filter((hour) => hour >= minimumHour);
  const activeHour = availableHours.includes(selected.hour) ? selected.hour : (availableHours[0] ?? selected.hour);
  const getAvailableMinutesForHour = (hour) => {
    if (!isToday || hour !== nowHour) {
      return minutes;
    }
    return minutes.filter((minute) => minute >= nextMinuteStep);
  };
  const availableMinutes = availableHours.length === 0 ? [] : getAvailableMinutesForHour(activeHour);
  const activeMinute = availableMinutes.includes(minuteStep)
    ? minuteStep
    : (availableMinutes[0] ?? minuteStep);

  const emit = (nextValue) => {
    onChange({ target: { name, value: nextValue } });
  };

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

  const selectHour = (hour) => {
    const hourMinutes = getAvailableMinutesForHour(hour);
    const safeMinute = hourMinutes.includes(minuteStep) ? minuteStep : (hourMinutes[0] ?? 0);
    emit(formatTime(hour, safeMinute));
  };

  const selectMinute = (minute) => {
    if (availableHours.length === 0 || availableMinutes.length === 0) return;
    emit(formatTime(activeHour, minute));
  };

  const setNow = () => {
    const now = new Date();
    const roundedMinute = Math.round(now.getMinutes() / 5) * 5;
    const rolledHour = roundedMinute === 60 ? (now.getHours() + 1) % 24 : now.getHours();
    const minute = roundedMinute === 60 ? 0 : roundedMinute;
    emit(formatTime(rolledHour, minute));
  };

  const renderWheelColumn = (columnLabel, items, activeValue, onSelect, formatter) => {
    return React.createElement(
      "div",
      {
        className: "relative rounded-xl border border-slate-700/80 bg-slate-900/75 p-2",
      },
      React.createElement(
        "p",
        {
          className: "mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500",
        },
        columnLabel,
      ),
      React.createElement(
        "div",
        {
          className: "max-h-44 overflow-y-auto scroll-py-2 snap-y snap-mandatory pr-1",
        },
        ...items.map((item) => {
          const isActive = item === activeValue;
          return React.createElement(
            "button",
            {
              key: `${columnLabel}-${item}`,
              type: "button",
              onClick: () => onSelect(item),
              className: `mb-1 flex h-9 w-full snap-center items-center justify-center rounded-lg text-sm font-mono transition-colors duration-150 ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-slate-300 hover:bg-slate-800"
              }`,
              "aria-selected": isActive,
            },
            formatter(item),
          );
        }),
      ),
    );
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
          className: `flex w-full items-center justify-between rounded-xl border bg-slate-900/80 px-3.5 py-3 text-left text-sm font-mono text-slate-100 outline-none transition-colors duration-150 hover:border-slate-500 ${
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
            className: currentValue ? "text-slate-100" : "text-slate-500",
          },
          currentValue || "HH:MM",
        ),
        React.createElement(
          "span",
          {
            className: "inline-flex items-center gap-2 text-slate-400",
          },
          React.createElement(Icon, { name: "clock", size: 14 }),
          React.createElement(Icon, { name: "chevron-down", size: 14 }),
        ),
      ),
      required &&
        React.createElement("input", {
          tabIndex: -1,
          autoComplete: "off",
          className: "pointer-events-none absolute h-0 w-0 opacity-0",
          value: currentValue,
          onChange: () => {},
          required: true,
          "aria-hidden": true,
        }),
      open &&
        React.createElement(
          "div",
          {
            className: "absolute z-30 mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl",
            role: "dialog",
          },
          React.createElement(
            "div",
            {
              className: "mb-3 grid grid-cols-2 gap-2",
            },
            renderWheelColumn("Hours", availableHours, activeHour, selectHour, pad2),
            renderWheelColumn(
              "Minutes",
              availableMinutes,
              activeMinute,
              selectMinute,
              pad2,
            ),
          ),
          availableHours.length === 0 &&
            React.createElement(
              "p",
              {
                className: "mb-3 text-xs text-rose-300",
              },
              isPastDay
                ? "Selected day is in the past. Choose today or a future date."
                : "No remaining time slots today. Choose another day.",
            ),
          React.createElement(
            "div",
            {
              className: "flex items-center justify-between gap-2",
            },
            React.createElement(
              "button",
              {
                type: "button",
                onClick: setNow,
                disabled: isPastDay || availableHours.length === 0,
                className:
                  "rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors duration-150 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40",
              },
              "Set to now",
            ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => setOpen(false),
                className:
                  "rounded-lg border border-cyan-500/50 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-colors duration-150 hover:bg-cyan-500/25",
              },
              "Done",
            ),
          ),
        ),
    ),
  );
};
