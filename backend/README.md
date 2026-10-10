# EduGenAI — Energy-Efficient AI Image Generation System Backend

> **Backend Service for EduGenAI with Stable Diffusion XL (SDXL) Integration**  
> Built with Node.js, Express.js, and HTTP communication to an external Python SDXL inference service (Google Colab, RunPod, or local GPU server).

EduGenAI enables purpose-aware, energy-conscious AI image generation. Users can select between an **Economy** condition (fewer inference steps, lower computational workload) and a **High Quality** condition (full inference steps for detailed educational visuals). The system provides transparent estimates of relative compute units, energy savings, and carbon metrics alongside actual GPU performance measurements.

---

## 1. Backend Architecture & Folder Structure

```
backend/
├── package.json                   # Project metadata and dependencies (Express, Axios, CORS, dotenv)
├── server.js                      # Express server entry point, CORS, and route mounting
├── .env.example                   # Environment configuration template
├── .env                           # Active environment settings (ignored by Git)
├── .gitignore                     # Git ignore rules for node_modules and .env
├── README.md                      # Complete installation, SDXL setup, and API guide
├── routes/
│   └── generationRoutes.js        # Route endpoints (/api/generate, /api/health, etc.)
├── controllers/
│   └── generationController.js    # Request handlers & orchestration
├── services/
│   ├── generationPolicyService.js # Condition-based policies, step allocation & compute savings
│   ├── modelService.js            # HTTP client for Python SDXL inference service
│   └── historyService.js          # Persistent disk-backed generation log store
├── utils/
│   └── validateGenerationRequest.js # Request payload validation middleware
├── middleware/
│   ├── errorHandler.js            # Centralized error handler (no fake responses)
│   └── rateLimiter.js             # Rate limiter to protect GPU workloads
├── data/
│   └── history.json               # Persistent record store
└── model-service/
    └── sdxl_server.py             # Ready-to-run Python/FastAPI SDXL inference server (for Colab / local GPU)
```

---

## 2. Prerequisites & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ or v24 recommended)
- **npm**: v9.0.0 or higher
- **Python 3.10+ with CUDA GPU** (in Google Colab, RunPod, or local machine) for the SDXL model service

### Installation Steps

1. Open your VS Code terminal and navigate into the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

---

## 3. Environment Configuration

1. Create your local `.env` from `.env.example`:
   ```bash
   copy .env.example .env
   ```
2. Open `backend/.env` and review the configuration:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Allowed Frontend Origin (for CORS)
FRONTEND_URL=http://localhost:5173

# External Python SDXL Model Inference Service Endpoint
# Point this to your Google Colab tunnel (e.g., https://xxxx.ngrok-free.app/generate)
# or local GPU server (http://localhost:8000/generate)
SDXL_MODEL_ENDPOINT=http://localhost:8000/generate

# Optional Authentication Token if your model endpoint requires it
SDXL_API_KEY=

# Inference Step Policies
ECONOMY_STEPS=15
HIGH_QUALITY_STEPS=50

# Illustrative Energy Baseline Values (Watt-hours)
ECO_ENERGY_WH=0.5
HIGH_ENERGY_WH=2.0

# Average Grid Carbon Intensity in grams CO2e per kWh (Global average baseline: ~475)
GRID_CARBON_INTENSITY=475

# Request Timeout for Diffusion (in milliseconds, default: 90000ms / 90s)
REQUEST_TIMEOUT_MS=90000

# Rate Limiting
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MS=900000
```

---

## 4. Setting Up the SDXL Model Service (Google Colab or Local GPU)

The backend connects via HTTP to an external Python-based SDXL pipeline. A complete, high-performance FastAPI server is provided at [`backend/model-service/sdxl_server.py`](file:///d:/srisakthibackend/backend/model-service/sdxl_server.py).

### Running in Google Colab (Free or Pro GPU)

1. Open a new notebook in [Google Colab](https://colab.research.google.com) with **GPU Hardware Accelerator** enabled (`Runtime -> Change runtime type -> T4 GPU` or `A100`).
2. Run the following cell in Colab:

```python
# 1. Install dependencies
!pip install -q fastapi uvicorn diffusers transformers accelerate torch pyngrok

# 2. Upload or write backend/model-service/sdxl_server.py into Colab
# 3. Expose via ngrok:
from pyngrok import ngrok
ngrok.set_auth_token("YOUR_NGROK_AUTHTOKEN")
public_url = ngrok.connect(8000).public_url
print("SDXL Public Endpoint:", f"{public_url}/generate")

# 4. Start the server
!python sdxl_server.py
```

3. Copy the generated `https://xxxx.ngrok-free.app/generate` URL and paste it into `backend/.env` as:
   ```ini
   SDXL_MODEL_ENDPOINT=https://xxxx.ngrok-free.app/generate
   ```

---

## 5. Starting the Express Backend

In your VS Code terminal:

```bash
cd backend

# Option 1: Standard start
npm start

# Option 2: Development mode with auto-reload
npm run dev
```

You should see:
```text
====================================================
🎓 EduGenAI Backend Server is running!
📡 URL: http://localhost:5000
🔗 Allowed Frontend Origin: http://localhost:5173
🤖 SDXL Model Endpoint: http://localhost:8000/generate
⚡ Economy Steps: 15 | High Quality Steps: 50
🩺 Health check: http://localhost:5000/api/health
====================================================
```

---

## 6. API Reference

### 1. Health Check
- **Endpoint**: `GET http://localhost:5000/api/health`
- **Output**:
  ```json
  {
    "success": true,
    "status": "healthy",
    "service": "EduGenAI Backend",
    "uptimeSeconds": 24,
    "timestamp": "2026-10-10T15:45:00.000Z",
    "environment": "development",
    "modelService": {
      "endpoint": "http://localhost:8000/generate",
      "status": "online"
    }
  }
  ```

---

### 2. Available Conditions & Baselines
- **Endpoint**: `GET http://localhost:5000/api/conditions` (or `/api/quality-tiers`)
- **Output**:
  ```json
  {
    "success": true,
    "conditions": [
      {
        "id": "economy",
        "name": "Economy Mode",
        "description": "Optimized for sustainability and speed using fewer inference steps to reduce computational effort.",
        "inferenceSteps": 15,
        "computationalEffort": "low",
        "relativeComputeUnits": 15,
        "relativeComputeSavedUnits": 35,
        "relativeComputeSavingsPercentage": 70,
        "estimatedEnergyWh": 0.5,
        "energySavedWh": 1.5,
        "energySavedPercentage": 75,
        "estimatedCarbonGCO2e": 0.238
      },
      {
        "id": "high_quality",
        "name": "High Quality Mode",
        "description": "Maximum visual detail and fidelity using full inference steps.",
        "inferenceSteps": 50,
        "computationalEffort": "high",
        "relativeComputeUnits": 50,
        "relativeComputeSavedUnits": 0,
        "relativeComputeSavingsPercentage": 0,
        "estimatedEnergyWh": 2,
        "energySavedWh": 0,
        "energySavedPercentage": 0,
        "estimatedCarbonGCO2e": 0.95
      }
    ],
    "baseline": {
      "highQualityBaselineSteps": 50,
      "highQualityBaselineEnergyWh": 2,
      "disclaimer": "Compute units and energy values are model-based comparative estimates. Reducing inference steps reduces GPU compute workload, but actual physical electricity consumption depends on runtime hardware and data center infrastructure."
    }
  }
  ```

---

### 3. Generate Image
- **Endpoint**: `POST http://localhost:5000/api/generate` (also aliases `/api/generation/create`)
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "prompt": "A scientific illustration of the solar system",
    "category": "education",
    "constraints": [
      "dark background",
      "no text"
    ],
    "condition": "economy",
    "settings": {
      "width": 1024,
      "height": 1024,
      "guidanceScale": 5.0,
      "seed": 42
    }
  }
  ```

- **Successful Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "image": {
      "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    },
    "condition": "economy",
    "category": "education",
    "policy": {
      "inferenceSteps": 15,
      "computationalEffort": "low",
      "relativeComputeUnits": 15,
      "relativeComputeSavedUnits": 35,
      "relativeComputeSavingsPercentage": 70,
      "estimatedEnergyWh": 0.5,
      "energySavedWh": 1.5,
      "energySavedPercentage": 75,
      "estimatedCarbonEmissionsGCO2e": 0.238,
      "isEstimated": true,
      "disclaimer": "Compute units and energy values are model-based comparative estimates. Reducing inference steps reduces computational effort, but actual physical electricity consumption depends on specific server hardware and data center infrastructure."
    },
    "measurements": {
      "measuredInferenceTimeSeconds": 2.45,
      "device": "NVIDIA A100-SXM4-40GB",
      "actualSteps": 15,
      "memoryAllocatedMb": 7420.5
    },
    "message": "Image generated successfully via SDXL pipeline."
  }
  ```

- **Model Service Unavailable Response (HTTP 503)**:
  *Returned when the Python SDXL Colab/local service is offline (no fake images generated!):*
  ```json
  {
    "success": false,
    "error": {
      "code": "MODEL_SERVICE_UNAVAILABLE",
      "message": "Cannot connect to SDXL model service at \"http://localhost:8000/generate\". Please verify that your Python/Google Colab SDXL inference server is running and accessible.",
      "details": {
        "endpoint": "http://localhost:8000/generate",
        "solution": "Start your SDXL inference service (e.g. running the provided Colab script) and update SDXL_MODEL_ENDPOINT in backend/.env"
      }
    }
  }
  ```

- **Validation Error Response (HTTP 400)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Request payload validation failed.",
      "details": [
        {
          "field": "prompt",
          "message": "Prompt cannot be empty after trimming."
        }
      ]
    }
  }
  ```

---

### 4. Generation History
- **Endpoint**: `GET http://localhost:5000/api/history` (or `/api/generation/history`)
- **Query Parameters**:
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)
  - `search`: search term for prompt or title
  - `category`: worksheet | poster | flashcard | illustration

---

## 7. Connecting Your Existing React Frontend

Your existing React frontend communicates with the backend via the `apiClient` defined in `src/services/api.js`.

To connect:
1. Ensure your frontend `.env` (or default fallback) points to:
   ```ini
   REACT_APP_API_BASE_URL=http://localhost:5000/api
   ```
2. The backend provides full native routing support for:
   - `/api/generation/create` (used by `GenerationStudioPage.jsx`)
   - `/api/generation/history` (used by `HistoryPage.jsx`)
   - `/api/models`, `/api/rules`, `/api/budget/summary`, `/api/analytics`
   - `/api/auth/login`, `/api/auth/signup`
