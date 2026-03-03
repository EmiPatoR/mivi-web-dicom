const Icon = ({ name, size = 14, className = "", strokeWidth = 1.8 }) => {
  const baseProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "users":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
        React.createElement("circle", { cx: "8.5", cy: "7", r: "4" }),
        React.createElement("path", { d: "M20 8v6" }),
        React.createElement("path", { d: "M23 11h-6" }),
      );
    case "calendar":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }),
        React.createElement("path", { d: "M16 2v4" }),
        React.createElement("path", { d: "M8 2v4" }),
        React.createElement("path", { d: "M3 10h18" }),
      );
    case "clipboard":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("rect", { x: "8", y: "2", width: "8", height: "4", rx: "1" }),
        React.createElement("path", { d: "M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3" }),
      );
    case "plus":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "M12 5v14" }),
        React.createElement("path", { d: "M5 12h14" }),
      );
    case "x":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "M18 6L6 18" }),
        React.createElement("path", { d: "M6 6l12 12" }),
      );
    case "id":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("rect", { x: "3", y: "5", width: "18", height: "14", rx: "2" }),
        React.createElement("path", { d: "M7 9h4" }),
        React.createElement("path", { d: "M7 13h3" }),
        React.createElement("circle", { cx: "16.5", cy: "12", r: "2.5" }),
      );
    case "user":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("circle", { cx: "12", cy: "8", r: "4" }),
        React.createElement("path", { d: "M4 20a8 8 0 0 1 16 0" }),
      );
    case "scan":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "M3 7V5a2 2 0 0 1 2-2h2" }),
        React.createElement("path", { d: "M21 7V5a2 2 0 0 0-2-2h-2" }),
        React.createElement("path", { d: "M3 17v2a2 2 0 0 0 2 2h2" }),
        React.createElement("path", { d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
        React.createElement("path", { d: "M4 12h16" }),
      );
    case "file":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" }),
        React.createElement("path", { d: "M14 2v5h5" }),
      );
    case "clock":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "M12 7v6l4 2" }),
      );
    case "check":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "m8.5 12 2.3 2.3L15.5 9.7" }),
      );
    case "trash":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "M3 6h18" }),
        React.createElement("path", { d: "M8 6V4h8v2" }),
        React.createElement("path", { d: "M19 6l-1 14H6L5 6" }),
      );
    case "chevron-down":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "m6 9 6 6 6-6" }),
      );
    case "chevron-up":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "m6 15 6-6 6 6" }),
      );
    case "chevron-left":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "m15 18-6-6 6-6" }),
      );
    case "chevron-right":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("path", { d: "m9 18 6-6-6-6" }),
      );
    case "alert":
      return React.createElement(
        "svg",
        baseProps,
        React.createElement("circle", { cx: "12", cy: "12", r: "9" }),
        React.createElement("path", { d: "M12 8v5" }),
        React.createElement("path", { d: "M12 16h.01" }),
      );
    default:
      return null;
  }
};
