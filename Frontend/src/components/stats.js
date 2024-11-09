import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Box,
    Container,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar
} from 'recharts';

// Mock data function - Replace with your actual API call
const fetchCityData = async (lat, lon) => {
    // This is where you'd make your backend API call using lat/lon
    // For now, returning mock data
    const mockData = {
        mainCity: {
            name: "New York",
            averageSalary: 85000,
            averageRent: 3500,
            costOfLiving: 100,
            transportationCost: 127,
            qualityOfLife: 75,
            crimeRate: 45,
            employmentRate: 95,
        },
        nearbyCities: [
            {
                name: "Jersey City",
                averageSalary: 75000,
                averageRent: 2800,
                costOfLiving: 85,
                transportationCost: 110,
                qualityOfLife: 72,
                crimeRate: 42,
                employmentRate: 94,
            },
            {
                name: "Newark",
                averageSalary: 65000,
                averageRent: 2200,
                costOfLiving: 75,
                transportationCost: 95,
                qualityOfLife: 65,
                crimeRate: 55,
                employmentRate: 91,
            },
            // Add more nearby cities as needed
        ]
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockData;
};

const StatCard = ({ title, value, unit = '', color = '#2196f3' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="div" sx={{ color }}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {unit && <span style={{ fontSize: '1rem', marginLeft: '4px' }}>{unit}</span>}
                </Typography>
            </CardContent>
        </Card>
    </motion.div>
);

const CityStatsDashboard = ({ selectedCity, lat, lon }) => {
    const [cityData, setCityData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchCityData(lat, lon);
            setCityData(data);
            setLoading(false);
        };
        loadData();
    }, [lat, lon]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const comparativeData = cityData.nearbyCities.map(city => ({
        name: city.name,
        'Average Salary': city.averageSalary,
        'Average Rent': city.averageRent,
        'Transportation Cost': city.transportationCost,
    }));

    const qualityMetrics = [
        { subject: 'Cost of Living', A: cityData.mainCity.costOfLiving },
        { subject: 'Quality of Life', A: cityData.mainCity.qualityOfLife },
        { subject: 'Employment Rate', A: cityData.mainCity.employmentRate },
        { subject: 'Safety', A: 100 - cityData.mainCity.crimeRate },
        { subject: 'Transportation', A: cityData.mainCity.transportationCost },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h3" gutterBottom>
                    {cityData.mainCity.name} Area Statistics
                </Typography>
            </motion.div>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Average Salary"
                        value={cityData.mainCity.averageSalary}
                        unit="/yr"
                        color="#4caf50"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Average Rent"
                        value={cityData.mainCity.averageRent}
                        unit="/mo"
                        color="#f44336"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Cost of Living Index"
                        value={cityData.mainCity.costOfLiving}
                        color="#2196f3"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Quality of Life"
                        value={cityData.mainCity.qualityOfLife}
                        unit="%"
                        color="#ff9800"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Regional Comparison
                            </Typography>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={comparativeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Average Salary" fill="#4caf50" />
                                    <Bar dataKey="Average Rent" fill="#f44336" />
                                    <Bar dataKey="Transportation Cost" fill="#2196f3" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </motion.div>
                </Grid>
                <Grid item xs={12} md={4}>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Quality Metrics
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={qualityMetrics}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <Radar
                                        name={cityData.mainCity.name}
                                        dataKey="A"
                                        fill="#8884d8"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </motion.div>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CityStatsDashboard;