# 🚀 Global OCR API

Fast, accurate OCR extraction for document types using **Google Gemini 2.5 Flash Lite**. Optimized for speed with 1-2 second response times.

## ✨ Features

- **🏆 High-Speed OCR**: Optimized for 1-2 second response times
- **📄 Multi-Document Support**: NID, BO Certificate, TIN Certificate, Bank Statements  
- **🤖 AI-Powered**: Google Gemini 2.5 Flash Lite with custom prompts
- **🔧 Smart Processing**: Automatic image optimization and compression
- **⚡ Performance Optimized**: Concurrent request handling and deduplication
- **📝 Type-Safe**: Full TypeScript support with strict typing
- **🔍 Auto-Validation**: Built-in response validation for each document type
- **📚 API Documentation**: Interactive Swagger UI at `/api`

## 🎯 Supported Document Types

| Document Type | Fields Extracted |
|---------------|------------------|
| **NID** | name, date_of_birth, nid_number |
| **BO** | bo_id (16 digits) |
| **TIN** | tin_number (12 digits) |
| **BANK** | account_number, routing_number |

## 📋 Requirements

- **Node.js**: 18+ 
- **NPM**: 8+
- **Google Gemini API Key**: [Get it here](https://aistudio.google.com/app/apikey)

## ⚙️ Setup & Installation

### 1. Clone and Install
```bash
git clone <repository-url>
cd ocr-global-api
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=6060
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod

# Standard development
npm run start
```

The server will start at `http://localhost:6060`

## 📖 API Documentation

Interactive Swagger UI available at: **`http://localhost:6060/api`**

## 🔌 API Usage

### Endpoint
```
POST /api/ocr
```

### Request Format
```bash
curl -X POST http://localhost:6060/api/ocr \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.jpg" \
  -F "type=NID"
```

### Supported File Types
- **Images**: JPG, PNG, WebP, BMP, TIFF
- **Documents**: PDF
- **Max Size**: 10MB

### Document Types
- `NID` - National ID Card
- `BO` - BO Certificate  
- `TIN` - TIN Certificate
- `BANK` - Bank Statement

### Response Format
```json
{
  "type": "NID",
  "details": {
    "name": "John Doe",
    "date_of_birth": "01/01/1990", 
    "nid_number": "1234567890123"
  }
}
```

### Error Response
```json
{
  "type": "NID",
  "details": {}
}
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests  
npm run test:e2e

# Test coverage
npm run test:cov

# Test with watch mode
npm run test:watch
```

## 🚀 Performance Features

- **⚡ Sub-2 Second Response**: Optimized prompts and model parameters
- **🔄 Concurrent Processing**: Handles multiple requests efficiently  
- **📦 Smart Caching**: Deduplicates identical requests
- **🖼️ Image Optimization**: Automatic compression (800x800, 75% quality)
- **🎯 Direct API Calls**: No streaming overhead for maximum speed

## 🏗️ Architecture

```
src/
├── common/
│   ├── prompts/           # Optimized AI prompts
│   └── utils/             # Image optimization utilities
├── ocr/
│   ├── dto/               # Request/response types
│   ├── enums/             # Document type enums
│   ├── ocr-helpers.ts     # Pure utility functions
│   ├── ocr.service.ts     # Core OCR logic
│   └── ocr.controller.ts  # API endpoints
└── main.ts                # Application bootstrap
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `GEMINI_API_KEY` | Google Gemini API key | **Required** |

### Model Configuration
- **Model**: `gemini-2.5-flash-lite`
- **Temperature**: `0` (deterministic)
- **Max Output Tokens**: `256`
- **Response Format**: JSON with schema validation

## 🐛 Troubleshooting

### Common Issues

**1. "API Key not found"**
```bash
# Ensure .env file exists and contains:
GEMINI_API_KEY=your_actual_api_key
```

**2. "Port already in use"**
```bash
# Change port in .env file:
PORT=6060
```

**3. "File too large"**
- Max file size: 10MB
- Supported formats: JPG, PNG, WebP, BMP, TIFF, PDF

**4. "Empty response"**
- Ensure document text is clear and readable
- Check document type matches the `type` parameter
- Verify image quality is sufficient

## 📚 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format
```

### Build
```bash
# Build for production
npm run build

# Start built version
npm run start:prod
```

## 📄 License

This project is [MIT licensed](LICENSE).
# NID-BO-BANK-TIN-Parser-With-AI
