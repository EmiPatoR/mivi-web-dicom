export function formatDisplayName(
  patientName: string,
  patientFirstName?: string,
  patientMiddleName?: string,
): string {
  const parts = [patientFirstName, patientMiddleName].filter(Boolean).join(" ");
  if (!patientName) {
    return parts ? parts : "Unknown";
  }
  return parts ? `${patientName}, ${parts}` : patientName;
}

export function parseDicomPersonName(value: string): {
  patientName: string;
  patientFirstName?: string;
  patientMiddleName?: string;
} {
  const [last = "", first = "", middle = ""] = value.split("^");
  return {
    patientName: last || value,
    patientFirstName: first || undefined,
    patientMiddleName: middle || undefined,
  };
}
