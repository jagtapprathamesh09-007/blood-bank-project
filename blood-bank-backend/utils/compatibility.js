// ABO and Rh Compatibility Matrix for Blood Components
const getCompatibleBloodGroups = (recipientGroup, componentType) => {
    // Standard Whole Blood & Packed Red Blood Cells (PRBC) Compatibility
    const prbcMatrix = {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'AB-': ['O-', 'A-', 'B-', 'AB-'],
        'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Universal Recipient for PRBC
    };

    // Plasma / Fresh Frozen Plasma (FFP) Compatibility (Reverse of PRBC Matrix)
    const plasmaMatrix = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+'] // AB is Universal Donor for Plasma
    };

    // Platelets & Cryoprecipitate follow similar broad ABO rules
    if (componentType === 'FFP' || componentType === 'Cryoprecipitate') {
        return plasmaMatrix[recipientGroup] || [recipientGroup];
    }

    return prbcMatrix[recipientGroup] || [recipientGroup];
};

module.exports = { getCompatibleBloodGroups };