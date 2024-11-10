import React, {useState, useEffect} from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Accordion,
  AccordionSummary,
  Divider,
  List,
  ListItem,
  ListItemText,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function CityModal({ open, handleClose, selectedCity }) {
  const [loading, setLoading] = useState(true);
  const [cityData, setCityData] = useState(null);

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: 800,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    maxHeight: '90vh',
    overflow: 'auto',
    borderRadius: 2,
  };


  useEffect(() => {
    if (!open || !selectedCity) return;

    const fetchCityDetails = async () => {
      setLoading(true);
      try {
        // Replace with actual data-fetching logic
        const response = await fetch(`http://10.25.245.175:5001/city-details/${selectedCity.name}`);
        if (!response.ok) throw new Error("Failed to fetch city details");

        const data = await response.json();
        console.log(data)
        setCityData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCityDetails();
  }, [open, selectedCity]);

    if (!selectedCity) return;

    const renderListItems = (items) => {
        return items.map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <ListItem key={idx}>
                <ListItemText primary={item} />
              </ListItem>
            );
          } else if (typeof item === 'object') {
            const key = Object.keys(item)[0];
            const value = Object.values(item)[0];
            return (
              <ListItem key={idx}>
                <ListItemText primary={`${key}: ${value}`} />
              </ListItem>
            );
          }
          return null;
        });
      };
    
      const renderContent = (content) => {
        if (Array.isArray(content)) {
            // If content is an array, render each item as a list
            return <List>{renderListItems(content)}</List>;
          } else if (typeof content === 'object') {
            // If content is an object, recursively render each key-value pair
            return Object.keys(content).map((subKey, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{subKey}:</Typography>
                {renderContent(content[subKey])}
              </Box>
            ));
          } else if (typeof content === 'string') {
            // Split the string by '\n' and render each line with a <br />
            return content.split('\n').map((line, index) => (
              <Typography key={index} variant="body1" component="span">
                {line}
                {index < content.split('\n').length - 1 && <br />}
              </Typography>
            ));
          }
        return null;
      };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="city-modal-title"
    >
      <Box sx={modalStyle}>
        <Typography id="city-modal-title" variant="h4" component="h2" gutterBottom>
          {selectedCity.name} Details
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Cost of Living</TableCell>
                <TableCell align="right">${selectedCity.cost_of_living.toLocaleString()}</TableCell>
                {/* <TableCell align="right">{selectedCity.costChange || 'N/A'}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Average Salary</TableCell>
                <TableCell align="right">${selectedCity.average_salary.toLocaleString()}</TableCell>
                {/* <TableCell align="right">{selectedCity.salaryChange || 'N/A'}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Average Rent</TableCell>
                <TableCell align="right">${selectedCity.average_rent.toLocaleString()}</TableCell>
                {/* <TableCell align="right">{selectedCity.rentChange || 'N/A'}</TableCell> */}
              </TableRow>
              <TableRow>
                <TableCell>Home Price</TableCell>
                <TableCell align="right">${selectedCity.home_price.toLocaleString()}</TableCell>
                {/* <TableCell align="right">{selectedCity.priceChange || 'N/A'}</TableCell> */}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>


        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* <Typography variant="h6" mb={2}>{cityData?.name || 'City Details'}</Typography> */}
            <Box sx={{ width: '80%', margin: '0 auto', mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Relocation Guide for {cityData.cityName || "Selected City"}
            </Typography>

            {Object.keys(cityData).map((sectionKey, index) => (
                <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">{sectionKey}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {renderContent(cityData[sectionKey])}
                </AccordionDetails>
                </Accordion>
            ))}
            </Box>
         </>
        )}

        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button onClick={handleClose} variant="contained">Close</Button>
        </Box>
      </Box>
    </Modal>
  );
}