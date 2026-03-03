const LoadingScreen = () => {
  return React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-[radial-gradient(circle_at_16%_20%,rgba(47,192,178,0.18),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(55,143,197,0.2),transparent_30%),linear-gradient(150deg,#071116,#0a1a21_52%,#0d2732)] flex items-center justify-center px-6",
    },
    React.createElement(
      "div",
      {
        className:
          "w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/80 p-8 text-center shadow-2xl backdrop-blur-xl",
      },
      React.createElement(
        "div",
        {
          className: "mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300",
        },
      ),
      React.createElement(
        "p",
        {
          className: "text-lg font-semibold text-slate-100",
        },
        "Loading MiVi Worklist",
      ),
      React.createElement(
        "p",
        {
          className: "mt-2 text-sm text-slate-400",
        },
        "Preparing patient scheduling data",
      ),
    ),
  );
};
