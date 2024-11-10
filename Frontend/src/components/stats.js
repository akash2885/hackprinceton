// Import necessary modules and components
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Button,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// **Full definitions of mockCityData and mockCityData2**
const mockCityData = {
  new_york: {
    name: 'New York',
    average_salary: 85000,
    average_rent: 3500,
    cost_of_living: 4000,
    home_price: 750000,
  },
  san_francisco: {
    name: 'San Francisco',
    average_salary: 95000,
    average_rent: 3800,
    cost_of_living: 4200,
    home_price: 1200000,
  },
  chicago: {
    name: 'Chicago',
    average_salary: 65000,
    average_rent: 2000,
    cost_of_living: 2800,
    home_price: 350000,
  },
  austin: {
    name: 'Austin',
    average_salary: 75000,
    average_rent: 1800,
    cost_of_living: 2600,
    home_price: 450000,
  },
  miami: {
    name: 'Miami',
    average_salary: 70000,
    average_rent: 2200,
    cost_of_living: 3000,
    home_price: 500000,
  },
};

const mockCityData2 = {
  new_york: {
    name: 'New York',
    average_salary: 850000,
    average_rent: 35000,
    cost_of_living: 40000,
    home_price: 7500000,
  },
  san_francisco: {
    name: 'San Francisco',
    average_salary: 950000,
    average_rent: 38000,
    cost_of_living: 42000,
    home_price: 12000000,
  },
  chicago: {
    name: 'Chicago',
    average_salary: 650000,
    average_rent: 20000,
    cost_of_living: 28000,
    home_price: 3500000,
  },
  austin: {
    name: 'Austin',
    average_salary: 750000,
    average_rent: 18000,
    cost_of_living: 26000,
    home_price: 4500000,
  },
  miami: {
    name: 'Miami',
    average_salary: 700000,
    average_rent: 22000,
    cost_of_living: 30000,
    home_price: 5000000,
  },
};

// Calculate percentage change function
const calculatePercentChange = (current, baseline) => {
  return (((current - baseline) / baseline) * 100).toFixed(1);
};

// ComparisonCard Component
const ComparisonCard = ({ city, baselineCity }) => {
  if (!city || !baselineCity) {
    // Handle the case where city or baselineCity is undefined
    return null;
  }

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
      info: 'Annual average salary before taxes',
      higherIsBetter: true,
    },
    {
      key: 'average_rent',
      label: 'Average Rent',
      format: value => `$${value.toLocaleString()}/mo`,
      info: 'Monthly rent for a 1-bedroom apartment',
      higherIsBetter: false,
    },
    {
      key: 'cost_of_living',
      label: 'Cost of Living',
      format: value => `$${value.toLocaleString()}/mo`,
      info: 'Monthly living expenses excluding rent',
      higherIsBetter: false,
    },
    {
      key: 'home_price',
      label: 'Median Home Price',
      format: value => `$${value.toLocaleString()}`,
      info: 'Median price for a home in the area',
      higherIsBetter: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LocationCityIcon />
            </Avatar>
          }
          title={
            <Typography variant="h6" color="textPrimary">
              {city.name}
            </Typography>
          }
        />
        <CardContent>
          {metrics.map((metric, index) => {
            const percentChange = calculatePercentChange(
              city[metric.key],
              baselineCity[metric.key]
            );
            const color = getPercentageColor(
              percentChange,
              metric.higherIsBetter
            );

            return (
              <Box key={metric.key} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {metric.label}
                  </Typography>
                  <Tooltip title={metric.info}>
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="h6" color="textPrimary">
                    {metric.format(city[metric.key])}
                  </Typography>
                  {city.name !== baselineCity.name && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: color,
                        bgcolor: `${color}15`,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                      }}
                    >
                      {percentChange > 0 ? (
                        <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
                      ) : (
                        <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {Math.abs(percentChange)}%
                      </Typography>
                    </Box>
                  )}
                </Box>

                {index < metrics.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Dashboard Component
const CityStatsDashboard = () => {
  const navigate = useNavigate();
  const [useMockData2, setUseMockData2] = useState(false);
  const [baselineCity, setBaselineCity] = useState(mockCityData.new_york);
  const [otherCities, setOtherCities] = useState(
    Object.values(mockCityData).filter(city => city.name !== 'New York')
  );

  const handleToggle = () => {
    setUseMockData2(prevState => {
      const newState = !prevState;
      if (newState) {
        setBaselineCity(mockCityData2.new_york);
        setOtherCities(
          Object.values(mockCityData2).filter(
            city => city.name !== 'New York'
          )
        );
      } else {
        setBaselineCity(mockCityData.new_york);
        setOtherCities(
          Object.values(mockCityData).filter(
            city => city.name !== 'New York'
          )
        );
      }
      return newState;
    });
  };

  // Custom theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // Blue color
      },
      secondary: {
        main: '#f50057', // Pink color
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 500,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
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
            <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
              City Comparison vs New York
            </Typography>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={useMockData2}
                  onChange={handleToggle}
                  color="primary"
                />
              }
              label={
                useMockData2
                  ? 'Showing Predicted Prices'
                  : 'Showing Current Prices'
              }
              sx={{ mb: 4 }}
            />
          </motion.div>

          <Grid container spacing={3}>
            {/* Baseline City Card */}
            <Grid item xs={12} md={4}>
              <ComparisonCard
                city={baselineCity}
                baselineCity={baselineCity}
              />
            </Grid>

            {/* Other Cities */}
            {otherCities.map(city => (
              <Grid item xs={12} md={4} key={city.name}>
                <ComparisonCard
                  city={city}
                  baselineCity={baselineCity}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default CityStatsDashboard;
