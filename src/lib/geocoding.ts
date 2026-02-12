/**
 * Geocodes an address string using OpenStreetMap's Nominatim API.
 * Returns { latitude, longitude } or null if not found.
 */
export const geocodeAddress = async (address: string): Promise<{ latitude: number; longitude: number } | null> => {
    if (!address) return null;

    try {
        // Append ", Ireland" context if not present to improve accuracy for this app context if needed
        const query = address.toLowerCase().includes('ireland') ? address : `${address}, Ireland`;

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
            headers: {
                'Accept-Language': 'en'
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding error: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon)
            };
        }
    } catch (error) {
        console.warn('Geocoding failed for address:', address, error);
    }

    return null;
};
