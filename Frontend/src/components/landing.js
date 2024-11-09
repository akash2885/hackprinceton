import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, Popup } from 'react-leaflet';
import {
    TextField,
    Paper,
    IconButton,
    Box,
    Container,
    Autocomplete,
    Button,
    Fade
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import BarChartIcon from '@mui/icons-material/BarChart';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Create custom icons for main location and nearby cities
const mainLocationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const nearbyCityIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const LocationLanding = () => {
    const navigate = useNavigate();
    const [mapCenter, setMapCenter] = useState([35.9940, -78.8986]); // Default to Durham
    const [mainMarker, setMainMarker] = useState(null);
    const [nearbyCities, setNearbyCities] = useState([]);
    const [mapZoom, setMapZoom] = useState(11);
    const [searchResults, setSearchResults] = useState([]);
    const [showStatsButton, setShowStatsButton] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // Function to fetch nearby cities with improved logic
    const fetchNearbyCities = async (lat, lon) => {
        try {
            // Use a larger viewbox and higher limit to get more initial results
            const viewboxSize = 1.0; // Increased significantly to catch more cities
            const nearbyResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=city&countrycodes=us&bounded=1&viewbox=${
                    lon - viewboxSize},${lat + viewboxSize},${lon + viewboxSize},${lat - viewboxSize
                }&limit=30` // Increased limit significantly
            );
            const nearbyData = await nearbyResponse.json();

            // Filter and process cities
            let filteredCities = nearbyData
                .filter(place => {
                    const distance = calculateDistance(
                        lat,
                        lon,
                        parseFloat(place.lat),
                        parseFloat(place.lon)
                    );
                    return (
                        distance <= 150 && // Increased range to find more cities
                        distance > 0.5 && // Keep minimum distance to avoid duplicates
                        (place.type === 'city' || place.type === 'town' || place.class === 'place')
                    );
                })
                .map(place => ({
                    lat: parseFloat(place.lat),
                    lon: parseFloat(place.lon),
                    name: place.display_name.split(',')[0],
                    fullName: place.display_name,
                    distance: calculateDistance(
                        lat,
                        lon,
                        parseFloat(place.lat),
                        parseFloat(place.lon)
                    ).toFixed(1)
                }))
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

            // If we don't have enough cities, try expanding the search
            if (filteredCities.length < 5) {
                const expandedResponse = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=city&countrycodes=us&bounded=1&viewbox=${
                        lon - viewboxSize * 2},${lat + viewboxSize * 2},${lon + viewboxSize * 2},${lat - viewboxSize * 2
                    }&limit=40`
                );
                const expandedData = await expandedResponse.json();

                const expandedCities = expandedData
                    .filter(place => {
                        const distance = calculateDistance(
                            lat,
                            lon,
                            parseFloat(place.lat),
                            parseFloat(place.lon)
                        );
                        return (
                            distance <= 200 && // Even larger range for expanded search
                            distance > 0.5 &&
                            (place.type === 'city' || place.type === 'town' || place.class === 'place')
                        );
                    })
                    .map(place => ({
                        lat: parseFloat(place.lat),
                        lon: parseFloat(place.lon),
                        name: place.display_name.split(',')[0],
                        fullName: place.display_name,
                        distance: calculateDistance(
                            lat,
                            lon,
                            parseFloat(place.lat),
                            parseFloat(place.lon)
                        ).toFixed(1)
                    }));

                // Combine and sort all cities
                filteredCities = [...filteredCities, ...expandedCities]
                    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
                    // Remove duplicates based on name and distance
                    .filter((city, index, self) =>
                            index === self.findIndex((c) =>
                                c.name === city.name && c.distance === city.distance
                            )
                    );
            }

            // Return between 5 and 10 cities, prioritizing closer ones
            return filteredCities.slice(0, Math.max(Math.min(10, filteredCities.length), 5));
        } catch (error) {
            console.error('Error fetching nearby cities:', error);
            return [];
        }
    };

    // Function to handle location search
    const handleSearch = async (location) => {
        if (!location) return;

        try {
            const mainCity = {
                lat: parseFloat(location.lat),
                lon: parseFloat(location.lon),
                name: location.name,
                fullName: location.fullName
            };

            setMainMarker(mainCity);
            setMapCenter([mainCity.lat, mainCity.lon]);
            setShowStatsButton(true);
            setMapZoom(11);

            // Fetch and set nearby cities
            const nearbyFiltered = await fetchNearbyCities(mainCity.lat, mainCity.lon);
            setNearbyCities(nearbyFiltered);

            // Prepare data for backend
            const cityData = {
                mainCity: mainCity.name,
                nearbyCities: nearbyFiltered.map(city => ({
                    name: city.name,
                    distance: city.distance
                }))
            };

            // Send to backend (URL to be provided)
            try {
                const response = await fetch('YOUR_BACKEND_URL_HERE', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cityData)
                });

                if (!response.ok) {
                    throw new Error('Failed to send data to backend');
                }

                // Optional: Handle successful response
                const responseData = await response.json();
                console.log('Successfully sent city data to backend:', responseData);

            } catch (error) {
                console.error('Error sending data to backend:', error);
            }

        } catch (error) {
            console.error('Error handling search:', error);
        }
    };

    // Function to handle search input and fetch suggestions
    const handleSearchInput = async (value) => {
        if (!value || value.length < 3) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=us&limit=5`
            );
            const data = await response.json();

            // Enhanced search results with complete location data
            const formattedResults = data.map(item => ({
                label: item.display_name,
                value: item.display_name,
                lat: item.lat,
                lon: item.lon,
                name: item.display_name.split(',')[0],
                fullName: item.display_name,
                type: item.type,
                class: item.class
            }));

            setSearchResults(formattedResults);
        } catch (error) {
            console.error('Error fetching search suggestions:', error);
        }
    };

    // Function to handle location selection
    const handleLocationSelect = (event, value) => {
        if (!value) return;

        setSelectedLocation(value);
        handleSearch(value);
    };

    // Function to handle stats button click
    const handleViewStats = () => {
        if (mainMarker) {
            navigate(`/city-stats?lat=${mainMarker.lat}&lon=${mainMarker.lon}&city=${encodeURIComponent(mainMarker.name)}`);
        }
    };

    // Function to handle getting current location
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    const locationData = {
                        lat: latitude,
                        lon: longitude,
                        name: data.address.city || data.address.town || "Current Location",
                        fullName: data.display_name
                    };

                    setSelectedLocation(locationData);
                    handleSearch(locationData);
                } catch (error) {
                    console.error('Error getting location details:', error);
                }
            },
            (error) => {
                console.error('Error getting current location:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    return (
        <Box sx={{
            height: '100vh',
            width: '100vw',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Search Bar Overlay */}
            <Container maxWidth="sm" sx={{
                position: 'absolute',
                top: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000
            }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Autocomplete
                            fullWidth
                            value={selectedLocation}
                            options={searchResults}
                            getOptionLabel={(option) =>
                                typeof option === 'string' ? option : option.label
                            }
                            onInputChange={(event, value) => handleSearchInput(value)}
                            onChange={handleLocationSelect}
                            isOptionEqualToValue={(option, value) =>
                                option.lat === value.lat && option.lon === value.lon
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    size="small"
                                    placeholder="Enter a city name"
                                    variant="outlined"
                                />
                            )}
                        />
                        <IconButton
                            onClick={getCurrentLocation}
                            size="small"
                            sx={{ ml: 1 }}
                            title="Use current location"
                        >
                            <MyLocationIcon />
                        </IconButton>
                    </Box>
                </Paper>

                {/* Stats Button */}
                <Fade in={showStatsButton}>
                    <Paper
                        elevation={3}
                        sx={{
                            mt: 2,
                            p: 2,
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(5px)',
                            display: showStatsButton ? 'block' : 'none'
                        }}
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<BarChartIcon />}
                            onClick={handleViewStats}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                transition: 'transform 0.2s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                }
                            }}
                        >
                            View City Statistics
                        </Button>
                    </Paper>
                </Fade>
            </Container>

            {/* Map Container */}
            <Box sx={{ height: '100%', width: '100%' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController center={mapCenter} zoom={mapZoom} />

                    {mainMarker && (
                        <Marker
                            position={[mainMarker.lat, mainMarker.lon]}
                            icon={mainLocationIcon}
                        >
                            <Popup>
                                <strong>{mainMarker.name}</strong>
                                <br />
                                {mainMarker.fullName}
                            </Popup>
                        </Marker>
                    )}

                    {nearbyCities.map((city, index) => (
                        <Marker
                            key={index}
                            position={[city.lat, city.lon]}
                            icon={nearbyCityIcon}
                        >
                            <Popup>
                                <strong>{city.name}</strong>
                                <br />
                                {city.distance} miles away
                                <br />
                                {city.fullName}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>
        </Box>
    );
};

export default LocationLanding;