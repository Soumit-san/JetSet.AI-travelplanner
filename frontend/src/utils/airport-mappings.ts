export const MAP_TO_IATA: Record<string, string> = {
    // US & Americas
    "New York": "JFK", "Los Angeles": "LAX", "Chicago": "ORD", "Miami": "MIA", "San Francisco": "SFO",
    "Toronto": "YYZ", "Vancouver": "YVR", "Mexico City": "MEX", "Sao Paulo": "GRU",
    // Europe
    "London": "LHR", "Paris": "CDG", "Frankfurt": "FRA", "Amsterdam": "AMS", "Rome": "FCO",
    "Madrid": "MAD", "Barcelona": "BCN", "Berlin": "BER", "Munich": "MUC", "Zurich": "ZRH",
    // Asia/Pacific
    "Tokyo": "HND", "Kyoto": "ITM", "Osaka": "KIX", "Seoul": "ICN", "Beijing": "PEK",
    "Shanghai": "PVG", "Hong Kong": "HKG", "Singapore": "SIN", "Bangkok": "BKK",
    "Kuala Lumpur": "KUL", "Jakarta": "CGK", "Taipei": "TPE", "Manila": "MNL",
    // India (Comprehensive)
    "Delhi": "DEL", "New Delhi": "DEL", "Mumbai": "BOM", "Bangalore": "BLR", "Bengaluru": "BLR",
    "Chennai": "MAA", "Madras": "MAA", "Hyderabad": "HYD", "Kolkata": "CCU", "Calcutta": "CCU",
    "Ahmedabad": "AMD", "Pune": "PNQ", "Goa": "GOI", "Mopa": "GOX", "Kochi": "COK", "Cochin": "COK",
    "Bhubaneswar": "BBI", "Odisha": "BBI", "Jaipur": "JAI", "Lucknow": "LKO", "Guwahati": "GAU",
    "Thiruvananthapuram": "TRV", "Trivandrum": "TRV", "Kozhikode": "CCJ", "Calicut": "CCJ",
    "Patna": "PAT", "Bagdogra": "IXB", "Chandigarh": "IXC", "Madurai": "IXM", "Port Blair": "IXZ",
    "Srinagar": "SXR", "Amritsar": "ATQ", "Varanasi": "VNS", "Coimbatore": "CJB", "Visakhapatnam": "VTZ",
    "Nagpur": "NAG", "Bhopal": "BHO", "Indore": "IDR", "Ranchi": "IXR", "Vadodara": "BDQ",
    "Mangalore": "IXE", "Mangaluru": "IXE", "Tiruchirappalli": "TRZ", "Trichy": "TRZ",
    "Tirupati": "TIR", "Raipur": "RPR", "Jammu": "IXJ", "Dehradun": "DED", "Agartala": "IXA",
    "Imphal": "IMF", "Surat": "STV", "Udaipur": "UDR", "Jodhpur": "JDH", "Gaya": "GAY",
    "Dibrugarh": "DIB", "Silchar": "IXS", "Dimapur": "DMU", "Aurangabad": "IXU", "Rajkot": "RAJ",
    "Tuticorin": "TCR", "Hubli": "HBX", "Belgaum": "IXG", "Mysore": "MYQ",
    // Middle East & Africa
    "Dubai": "DXB", "Doha": "DOH", "Abu Dhabi": "AUH", "Istanbul": "IST", "Cairo": "CAI",
    "Johannesburg": "JNB", "Cape Town": "CPT",
    // Defaults/Fallbacks
    "India": "DEL", "USA": "JFK", "UK": "LHR"
};

/**
 * Normalizes an origin/destination string to a valid IATA code.
 * Reverts to "DEL" (or another default) if no mapping is found.
 */
export const getIataCode = (location: string, fallback: string = "DEL"): string => {
    if (!location) return fallback;
    const cleanLocation = location.trim();
    // Check if user literally typed "JFK" or something exactly 3 letters first.
    if (cleanLocation.length === 3 && /^[A-Za-z]{3}$/.test(cleanLocation)) {
        return cleanLocation.toUpperCase();
    }

    // Strict lookup for now
    for (const [key, value] of Object.entries(MAP_TO_IATA)) {
        if (cleanLocation.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }
    return fallback;
};
