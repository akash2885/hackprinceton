import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Card, CardContent, CardHeader, 
  Typography, Grid, LinearProgress, 
  Chip, Box, ThemeProvider, createTheme, CircularProgress, Alert,
  Tooltip, IconButton
} from '@mui/material';
import { 
  Home as HomeIcon, 
  Apartment as ApartmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
  House as HouseIcon
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    secondary: { main: '#ef4444' },
    success: { main: '#22c55e' },
  },
});

const MetricRow = ({ label, value=0, baseValue, format = 'number', tooltip, icon }) => {
  const diff = baseValue ? ((value - baseValue) / baseValue) * 100 : 0;
  const formattedValue = format === 'currency' 
    ? `$${value.toLocaleString()}`
    : value.toLocaleString();
  
  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          {icon}
          <Typography variant="body2" fontWeight="medium">
            {label}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip}>
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight="bold">
            {formattedValue}
          </Typography>
          {baseValue && (
            <Chip
              size="small"
              icon={diff > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={`${diff > 0 ? '+' : ''}${Math.round(diff)}%`}
            //   color={diff > 0 ? (label === 'Cost of Living' ? 'success' : 'secondary') : (label === 'Cost of Living' ? 'success' : 'secondary')}
            color={
                diff > 0
                    ? (label === 'Cost of Living' ? 'secondary' : 'success')
                    : (label === 'Cost of Living' ? 'success' : 'secondary')
                }
              sx={{ minWidth: 80 }}
            />
          )}
        </Box>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={Math.min((value / (baseValue ? baseValue * 2 : value * 2)) * 100, 100)}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          bgcolor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
          }
        }} 
      />
    </Box>
  );
};

function CityCard({ city, currentCity, isCurrent }) {
  const getComparisonText = (cityToCompare) => {
    if (!currentCity) return '';
    const costDiff = cityToCompare.cost_of_living - currentCity.cost_of_living;
    const salaryDiff = cityToCompare.average_salary - currentCity.average_salary;
    const costPhrase = costDiff < 0 ? "lower" : "higher";
    const salaryPhrase = salaryDiff < 0 ? "lower" : "higher";
    return `${cityToCompare.name} has a ${Math.abs(costDiff)}% ${costPhrase} cost of living and a ${Math.abs(
      Math.round((salaryDiff / currentCity.average_salary) * 100)
    )}% ${salaryPhrase} average salary compared to ${currentCity.name}.`;
  }

  return (
    <Card 
      elevation={isCurrent ? 3 : 1}
      sx={{ 
        height: '100%',
        borderRadius: 2,
        border: isCurrent ? 2 : 1,
        borderColor: isCurrent ? 'primary.main' : 'grey.200',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
        }
      }}
    >
      <CardHeader
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {isCurrent ? <HomeIcon color="primary" /> : <ApartmentIcon />}
            <Typography variant="h6" component="div">
              {city.name}
            </Typography>
            {isCurrent && (
              <Chip label="Current City" size="small" color="primary" variant="outlined" />
            )}
          </Box>
        }
      />
      <CardContent>
        <MetricRow
          label="Cost of Living"
          value={city.cost_of_living}
          baseValue={isCurrent ? null : currentCity.cost_of_living}
          format='currency'
          icon={<MoneyIcon fontSize="small" />}
          tooltip="Cost of living index based on consumer prices including rent"
        />
        <MetricRow
          label="Average Salary"
          value={city.average_salary}
          baseValue={isCurrent ? null : currentCity.average_salary}
          format="currency"
          icon={<MoneyIcon fontSize="small" />}
          tooltip="Average annual salary for all occupations"
        />
        <MetricRow
          label="Average Rent"
          value={city.average_rent}
          baseValue={isCurrent ? null : currentCity.average_rent}
          format="currency"
          icon={<HomeIcon fontSize="small" />}
          tooltip="Average monthly rent for a 1-bedroom apartment"
        />
        <MetricRow
          label="Home Price"
          value={city.home_price}
          baseValue={isCurrent ? null : currentCity.home_price}
          format="currency"
          icon={<HouseIcon fontSize="small" />}
          tooltip="Median home price"
        />
      </CardContent>
    </Card>
  );
}

export default function CityStatsDashboard() {
  const location = useLocation();
  const [currentCity, setCurrentCity] = useState(null);
  const [nearbyCities, setNearbyCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cityData, mainMarker } = location.state || {};

  useEffect(() => {
    if (!cityData || !mainMarker) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://10.25.245.175:5001/nearby-cities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cityData)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch city data');
        }

        const data = await response.json();
        console.log(data)
        setCurrentCity(data.currentCity);
        const otherCitiesArray = Object.entries(data.otherCities).map(([name, cityData]) => ({
          name,
          ...cityData
        }));
        setNearbyCities(otherCitiesArray);
      } catch (err) {
        setError('An error occurred while fetching data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cityData, mainMarker]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', p: 4 }}>
        <Typography variant="h3" fontWeight="bold" textAlign="center" mb={2}>
          City Comparison
        </Typography>
        <Typography variant="h5" textAlign="center" color="text.secondary" mb={6}>
          Comparing {currentCity.name} with nearby cities
        </Typography>
        <Grid container spacing={3}>
          {currentCity && (
            <Grid item xs={12} md={6} lg={4}>
              <CityCard city={currentCity} currentCity={currentCity} isCurrent={true} />
            </Grid>
          )}
          {nearbyCities.map((city) => (
            <Grid item xs={12} md={6} lg={4} key={city.name}>
              <CityCard city={city} currentCity={currentCity} isCurrent={false} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </ThemeProvider>
  );
}