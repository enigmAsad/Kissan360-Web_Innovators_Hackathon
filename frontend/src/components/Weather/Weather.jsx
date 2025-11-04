import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WiDaySunny, WiDayRainMix, WiCloudy, WiHumidity, WiRaindrops } from 'react-icons/wi';
import newRequest from '../../utils/newRequest.js';
import './Weather.scss';

const categoryIcon = {
    heat: <WiDaySunny size={32} color="#f59e0b" />,
    rain: <WiDayRainMix size={32} color="#2563eb" />,
    normal: <WiCloudy size={32} color="#22c55e" />,
};

const categoryLabel = {
    heat: 'Heat Advisory',
    rain: 'Rain Alert',
    normal: 'Favourable',
};

const colorByCategory = {
    heat: '#facc15',
    rain: '#2563eb',
    normal: '#22c55e',
};

const Weather = () => {
    const [cities, setCities] = useState([]);
    const [mapboxToken, setMapboxToken] = useState('');
    const [generatedAt, setGeneratedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        const fetchWeather = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await newRequest.get('/api/weather');
                setCities(response.data?.cities || []);
                setMapboxToken(response.data?.mapboxToken || '');
                setGeneratedAt(response.data?.generatedAt || '');
            } catch (err) {
                console.error('Failed to load weather data', err);
                setError('Failed to load weather data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const regionFeatures = useMemo(() => {
        return cities.map((city) => {
            const { longitude, latitude } = city.coordinates || {};
            if (!longitude || !latitude) return null;

            const offset = 0.75;

            return {
                type: 'Feature',
                properties: {
                    city: city.city,
                    category: city.category,
                    condition: city.condition,
                    temperature: city.temperature,
                    humidity: city.humidity,
                    precipitationChance: city.precipitationChance,
                },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[
                        [longitude - offset, latitude - offset],
                        [longitude + offset, latitude - offset],
                        [longitude + offset, latitude + offset],
                        [longitude - offset, latitude + offset],
                        [longitude - offset, latitude - offset],
                    ]],
                },
            };
        }).filter(Boolean);
    }, [cities]);

    const pointFeatures = useMemo(() => {
        return cities.map((city) => {
            const { longitude, latitude } = city.coordinates || {};
            if (!longitude || !latitude) return null;

            return {
                type: 'Feature',
                properties: {
                    city: city.city,
                    category: city.category,
                    condition: city.condition,
                    temperature: city.temperature,
                    humidity: city.humidity,
                    precipitationChance: city.precipitationChance,
                },
                geometry: {
                    type: 'Point',
                    coordinates: [longitude, latitude],
                },
            };
        }).filter(Boolean);
    }, [cities]);

    useEffect(() => {
        if (!mapContainerRef.current || !mapboxToken || cities.length === 0) {
            return;
        }

        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
        }

        mapboxgl.accessToken = mapboxToken;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [69.3451, 30.3753],
            zoom: 4.2,
        });

        mapInstanceRef.current = map;

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', () => {
            if (regionFeatures.length > 0) {
                map.addSource('weather-regions', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: regionFeatures,
                    },
                });

                map.addLayer({
                    id: 'weather-region-fill',
                    type: 'fill',
                    source: 'weather-regions',
                    paint: {
                        'fill-color': [
                            'match',
                            ['get', 'category'],
                            'rain', colorByCategory.rain,
                            'heat', colorByCategory.heat,
                            colorByCategory.normal,
                        ],
                        'fill-opacity': 0.32,
                    },
                });

                map.addLayer({
                    id: 'weather-region-outline',
                    type: 'line',
                    source: 'weather-regions',
                    paint: {
                        'line-color': [
                            'match',
                            ['get', 'category'],
                            'rain', colorByCategory.rain,
                            'heat', colorByCategory.heat,
                            colorByCategory.normal,
                        ],
                        'line-width': 1.2,
                        'line-opacity': 0.7,
                    },
                });
            }

            if (pointFeatures.length > 0) {
                map.addSource('weather-points', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: pointFeatures,
                    },
                });

                map.addLayer({
                    id: 'weather-points-layer',
                    type: 'circle',
                    source: 'weather-points',
                    paint: {
                        'circle-radius': 6,
                        'circle-color': [
                            'match',
                            ['get', 'category'],
                            'rain', colorByCategory.rain,
                            'heat', colorByCategory.heat,
                            colorByCategory.normal,
                        ],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff',
                    },
                });

                map.on('mouseenter', 'weather-points-layer', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                map.on('mouseleave', 'weather-points-layer', () => {
                    map.getCanvas().style.cursor = '';
                });

                map.on('click', 'weather-points-layer', (event) => {
                    const { properties, geometry } = event.features[0];
                    const coordinates = geometry.coordinates.slice();

                    const html = `
                        <div class="popup">
                            <strong>${properties.city}</strong><br/>
                            ${properties.condition}<br/>
                            Temp: ${properties.temperature}°C<br/>
                            Humidity: ${properties.humidity}%<br/>
                            Rain chance: ${properties.precipitationChance}%
                        </div>
                    `;

                    new mapboxgl.Popup({ closeButton: false })
                        .setLngLat(coordinates)
                        .setHTML(html)
                        .addTo(map);
                });
            }
        });

        return () => {
            map.remove();
        };
    }, [cities, mapboxToken, regionFeatures, pointFeatures]);

    return (
        <div className="weather-home">
            <div className="weather-dashboard">
                <div className="weather-header">
                    <div>
                        <h2>Pakistan Weather Outlook</h2>
                        <p className="subtitle">
                            Regional insights help plan irrigation, harvesting, and field work with confidence.
                        </p>
                    </div>
                    {generatedAt && (
                        <span className="timestamp">Last updated: {new Date(generatedAt).toLocaleString()}</span>
                    )}
                </div>

                {error && <div className="error-state">{error}</div>}
                {loading && !error && <div className="loading-state">Loading live regional snapshot…</div>}

                {!loading && !error && (
                    <>
                        <div className="legend">
                            <div className="legend-item">
                                <span className="color-block rain" />
                                <span>Rainy / wet fields</span>
                            </div>
                            <div className="legend-item">
                                <span className="color-block heat" />
                                <span>Heat stress risk</span>
                            </div>
                            <div className="legend-item">
                                <span className="color-block normal" />
                                <span>Favourable conditions</span>
                            </div>
                        </div>

                        <div className="content-layout">
                            <div className="map-wrapper">
                                <div className="map-container" ref={mapContainerRef} />
                                <p className="map-hint">Tap coloured zones or markers for field-ready tips.</p>
                            </div>

                            <div className="city-grid">
                                {cities.map((city) => (
                                    <div className={`city-card ${city.category}`} key={city.city}>
                                        <div className="city-card__header">
                                            <div>
                                                <h3>{city.city}</h3>
                                                <span className="label">{categoryLabel[city.category]}</span>
                                            </div>
                                            {categoryIcon[city.category]}
                                        </div>

                                        <div className="city-card__metrics">
                                            <div className="metric">
                                                <span>Temperature</span>
                                                <strong>{city.temperature}°C</strong>
                                            </div>
                                            <div className="metric">
                                                <span>Humidity</span>
                                                <strong>{city.humidity}%</strong>
                                            </div>
                                            <div className="metric">
                                                <span>Rain Chance</span>
                                                <strong>{city.precipitationChance}%</strong>
                                            </div>
                                        </div>

                                        <div className="city-card__condition">
                                            <WiRaindrops size={20} />
                                            <span>{city.condition}</span>
                                        </div>

                                        <div className="city-card__footer">
                                            <WiHumidity size={18} />
                                            <span>Stay alert for microclimate shifts when humidity tops 60%.</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Weather;
