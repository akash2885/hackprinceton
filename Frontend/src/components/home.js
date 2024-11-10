import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Button, Typography, Card, CardContent } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsSubwayIcon from '@mui/icons-material/DirectionsSubway';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
const expandedCityData = {
    "new_york": {
        name: "New York",
        state: "NY",
        average_salary: 85000,
        average_rent: 3500,
        cost_of_living: 4000,
        home_price: 750000,
        transit_score: 89,
        restaurant_price: 4,
        sunny_days: 224,
        description: "The city that never sleeps"
    },
    "san_francisco": {
        name: "San Francisco",
        state: "CA",
        average_salary: 95000,
        average_rent: 3800,
        cost_of_living: 4200,
        home_price: 1200000,
        transit_score: 80,
        restaurant_price: 4,
        sunny_days: 259,
        description: "Tech hub by the bay"
    },
    "chicago": {
        name: "Chicago",
        state: "IL",
        average_salary: 65000,
        average_rent: 2000,
        cost_of_living: 2800,
        home_price: 350000,
        transit_score: 65,
        restaurant_price: 3,
        sunny_days: 189,
        description: "The Windy City"
    },
    "austin": {
        name: "Austin",
        state: "TX",
        average_salary: 75000,
        average_rent: 1800,
        cost_of_living: 2600,
        home_price: 450000,
        transit_score: 42,
        restaurant_price: 3,
        sunny_days: 228,
        description: "Keep Austin Weird"
    },
    "miami": {
        name: "Miami",
        state: "FL",
        average_salary: 70000,
        average_rent: 2200,
        cost_of_living: 3000,
        home_price: 500000,
        transit_score: 58,
        restaurant_price: 3,
        sunny_days: 248,
        description: "Magic City"
    },
    "seattle": {
        name: "Seattle",
        state: "WA",
        average_salary: 88000,
        average_rent: 2800,
        cost_of_living: 3600,
        home_price: 820000,
        transit_score: 73,
        restaurant_price: 3,
        sunny_days: 152,
        description: "Emerald City"
    },
    "boston": {
        name: "Boston",
        state: "MA",
        average_salary: 82000,
        average_rent: 3000,
        cost_of_living: 3800,
        home_price: 700000,
        transit_score: 72,
        restaurant_price: 4,
        sunny_days: 200,
        description: "The Hub"
    },
    "denver": {
        name: "Denver",
        state: "CO",
        average_salary: 72000,
        average_rent: 2100,
        cost_of_living: 2900,
        home_price: 580000,
        transit_score: 60,
        restaurant_price: 3,
        sunny_days: 300,
        description: "Mile High City"
    },
    "portland": {
        name: "Portland",
        state: "OR",
        average_salary: 70000,
        average_rent: 2000,
        cost_of_living: 2800,
        home_price: 520000,
        transit_score: 65,
        restaurant_price: 3,
        sunny_days: 144,
        description: "Rose City"
    },
    "nashville": {
        name: "Nashville",
        state: "TN",
        average_salary: 65000,
        average_rent: 1900,
        cost_of_living: 2500,
        home_price: 420000,
        transit_score: 45,
        restaurant_price: 3,
        sunny_days: 208,
        description: "Music City"
    }
};
const CityCard = ({ city }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            width: 300,
            height: 400,
            m: 1,
            background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)'
            }
          }}
        >
          <CardContent>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              {city.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2, color: '#666' }}>
              {city.state} - {city.description}
            </Typography>
  
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography>
                ${city.average_salary.toLocaleString()}/year
              </Typography>
            </Box>
  
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <HomeIcon sx={{ color: '#f44336', mr: 1 }} />
              <Typography>
                ${city.average_rent.toLocaleString()}/month
              </Typography>
            </Box>
  
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <DirectionsSubwayIcon sx={{ color: '#2196f3', mr: 1 }} />
              <Typography>
                Transit Score: {city.transit_score}
              </Typography>
            </Box>
  
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <RestaurantIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography>
                Dining Cost: {'$'.repeat(city.restaurant_price)}
              </Typography>
            </Box>
  
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WbSunnyIcon sx={{ color: '#ffd700', mr: 1 }} />
              <Typography>
                {city.sunny_days} Sunny Days/Year
              </Typography>
            </Box>
  
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: '#1976d2',
                fontWeight: 'bold'
              }}
            >
              Home Price: ${(city.home_price/1000).toFixed(0)}k
            </Typography>
          </CardContent>
        </Card>
      </motion.div>
    );
  };
  
  const Home = () => {
    const navigate = useNavigate();
    const originalCities = Object.values(expandedCityData);
    const [position, setPosition] = useState(0);
    
    // Create array with enough duplicates for smooth scrolling
    const CARD_WIDTH = 320; // Width of card + gap
    const VISIBLE_CARDS = Math.ceil(window.innerWidth / CARD_WIDTH) + 1;
    const cities = [
      ...originalCities,
      ...originalCities,
      ...originalCities,
      ...originalCities,
      ...originalCities
    ];
  
    useEffect(() => {
      const animate = () => {
        setPosition(prev => {
          const newPosition = prev + 1;
          const maxScroll = originalCities.length * CARD_WIDTH;
          
          // When we've scrolled past one set of cities, reset position to continue the illusion
          if (newPosition >= maxScroll) {
            return newPosition - maxScroll;
          }
          return newPosition;
        });
      };
  
      const interval = setInterval(animate, 0); // Adjust speed here (lower number = faster)
      return () => clearInterval(interval);
    }, [originalCities.length]);
  
    // Calculate which cards should be visible for performance
    const visibleCities = cities.slice(0, originalCities.length * 3);
  
    const handleNavigate = () => {
      navigate('/location');
    };
  
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f0f4f8',
          pt: 5
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            City Heatmap Explorer
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: '#666',
              mb: 4
            }}
          >
            Discover and compare cities across America
          </Typography>
        </Container>
  
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
            mb: 4,
            position: 'relative'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              transform: `translateX(-${position}px)`,
              transition: 'transform 0.1s linear'
            }}
          >
            {visibleCities.map((city, index) => (
              <CityCard key={`${city.name}-${index}`} city={city} />
            ))}
          </Box>
        </Box>
  
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Button
            variant="contained"
            onClick={handleNavigate}
            sx={{
              padding: '15px 40px',
              fontSize: '1.2rem',
              textTransform: 'none',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            Explore Cities
          </Button>
        </Box>
      </Box>
    );
  };
  
  export default Home;