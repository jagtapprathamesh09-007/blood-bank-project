import { jsPDF } from "jspdf";

export const downloadDonationCertificate = (donorName, bloodGroup, appointmentDate, facilityName) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    // Background Styling
    doc.setFillColor(11, 14, 20);
    doc.rect(0, 0, 297, 210, "F");

    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    // Title Header
    doc.setTextColor(239, 68, 68);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("LIFELINE PULSE EMERGENCY NETWORK", 148.5, 40, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("CERTIFICATE OF BLOOD DONATION APPRECIATION", 148.5, 55, { align: "center" });

    // Body Text
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text("This official certificate is gratefully awarded to:", 148.5, 80, { align: "center" });

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(donorName.toUpperCase(), 148.5, 98, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(`For voluntary blood donation of Blood Group: [ ${bloodGroup} ]`, 148.5, 115, { align: "center" });
    doc.text(`Conducted at: ${facilityName} on Date: ${new Date(appointmentDate).toLocaleDateString()}`, 148.5, 125, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(239, 68, 68);
    doc.text("Thank you for your life-saving contribution!", 148.5, 145, { align: "center" });

    // Footer Signature Line
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.line(40, 175, 100, 175);
    doc.line(197, 175, 257, 175);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("Facility Medical Officer", 70, 182, { align: "center" });
    doc.text("Authorized Network Seal", 227, 182, { align: "center" });

    // Save File
    doc.save(`Donation_Certificate_${donorName.replace(/\s+/g, '_')}.pdf`);
};