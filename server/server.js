const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Add your frontend origins
  credentials: true
}));
app.use(bodyParser.json());

// Route for landmark detection using Qwen3-VL
app.post('/api/detect-landmark', async (req, res) => {
  try {
    const { image } = req.body;
    
    // Validate input
    if (!image) {
      return res.status(400).json({ error: 'Missing required field: image' });
    }

    // Configuration for Alibaba Cloud Model Studio API
    const apiKey = process.env.DASHSCOPE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured on server' });
    }

    // Prepare request body for Qwen3-VL model
    const requestBody = {
      model: 'qwen3-vl',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                image: image, // Pass the base64 image directly
              },
              {
                text: 'Identify the landmark or place shown in this image. Respond with just the name of the landmark or place.',
              }
            ]
          }
        ]
      },
      parameters: {
        temperature: 0.1,
        top_p: 0.9
      }
    };

    // Make request to Alibaba Cloud Model Studio API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: `Qwen3-VL API request failed: ${response.statusText}`,
        details: errorData 
      });
    }

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('Error in landmark detection:', error);
    res.status(500).json({ error: 'Internal server error during landmark detection' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});