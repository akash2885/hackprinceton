import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Grid,
  Card, 
  CardContent,
  CircularProgress,
  Button,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useState } from 'react';

const mockCityData = {
    "new_york": {
        name: "New York",
        average_salary: 85000,
        average_rent: 3500,
        cost_of_living: 4000,
        home_price: 750000
    },
    "san_francisco": {
        name: "San Francisco",
        average_salary: 95000,
        average_rent: 3800,
        cost_of_living: 4200,
        home_price: 1200000
    },
    "chicago": {
        name: "Chicago",
        average_salary: 65000,
        average_rent: 2000,
        cost_of_living: 2800,
        home_price: 350000
    },
    "austin": {
        name: "Austin",
        average_salary: 75000,
        average_rent: 1800,
        cost_of_living: 2600,
        home_price: 450000
    },
    "miami": {
        name: "Miami",
        average_salary: 70000,
        average_rent: 2200,
        cost_of_living: 3000,
        home_price: 500000
    }
};

const mockCityData2 = {
    "new_york": {
        name: "New York",
        average_salary: 850000,
        average_rent: 35000,
        cost_of_living: 40000,
        home_price: 7500000
    },
    "san_francisco": {
        name: "San Francisco",
        average_salary: 950000,
        average_rent: 38000,
        cost_of_living: 42000,
        home_price: 12000000
    },
    "chicago": {
        name: "Chicago",
        average_salary: 650000,
        average_rent: 20000,
        cost_of_living: 28000,
        home_price: 3500000
    },
    "austin": {
        name: "Austin",
        average_salary: 750000,
        average_rent: 18000,
        cost_of_living: 26000,
        home_price: 4500000
    },
    "miami": {
        name: "Miami",
        average_salary: 700000,
        average_rent: 22000,
        cost_of_living: 30000,
        home_price: 5000000
    }
};

const calculatePercentChange = (current, baseline) => {
    return ((current - baseline) / baseline * 100).toFixed(1);
};

const ComparisonCard = ({ city, baselineCity }) => {
    const getPercentageColor = (value, higherIsBetter) => {
        if (value > 0 && higherIsBetter) return '#4caf50'; // green
        if (value < 0 && higherIsBetter) return '#f44336'; // red
        if (value > 0 && !higherIsBetter) return '#f44336'; // red
        if (value < 0 && !higherIsBetter) return '#4caf50'; // green
        return '#757575'; // grey
    };

    const metrics = [
        {
            key: 'average_salary',
            label: 'Average Salary',
            format: value => `$${value.toLocaleString()}/yr`,
            info: 'Annual average salary before taxes'
        },
        {
            key: 'average_rent',
            label: 'Average Rent',
            format: value => `$${value.toLocaleString()}/mo`,
            info: 'Monthly rent for a 1-bedroom apartment'
        },
        {
            key: 'cost_of_living',
            label: 'Cost of Living',
            format: value => `$${value.toLocaleString()}/mo`,
            info: 'Monthly living expenses excluding rent'
        },
        {
            key: 'home_price',
            label: 'Median Home Price',
            format: value => `$${value.toLocaleString()}`,
            info: 'Median price for a home in the area'
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom color="primary" sx={{ mb: 3 }}>
                        {city.name}
                    </Typography>

                    {metrics.map((metric, index) => {
                        const percentChange = calculatePercentChange(
                            city[metric.key],
                            baselineCity[metric.key]
                        );
                        const color = getPercentageColor(percentChange, metric.higherIsBetter);

                        
                        return (
                            <Box key={metric.key} sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        {metric.label}
                                    </Typography>
                                    <Tooltip title={metric.info}>
                                        <IconButton size="small" sx={{ ml: 1 }}>
                                            <InfoIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">
                                        {metric.format(city[metric.key])}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            color: color,
                                            bgcolor: `${color}15`,
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1
                                        }}
                                    >
                                        {percentChange > 0 ? (
                                            <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        ) : (
                                            <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                                        )}
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {percentChange}%
                                        </Typography>
                                    </Box>
                                </Box>

                                {index < metrics.length - 1 && (
                                    <Divider sx={{ my: 2 }} />
                                )}
                            </Box>
                        );
                    })}
                </CardContent>
            </Card>
        </motion.div>
    );
};

const CityStatsDashboard = () => {
    
    const navigate = useNavigate();
    // const cityName = searchParams.get('city');

    const [baselineCity, setBaselineCity] = useState(mockCityData.new_york);
    const [otherCities, setOtherCities] = useState(Object.values(mockCityData).filter(city => city.name !== "New York"));

    
    // toggle
    const [useMockData2, setUseMockData2] = useState(false);
    
    const handleToggle = () => {
        
        setUseMockData2(!useMockData2);

        if (useMockData2) {
            setBaselineCity(useMockData2 ? mockCityData2.new_york : mockCityData.new_york);
            setOtherCities(Object.values(mockCityData2 ? mockCityData2 : mockCityData).filter(city => city.name !== "New York"));
        } else {
            setBaselineCity(mockCityData.new_york);
            setOtherCities(Object.values(mockCityData).filter(city => city.name !== "New York"));
        }

        // otherCities = Object.values(mockCityData2 ? mockCityData2 : mockCityData).filter(city => city.name !== "New York");

        
    };
    
    // toggle

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{ mb: 3 }}
                >
                    Back to Map
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
                    City Comparison vs New York
                </Typography>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Button
                    variant="contained"
                    onClick={handleToggle}
                    sx={{ mb: 3 }}
                >
                    Toggle Predicted Prices
                </Button>
            </motion.div>

            <Grid container spacing={3}>
                {/* Baseline City Card */}
                <Grid item xs={12} md={4}>
                    <ComparisonCard
                        city={baselineCity}
                    <ComparisonCard
                        city={baselineCity}
                        baselineCity={baselineCity}
                    />
                </Grid>

                {/* Other Cities */}
                {otherCities.map((city, index) => (
                    <Grid item xs={12} md={4} key={city.name}>
                        <ComparisonCard
                        <ComparisonCard
                            city={city}
                            baselineCity={baselineCity}
                        />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default CityStatsDashboard;