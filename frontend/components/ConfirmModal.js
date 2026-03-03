const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return React.createElement(
    "div",
    {
      className: "modal-overlay fixed inset-0 z-50",
      role: "dialog",
      "aria-modal": true,
      "aria-labelledby": "confirm-modal-title",
    },
    React.createElement("div", {
      className: "absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]",
      onClick: onCancel,
    }),
    React.createElement(
      "div",
      {
        className: "relative z-10 flex min-h-full items-center justify-center p-4",
      },
      React.createElement(
        "div",
        {
          className:
            "modal-panel w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl",
        },
        React.createElement(
          "div",
          {
            className: "mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-900/30 text-rose-300",
          },
          React.createElement(Icon, { name: "alert", size: 18 }),
        ),
        React.createElement(
          "h3",
          {
            id: "confirm-modal-title",
            className: "text-lg font-semibold text-slate-100",
          },
          title,
        ),
        React.createElement(
          "p",
          {
            className: "mt-2 text-sm leading-relaxed text-slate-400",
          },
          message,
        ),
        React.createElement(
          "div",
          {
            className: "mt-6 flex items-center justify-end gap-3",
          },
          React.createElement(
            "button",
            {
              type: "button",
              onClick: onCancel,
              className:
                "rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors duration-150 hover:bg-slate-700",
            },
            cancelLabel,
          ),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: onConfirm,
              className:
                "inline-flex items-center gap-1 rounded-xl border border-rose-500/50 bg-rose-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-rose-400",
            },
            React.createElement(Icon, { name: "trash", size: 13 }),
            confirmLabel,
          ),
        ),
      ),
    ),
  );
};
