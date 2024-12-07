import React, { useState } from "react";
import axios from "axios";
import { Container, Typography, TextField, Button, Alert, Box, Paper } from "@mui/material";

const App = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);  
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const handleGenerateOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5000/generate-otp", { email });
      setMessage(response.data.message);
      setError(false);
      setStep(2);  
    } catch (err) {
      setMessage(err.response?.data?.message || "Error generating OTP");
      setError(true);
    }
  };

  const handleValidateOtp = async () => {
    try {
      const response = await axios.post("http://localhost:5000/validate-otp", { email, otp });
      setMessage(response.data.message);
      setError(false);
      if (response.status === 200) {
        setStep(3); // Move to success step
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error validating OTP");
      setError(true);
    }
  };

  const handleReset = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setMessage("");
    setError(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          OTP System
        </Typography>

        {message && (
          <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {step === 1 && (
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter your email to receive an OTP.
            </Typography>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@example.com"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleGenerateOtp}
            >
              Generate OTP
            </Button>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="body1" sx={{ mb: 2 }}>
              Enter the OTP sent to your email.
            </Typography>
            <TextField
              fullWidth
              label="OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleValidateOtp}
            >
              Validate OTP
            </Button>
          </Box>
        )}

        {step === 3 && (
          <Box textAlign="center">
            <Typography variant="h5" sx={{ mb: 2 }} color="green">
              Login Verified Successfully!
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReset}
            >
              Verify Another Email
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default App;
