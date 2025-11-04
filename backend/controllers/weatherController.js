import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MAPBOX_GEOCODING_ENDPOINT = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

const cityBaselines = [
    {
        name: 'Karachi',
        condition: 'Humid heatwave',
        temperature: 34,
        humidity: 68,
        precipitationChance: 12,
        category: 'heat',
        defaultCoordinates: { latitude: 24.8607, longitude: 67.0011 },
    },
    {
        name: 'Lahore',
        condition: 'Warm with haze',
        temperature: 31,
        humidity: 55,
        precipitationChance: 18,
        category: 'heat',
        defaultCoordinates: { latitude: 31.5204, longitude: 74.3587 },
    },
    {
        name: 'Islamabad',
        condition: 'Light monsoon showers',
        temperature: 26,
        humidity: 72,
        precipitationChance: 68,
        category: 'rain',
        defaultCoordinates: { latitude: 33.6844, longitude: 73.0479 },
    },
    {
        name: 'Peshawar',
        condition: 'Cloudy intervals',
        temperature: 28,
        humidity: 58,
        precipitationChance: 22,
        category: 'normal',
        defaultCoordinates: { latitude: 34.0151, longitude: 71.5805 },
    },
    {
        name: 'Quetta',
        condition: 'Dry and breezy',
        temperature: 24,
        humidity: 38,
        precipitationChance: 6,
        category: 'normal',
        defaultCoordinates: { latitude: 30.1798, longitude: 66.9750 },
    },
    {
        name: 'Multan',
        condition: 'Scorching sunshine',
        temperature: 37,
        humidity: 42,
        precipitationChance: 9,
        category: 'heat',
        defaultCoordinates: { latitude: 30.1575, longitude: 71.5249 },
    },
];

const coordinateCache = new Map();

const getCoordinates = async (cityName, fallbackCoordinates, mapboxToken) => {
    if (coordinateCache.has(cityName)) {
        return coordinateCache.get(cityName);
    }

    if (!mapboxToken) {
        coordinateCache.set(cityName, fallbackCoordinates);
        return fallbackCoordinates;
    }

    try {
        const response = await axios.get(
            `${MAPBOX_GEOCODING_ENDPOINT}/${encodeURIComponent(`${cityName}, Pakistan`)}.json`,
            {
                params: {
                    access_token: mapboxToken,
                    limit: 1,
                    types: 'place',
                },
            }
        );

        const feature = response.data?.features?.[0];

        if (feature?.center?.length === 2) {
            const [longitude, latitude] = feature.center;
            const coords = { latitude, longitude };
            coordinateCache.set(cityName, coords);
            return coords;
        }
    } catch (error) {
        console.error(`Mapbox geocoding failed for ${cityName}:`, error.response?.data || error.message);
    }

    coordinateCache.set(cityName, fallbackCoordinates);
    return fallbackCoordinates;
};

export const getPakistanWeather = async (req, res) => {
    const mapboxToken = process.env.MAPBOX_TOKEN;

    try {
        const enrichedCities = await Promise.all(
            cityBaselines.map(async (city) => {
                const coordinates = await getCoordinates(city.name, city.defaultCoordinates, mapboxToken);

                return {
                    city: city.name,
                    condition: city.condition,
                    temperature: city.temperature,
                    humidity: city.humidity,
                    precipitationChance: city.precipitationChance,
                    category: city.category,
                    coordinates,
                };
            })
        );

        res.status(200).json({
            generatedAt: new Date().toISOString(),
            mapboxToken,
            cities: enrichedCities,
        });
    } catch (error) {
        console.error('Unable to build weather response:', error);
        res.status(500).json({ error: 'Failed to load weather data' });
    }
};


