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
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Badge,
    Switch,
    FormControlLabel,
    Drawer
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import BarChartIcon from '@mui/icons-material/BarChart';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
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
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Heatmap Layer Component
const HeatmapLayer = ({ data, enabled, filterDistance }) => {
    const map = useMap();

    useEffect(() => {
        if (!enabled || !data.length) return;

        // Filter data based on the distance
        const filteredData = data.filter(point => point[2] <= filterDistance);

        // Create heatmap layer
        const heat = L.heatLayer(filteredData, {
            radius: 35, // Adjust radius for a better visual effect
            blur: 25,   // Blur for smooth transitions
            maxZoom: 10,
            gradient: {
                0.4: 'blue',
                0.6: 'lime',
                0.7: 'yellow',
                0.8: 'orange',
                1.0: 'red'
            }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [map, data, enabled, filterDistance]);

    return null;
};


const MapController = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const LocationLanding = () => {
    const navigate = useNavigate();
    const [mapCenter, setMapCenter] = useState([35.9940, -78.8986]);
    const [mainMarker, setMainMarker] = useState(null);
    const [nearbyCities, setNearbyCities] = useState([]);
    const [mapZoom, setMapZoom] = useState(11);
    const [searchResults, setSearchResults] = useState([]);
    const [showStatsButton, setShowStatsButton] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [filterDistance, setFilterDistance] = useState(150);
    const [sortBy, setSortBy] = useState('distance');
    const [filteredCities, setFilteredCities] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    // Heatmap states
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [heatmapData, setHeatmapData] = useState([]);
    const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

    // Effect to apply filters
    useEffect(() => {
        if (nearbyCities.length > 0) {
            let filtered = nearbyCities.filter(city =>
                parseFloat(city.distance) <= filterDistance
            );

            filtered.sort((a, b) => {
                if (sortBy === 'distance') {
                    return parseFloat(a.distance) - parseFloat(b.distance);
                } else if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });

            setFilteredCities(filtered);
        }
    }, [nearbyCities, filterDistance, sortBy]);

    const handleDistanceChange = (e) => {
        const value = e.target.value;
        if (value === '' || (Number(value) >= 0 && Number(value) <= 200)) {
            setFilterDistance(value === '' ? 0 : Number(value));
        }
    };

    const resetFilters = () => {
        setFilterDistance(150);
        setSortBy('distance');
    };

    const fetchPopulationData = async (bounds) => {
        if (!bounds) return;

        setIsLoadingHeatmap(true);
        try {
            const query = `
                [out:json][timeout:25];
                (
                    node["place"="city"]
                        (${bounds.getSouth()},${bounds.getWest()},
                         ${bounds.getNorth()},${bounds.getEast()});
                    node["place"="town"]
                        (${bounds.getSouth()},${bounds.getWest()},
                         ${bounds.getNorth()},${bounds.getEast()});
                    node["place"="village"]
                        (${bounds.getSouth()},${bounds.getWest()},
                         ${bounds.getNorth()},${bounds.getEast()});
                );
                out body;
                >;
                out skel qt;
            `;

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: query
            });

            const data = await response.json();

            const points = data.elements.map(element => {
                let intensity = 0.3;
                if (element.tags.place === 'city') intensity = 1.0;
                else if (element.tags.place === 'town') intensity = 0.7;
                else if (element.tags.place === 'village') intensity = 0.4;

                return [
                    element.lat,
                    element.lon,
                    intensity
                ];
            });

            setHeatmapData(points);
        } catch (error) {
            console.error('Error fetching population data:', error);
        } finally {
            setIsLoadingHeatmap(false);
        }
    };

    const fetchNearbyCities = async (lat, lon) => {
        try {
            const viewboxSize = 1.0;
            const nearbyResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=city&countrycodes=us&bounded=1&viewbox=${
                    lon - viewboxSize},${lat + viewboxSize},${lon + viewboxSize},${lat - viewboxSize
                }&limit=30`
            );
            const nearbyData = await nearbyResponse.json();
    
            let filteredCities = nearbyData
                .filter(place => {
                    const distance = calculateDistance(
                        lat,
                        lon,
                        parseFloat(place.lat),
                        parseFloat(place.lon)
                    );
                    return (
                        distance <= filterDistance &&
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
                }))
                .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    
            return filteredCities.slice(0, 5); // Limit to 5 cities
        } catch (error) {
            console.error('Error fetching nearby cities:', error);
            return [];
        }
    };
    

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

            const nearbyFiltered = await fetchNearbyCities(mainCity.lat, mainCity.lon);
            setNearbyCities(nearbyFiltered);
        } catch (error) {
            console.error('Error handling search:', error);
        }
    };

    const handleSearchInput = async (value) => {
        if (!value || value.length < 3) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=us&limit=5`
            );
            const data = await response.json();

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

    const handleLocationSelect = (event, value) => {
        if (!value) return;
        setSelectedLocation(value);
        handleSearch(value);
    };

    const handleViewStats = async () => {
        if (mainMarker) {
            const cityData = {
                mainCity: mainMarker.name,
                nearbyCities: filteredCities.map(city => ({
                    name: city.name,
                    distance: city.distance
                }))
            };

            try {
                const response = await fetch('http://10.25.245.175:5001/nearby-cities', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cityData)
                });

                if (!response.ok) {
                    throw new Error('Failed to send data to backend');
                }

                const responseData = await response.json();
                localStorage.setItem('cityData', JSON.stringify(responseData));
                console.log('Successfully sent city data to backend:', JSON.parse(JSON.stringify(responseData)));

                navigate(`/city-stats?lat=${mainMarker.lat}&lon=${mainMarker.lon}&city=${encodeURIComponent(mainMarker.name)}`);
            } catch (error) {
                console.error('Error sending data to backend:', error);
            }
        }
    };

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
            </Container>

            {/* Menu Toggle Button */}
            {showStatsButton && (
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                        }
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Side Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: 350,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(5px)',
                        p: 2
                    }
                }}
            >
                {/* Drawer Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Options & Filters</Typography>
                    <IconButton onClick={() => setDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Filter Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Filter Nearby Cities
                        <Badge
                            badgeContent={filteredCities.length}
                            color="primary"
                            sx={{ ml: 2 }}
                        />
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            type="number"
                            label="Max Distance (miles)"
                            value={filterDistance}
                            onChange={handleDistanceChange}
                            size="small"
                            fullWidth
                            inputProps={{
                                min: 0,
                                max: 200,
                                step: "1"
                            }}
                        />
                        <FormControl size="small" fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="distance">Distance</MenuItem>
                                <MenuItem value="name">City Name</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSearch(selectedLocation)}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                }}
                            >
                                Search
                            </Button>
                            <IconButton
                                onClick={resetFilters}
                                size="small"
                                title="Reset filters"
                            >
                                <RestartAltIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {/* Heatmap Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Population Heatmap
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showHeatmap}
                                onChange={(e) => setShowHeatmap(e.target.checked)}
                                disabled={isLoadingHeatmap}
                            />
                        }
                        label={isLoadingHeatmap ? "Loading..." : "Show Population Density"}
                    />
                </Box>

                {/* Stats Button */}
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
            </Drawer>

            {/* Menu Toggle Button */}
            {showStatsButton && (
                <IconButton
                    onClick={() => setDrawerOpen(true)}
                    sx={{
                        position: 'absolute',
                        right: 20,
                        top: 20,
                        zIndex: 1000,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 1)',
                        }
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {/* Side Drawer */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                PaperProps={{
                    sx: {
                        width: 350,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(5px)',
                        p: 2
                    }
                }}
            >
                {/* Drawer Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Options & Filters</Typography>
                    <IconButton onClick={() => setDrawerOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Filter Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Filter Nearby Cities
                        <Badge
                            badgeContent={filteredCities.length}
                            color="primary"
                            sx={{ ml: 2 }}
                        />
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            type="number"
                            label="Max Distance (miles)"
                            value={filterDistance}
                            onChange={handleDistanceChange}
                            size="small"
                            fullWidth
                            inputProps={{
                                min: 0,
                                max: 200,
                                step: "1"
                            }}
                        />
                        <FormControl size="small" fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="distance">Distance</MenuItem>
                                <MenuItem value="name">City Name</MenuItem>
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleSearch(selectedLocation)}
                                fullWidth
                                sx={{
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                }}
                            >
                                Search
                            </Button>
                            <IconButton
                                onClick={resetFilters}
                                size="small"
                                title="Reset filters"
                            >
                                <RestartAltIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>

                {/* Heatmap Controls */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Population Heatmap
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showHeatmap}
                                onChange={(e) => setShowHeatmap(e.target.checked)}
                            />
                        }
                        label="Show Population Density"
                    />
                </Box>

                {/* Stats Button */}
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
            </Drawer>

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

                    {showHeatmap && (
                        <HeatmapLayer
                            data={filteredCities.map(city => [
                                parseFloat(city.lat),
                                parseFloat(city.lon),
                                city.distance // Use the distance to adjust intensity
                            ])}
                            enabled={showHeatmap}
                            filterDistance={filterDistance}
                        />
                    )}


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

                    {filteredCities.map((city, index) => (
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