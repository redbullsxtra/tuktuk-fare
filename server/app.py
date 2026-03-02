from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
from dashscope import MultiModalConversation
import dashscope
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set the base URL for the international region
dashscope.base_http_api_url = 'https://dashscope-intl.aliyuncs.com/api/v1'

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/detect-landmark', methods=['POST'])
def detect_landmark():
    try:
        data = request.get_json()
        image = data.get('image')
        
        # Validate input
        if not image:
            return jsonify({'error': 'Missing required field: image'}), 400
        
        # Configuration for Alibaba Cloud Model Studio API
        api_key = os.getenv('DASHSCOPE_API_KEY')
        
        if not api_key:
            return jsonify({'error': 'API key not configured on server'}), 500
        
        # Handle base64 image data
        # Check if the image is a data URL (starts with 'data:image/')
        if image.startswith('data:image/'):
            # Extract the base64 part
            header, encoded = image.split(',', 1)
            # Create a temporary file-like object for the SDK
            # For the SDK, we'll create a temporary base64 string with file:// protocol
            image_path = f"data:{header.split(':')[1]},{encoded}"
        else:
            # If it's already a base64 string, add the data URL prefix
            image_path = f"data:image/jpeg;base64,{image}"
        
        # Prepare messages for the model
        messages = [
            {
                'role': 'user',
                'content': [
                    {'image': image_path},
                    {'text': 'Identify the landmark or place shown in this image. Respond with just the name of the landmark or place.'}
                ]
            }
        ]
        
        # Call the MultiModalConversation API using the DashScope SDK
        print(f"Calling Qwen3.5-flash model with image data...")
        response = MultiModalConversation.call(
            api_key=api_key,
            model='qwen3.5-flash',  # Using qwen3.5-flash model
            messages=messages
        )
        
        # Print the raw response for debugging
        print(f"Raw SDK Response: {response}")
        
        # Extract the text content from the response
        content_text = ""
        if hasattr(response.output.choices[0].message, 'content'):
            content = response.output.choices[0].message.content
            if isinstance(content, list):
                # If content is a list, find the text element
                for item in content:
                    if isinstance(item, dict) and 'text' in item:
                        content_text = item['text']
                        break
            elif isinstance(content, str):
                content_text = content
            else:
                content_text = str(content)
        
        # Print the extracted content
        print(f"Extracted content: {content_text}")
        
        # Convert the response to the expected format
        # The SDK response structure may differ from the direct API response
        result = {
            'output': {
                'choices': [
                    {
                        'message': {
                            'content': content_text
                        }
                    }
                ]
            }
        }
        
        # Print the final result being sent to frontend
        print(f"Sending result to frontend: {result}")
        
        return jsonify(result)
    
    except Exception as e:
        print(f'Error in landmark detection: {str(e)}')
        return jsonify({'error': 'Internal server error during landmark detection'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))