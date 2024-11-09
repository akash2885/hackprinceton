import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { TextField, Paper, IconButton, Box, Container } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issues
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Component to handle map center updates
const MapController = ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
};

const LocationLanding = () => {
    const [location, setLocation] = useState('');
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default to London
    const [marker, setMarker] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
            );
            const data = await response.json();

            if (data && data[0]) {
                const { lat, lon } = data[0];
                setMapCenter([lat, lon]);
                setMarker([lat, lon]);
            }
        } catch (error) {
            console.error('Error geocoding address:', error);
        }
    };

    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setMarker([lat, lng]);
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setMapCenter([latitude, longitude]);
                    setMarker([latitude, longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    };

    return (
        <Box sx={{ height: '100vh', width: '100vw', position: 'relative' }}>
            {/* Search Bar Overlay */}
            <Container maxWidth="sm" sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Enter your location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            size="small"
                            InputProps={{
                                endAdornment: (
                                    <IconButton type="submit" size="small">
                                        <SearchIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                        <IconButton
                            onClick={getCurrentLocation}
                            size="small"
                            sx={{ ml: 1 }}
                            title="Use current location"
                        >
                            <MyLocationIcon />
                        </IconButton>
                    </form>
                </Paper>
            </Container>

            {/* Map Container */}
            <Box sx={{ height: '100%', width: '100%' }}>
                <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    onClick={handleMapClick}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController center={mapCenter} />
                    {marker && <Marker position={marker} />}
                </MapContainer>
            </Box>
        </Box>
    );
};

export default LocationLanding;