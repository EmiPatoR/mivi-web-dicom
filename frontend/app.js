console.log("Loading DICOM Worklist Manager...");

const { useState, useEffect } = React;

const API = {
  async fetchWorklists() {
    const response = await fetch("/api/worklists");
    if (!response.ok) throw new Error("Failed to fetch worklists");
    return response.json();
  },

  async createWorklist(data) {
    const response = await fetch("/api/worklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create worklist");
    }

    return response.json();
  },

  async deleteWorklist(filename) {
    const response = await fetch(`/api/worklists/${filename}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete worklist");
    return response.json();
  },
};

const Utils = {
  formatDate(dateStr) {
    if (!dateStr) return "";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  },

  formatTime(timeStr) {
    if (!timeStr) return "";
    if (timeStr.length === 4 && !timeStr.includes(":")) {
      return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
    }
    return timeStr;
  },

  generateAccessionNumber(modality) {
    const timestamp = Date.now().toString().slice(-6);
    return `${modality}${timestamp}`;
  },

  generatePatientId() {
    const timestamp = Date.now().toString().slice(-4);
    return `PAT${timestamp}`;
  },

  isPastISODate(dateStr) {
    if (!dateStr) return false;
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return false;
    const target = new Date(year, month - 1, day);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    return targetStart < todayStart;
  },
};

function App() {
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientFirstName: "",
    patientMiddleName: "",
    patientId: "",
    birthDate: "",
    sex: "M",
    requestingPhysician: "",
    referringPhysician: "",
    procedureDescription: "",
    scheduledDate: "",
    scheduledTime: "",
    modality: "US",
    stationAET: "WS80A",
  });

  useEffect(() => {
    loadWorklists().finally(() => {
      setTimeout(() => setLoading(false), 350);
    });
  }, []);

  useEffect(() => {
    if (!showForm && !deleteTarget) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (deleteTarget) {
          setDeleteTarget(null);
        } else if (showForm) {
          setFieldErrors({});
          setShowForm(false);
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showForm, deleteTarget]);

  const loadWorklists = async () => {
    try {
      const data = await API.fetchWorklists();
      setPatients(data);
    } catch (error) {
      console.error("Load error:", error);
      showNotification("Failed to load patient data", "error");
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { key: "patientName", label: "Last name" },
      { key: "patientFirstName", label: "First name" },
      { key: "birthDate", label: "Birth date" },
      { key: "sex", label: "Sex" },
      { key: "procedureDescription", label: "Procedure description" },
      { key: "scheduledDate", label: "Scheduled date" },
      { key: "scheduledTime", label: "Scheduled time" },
    ];

    const missing = requiredFields.filter(({ key }) => {
      const value = formData[key];
      return typeof value === "string" ? value.trim() === "" : !value;
    });

    if (missing.length > 0) {
      const nextErrors = missing.reduce((acc, field) => {
        acc[field.key] = `${field.label} is required.`;
        return acc;
      }, {});
      setFieldErrors(nextErrors);
      const firstMissingKey = missing[0].key;
      const focusTarget = document.querySelector(
        `#${firstMissingKey}-display, [name=\"${firstMissingKey}\"], #${firstMissingKey}`,
      );
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      return;
    }

    setFieldErrors({});

    if (Utils.isPastISODate(formData.scheduledDate)) {
      setFieldErrors({ scheduledDate: "Scheduled date cannot be in the past." });
      const focusTarget = document.querySelector("#scheduledDate-display, [name=\"scheduledDate\"], #scheduledDate");
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      return;
    }

    const finalData = {
      ...formData,
      accessionNumber: formData.accessionNumber || Utils.generateAccessionNumber(formData.modality),
      patientId: formData.patientId || Utils.generatePatientId(),
      procedureStepId: formData.procedureStepId || Utils.generateAccessionNumber(formData.modality),
      stationName: "US_THYROID",
      location: "ULTRASOUND",
    };

    try {
      await API.createWorklist(finalData);

      setFormData({
        patientName: "",
        patientFirstName: "",
        patientMiddleName: "",
        patientId: "",
        birthDate: "",
        sex: "M",
        requestingPhysician: "",
        referringPhysician: "",
        procedureDescription: "",
        scheduledDate: "",
        scheduledTime: "",
        modality: "US",
        stationAET: "WS80A",
      });

      setFieldErrors({});
      setShowForm(false);
      loadWorklists();
      showNotification("Patient created successfully", "success");
    } catch (error) {
      console.error("Create error:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };

  const requestDelete = (patient) => {
    setDeleteTarget(patient);
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    if (!target?.filename) {
      setDeleteTarget(null);
      return;
    }

    try {
      await API.deleteWorklist(target.filename);
      setDeleteTarget(null);
      loadWorklists();
      showNotification("Patient record deleted", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("Failed to delete patient record", "error");
    }
  };

  if (loading) {
    return React.createElement(LoadingScreen);
  }

  return React.createElement(
    "div",
    {
      className: "app-shell min-h-screen",
    },
    React.createElement(Notification, { notification, drawerOpen: showForm }),
    React.createElement(
      "main",
      {
        className: "mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8",
      },
      React.createElement(
        "section",
        {
          className: "panel-surface overflow-hidden rounded-3xl",
        },
        React.createElement(Header, { patientCount: patients.length }),
        React.createElement(ActionBar, {
          patientCount: patients.length,
          showForm,
          onToggleForm: () => {
            setFieldErrors({});
            setShowForm((prev) => !prev);
          },
        }),
        React.createElement(PatientList, {
          patients,
          onDelete: requestDelete,
          formatDate: Utils.formatDate,
          formatTime: Utils.formatTime,
        }),
      ),
    ),
    React.createElement(
      "footer",
      {
        className: "pb-8 text-center",
      },
      React.createElement(
        "p",
        {
          className: "text-xs text-slate-500",
        },
        `© ${new Date().getFullYear()} MiVi | Professional DICOM Workflow`,
      ),
    ),
    showForm && React.createElement(PatientForm, {
      formData,
      fieldErrors,
      onInputChange: handleInputChange,
      onSubmit: handleSubmit,
      onCancel: () => {
        setFieldErrors({});
        setShowForm(false);
      },
    }),
    React.createElement(ConfirmModal, {
      open: Boolean(deleteTarget),
      title: "Delete patient record",
      message: deleteTarget
        ? `This will permanently remove ${deleteTarget.patientName || "this patient"} from the worklist.`
        : "",
      confirmLabel: "Delete record",
      cancelLabel: "Keep record",
      onConfirm: confirmDelete,
      onCancel: () => setDeleteTarget(null),
    }),
  );
}

try {
  const container = document.getElementById("root");
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
  console.log("MiVi Worklist Manager loaded");
} catch (error) {
  console.error("Render error:", error);
}
