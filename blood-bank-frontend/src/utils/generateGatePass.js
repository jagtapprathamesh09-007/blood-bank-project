import { jsPDF } from "jspdf";

export const downloadGatePassInvoice = (dispatchDetails) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Dark Sleek Border Styling
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(2);
    doc.rect(10, 10, 190, 277);

    // Header Title
    doc.setFillColor(15, 23, 42);
    doc.rect(10, 10, 190, 35, "F");

    doc.setTextColor(239, 68, 68);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("LIFELINE PULSE EMERGENCY NETWORK", 105, 25, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("COLD-CHAIN BLOOD TRANSFER GATE PASS & INVOICE", 105, 36, { align: "center" });

    // Dispatch Details Table / Summary
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TRANSFER MANIFEST & DISPATCH DETAILS", 20, 60);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const details = [
        ["Gate Pass ID:", `GP-${Date.now().toString().slice(-6)}`],
        ["Dispatch Date & Time:", new Date().toLocaleString()],
        ["Origin Facility (Blood Bank):", dispatchDetails.bloodBankName || "Regional Blood Reserve"],
        ["Destination Hospital ER:", dispatchDetails.hospitalName || "Emergency Ward Node"],
        ["Patient Identification:", dispatchDetails.patientName || "Critical Care Unit"],
        ["Required Blood Group:", dispatchDetails.bloodGroup || "O+ (PRBC)"],
        ["Dispatched Quantity:", `${dispatchDetails.units || 2} Units`],
        ["Cold-Chain Transport Temp:", "4.0 °C (Monitored Active Control)"],
        ["Logistics Vehicle Number:", dispatchDetails.vehicleNumber || "MH-31-EMG-108"],
        ["Estimated Transit Duration:", dispatchDetails.eta || "15 Mins"]
    ];

    let startY = 72;
    details.forEach(([label, value]) => {
        doc.setFont("helvetica", "bold");
        doc.text(label, 20, startY);
        doc.setFont("helvetica", "normal");
        doc.text(value, 85, startY);
        startY += 10;
    });

    // Verification Seal Box
    doc.setDrawColor(203, 213, 225);
    doc.rect(20, startY + 15, 170, 45);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text("COLD-CHAIN INTEGRITY VERIFICATION", 25, startY + 25);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text("This seal confirms that blood components were stored & transported at regulated 2°C - 6°C.", 25, startY + 33);
    doc.text("Inspect temperature indicator and RFID seals before opening thermal container in ER.", 25, startY + 40);

    // Signatures
    doc.setDrawColor(100, 116, 139);
    doc.line(25, 250, 80, 250);
    doc.line(130, 250, 185, 250);

    doc.setFontSize(9);
    doc.text("Dispatch Officer Signature", 52.5, 256, { align: "center" });
    doc.text("Receiving ER Medical Seal", 157.5, 256, { align: "center" });

    // Save File
    doc.save(`GatePass_${dispatchDetails.patientName || 'Dispatch'}.pdf`);
};