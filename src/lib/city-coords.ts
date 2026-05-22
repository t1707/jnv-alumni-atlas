// Hardcoded lat/lng for common Indian cities + a few global ones.
// Used for city-level pins on the visualize map. Lookup is case-insensitive
// and tries to match any of these names appearing in an address string.

export type CityCoord = { name: string; state?: string; lat: number; lng: number };

export const CITY_COORDS: CityCoord[] = [
  // Rajasthan
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Jodhpur", state: "Rajasthan", lat: 26.2389, lng: 73.0243 },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lng: 73.7125 },
  { name: "Kota", state: "Rajasthan", lat: 25.2138, lng: 75.8648 },
  { name: "Ajmer", state: "Rajasthan", lat: 26.4499, lng: 74.6399 },
  { name: "Bikaner", state: "Rajasthan", lat: 28.0229, lng: 73.3119 },
  { name: "Alwar", state: "Rajasthan", lat: 27.5530, lng: 76.6346 },
  { name: "Bharatpur", state: "Rajasthan", lat: 27.2173, lng: 77.4901 },
  { name: "Sikar", state: "Rajasthan", lat: 27.6094, lng: 75.1399 },
  { name: "Pali", state: "Rajasthan", lat: 25.7711, lng: 73.3234 },
  { name: "Nagaur", state: "Rajasthan", lat: 27.1989, lng: 73.7406 },
  { name: "Tonk", state: "Rajasthan", lat: 26.1693, lng: 75.7849 },
  { name: "Banswara", state: "Rajasthan", lat: 23.5461, lng: 74.4350 },
  { name: "Chittorgarh", state: "Rajasthan", lat: 24.8887, lng: 74.6269 },
  { name: "Bhilwara", state: "Rajasthan", lat: 25.3463, lng: 74.6364 },
  { name: "Sri Ganganagar", state: "Rajasthan", lat: 29.9094, lng: 73.8800 },
  { name: "Hanumangarh", state: "Rajasthan", lat: 29.5818, lng: 74.3294 },
  { name: "Churu", state: "Rajasthan", lat: 28.2980, lng: 74.9683 },
  { name: "Jhunjhunu", state: "Rajasthan", lat: 28.1289, lng: 75.3996 },
  { name: "Dausa", state: "Rajasthan", lat: 26.8854, lng: 76.3349 },
  { name: "Karauli", state: "Rajasthan", lat: 26.4988, lng: 77.0269 },
  { name: "Sawai Madhopur", state: "Rajasthan", lat: 26.0173, lng: 76.3500 },
  { name: "Barmer", state: "Rajasthan", lat: 25.7521, lng: 71.3967 },
  { name: "Jaisalmer", state: "Rajasthan", lat: 26.9157, lng: 70.9083 },
  { name: "Kuchaman City", state: "Rajasthan", lat: 27.1465, lng: 74.8520 },

  // Major Indian metros
  { name: "New Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", state: "Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Agra", state: "Uttar Pradesh", lat: 27.1767, lng: 78.0081 },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739 },
  { name: "Prayagraj", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Allahabad", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { name: "Noida", state: "Uttar Pradesh", lat: 28.5355, lng: 77.3910 },
  { name: "Ghaziabad", state: "Uttar Pradesh", lat: 28.6692, lng: 77.4538 },
  { name: "Gurgaon", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Gurugram", state: "Haryana", lat: 28.4595, lng: 77.0266 },
  { name: "Faridabad", state: "Haryana", lat: 28.4089, lng: 77.3178 },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.7333, lng: 76.7794 },
  { name: "Amritsar", state: "Punjab", lat: 31.6340, lng: 74.8723 },
  { name: "Ludhiana", state: "Punjab", lat: 30.9010, lng: 75.8573 },
  { name: "Patiala", state: "Punjab", lat: 30.3398, lng: 76.3869 },
  { name: "Dehradun", state: "Uttarakhand", lat: 30.3165, lng: 78.0322 },
  { name: "Shimla", state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  { name: "Srinagar", state: "J&K", lat: 34.0837, lng: 74.7973 },
  { name: "Jammu", state: "J&K", lat: 32.7266, lng: 74.8570 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Ranchi", state: "Jharkhand", lat: 23.3441, lng: 85.3096 },
  { name: "Bhubaneswar", state: "Odisha", lat: 20.2961, lng: 85.8245 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Raipur", state: "Chhattisgarh", lat: 21.2514, lng: 81.6296 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Thiruvananthapuram", state: "Kerala", lat: 8.5241, lng: 76.9366 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558 },
  { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Vijayawada", state: "Andhra Pradesh", lat: 16.5062, lng: 80.6480 },
  { name: "Mysore", state: "Karnataka", lat: 12.2958, lng: 76.6394 },
  { name: "Goa", state: "Goa", lat: 15.2993, lng: 74.1240 },
  { name: "Panaji", state: "Goa", lat: 15.4909, lng: 73.8278 },

  // A few common international cities
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "New York", lat: 40.7128, lng: -74.0060 },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
];

// Sort longest-first so "New Delhi" matches before "Delhi", "Sawai Madhopur" before any sub-word, etc.
const SORTED = [...CITY_COORDS].sort((a, b) => b.name.length - a.name.length);

export function findCityIn(text: string): CityCoord | null {
  if (!text) return null;
  const hay = text.toLowerCase();
  for (const c of SORTED) {
    const needle = c.name.toLowerCase();
    // word-ish match: surrounded by non-letters
    const re = new RegExp(`(^|[^a-z])${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i");
    if (re.test(hay)) return c;
  }
  return null;
}
