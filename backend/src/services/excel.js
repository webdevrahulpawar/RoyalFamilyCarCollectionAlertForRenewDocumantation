const xlsx = require("xlsx");

function exportCarsToExcel({ cars }) {
  // Flatten into stable columns for easy viewing.
  const rows = cars.map((c) => {
    const d = c.document || {};
    return {
      CarName: c.carName,
      VehicleNumber: c.vehicleNumber,
      OwnerName: c.ownerName,
      Description: c.description || "",

      RCNumber: d.rc?.number || "",
      RCExpiryDate: d.rc?.expiryDate ? new Date(d.rc.expiryDate).toISOString().slice(0, 10) : "",

      InsuranceNumber: d.insurance?.number || "",
      InsuranceExpiryDate: d.insurance?.expiryDate
        ? new Date(d.insurance.expiryDate).toISOString().slice(0, 10)
        : "",

      PUCNumber: d.puc?.number || "",
      PUCExpiryDate: d.puc?.expiryDate ? new Date(d.puc.expiryDate).toISOString().slice(0, 10) : "",

      DriverName: d.driverLicense?.driverName || "",
      DriverLicenseNumber: d.driverLicense?.licenseNumber || "",
      DriverLicenseExpiryDate: d.driverLicense?.expiryDate
        ? new Date(d.driverLicense.expiryDate).toISOString().slice(0, 10)
        : "",

      OtherDocuments: Array.isArray(d.otherDocuments) ? JSON.stringify(d.otherDocuments) : "[]",
    };
  });

  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Cars");

  return xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
}

module.exports = { exportCarsToExcel };

