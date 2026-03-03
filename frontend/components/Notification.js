const Notification = ({ notification, drawerOpen = false }) => {
  if (!notification) return null;

  const isSuccess = notification.type === "success";

  return React.createElement(
    "div",
    {
      className: `toast-enter fixed top-4 z-50 min-w-[280px] rounded-xl border px-4 py-3 shadow-xl sm:top-6 ${
        drawerOpen
          ? "left-1/2 -translate-x-1/2"
          : "right-4 sm:right-6"
      } ${
        isSuccess
          ? "border-emerald-500/35 bg-emerald-900/75 text-emerald-100"
          : "border-rose-500/35 bg-rose-900/75 text-rose-100"
      }`,
    },
    React.createElement(
      "div",
      {
        className: "flex items-start gap-3",
      },
      React.createElement(Icon, {
        name: isSuccess ? "check" : "alert",
        size: 16,
        className: isSuccess ? "mt-0.5 text-emerald-300" : "mt-0.5 text-rose-300",
      }),
      React.createElement(
        "div",
        null,
        React.createElement(
          "p",
          {
            className: "text-xs font-semibold uppercase tracking-wider",
          },
          isSuccess ? "Success" : "Error",
        ),
        React.createElement(
          "p",
          {
            className: "mt-1 text-sm",
          },
          notification.message,
        ),
      ),
    ),
  );
};
