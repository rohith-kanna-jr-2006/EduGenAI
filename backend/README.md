# EcoGen AI — Backend

> **Energy-Efficient AI Image Generation System Backend**  
> Built with Node.js, Express.js, and modular AI image generation providers.

EcoGen AI enables purpose-aware image generation where users can choose between an energy-efficient **Eco Mode** (lower computational effort) and a **High Quality Mode** (maximum computational effort). For every generation, the system transparently calculates and reports estimated energy consumption, computational savings, and estimated carbon emissions against a maximum-quality baseline.

---

## 1. Backend Folder Structure

```
backend/
├── package.json                   # Project metadata and dependencies
├── server.js                      # Express server entry point, CORS & routes
├── .env.example                   # Template for environment configuration
├── .env                           # Local environment secrets (ignored by Git)
├── .gitignore                     # Git ignore rules for node_modules and .env
├── README.md                      # Complete setup, testing, and API documentation
├── routes/
│   └── generationRoutes.js        # Express route definitions (/api/*)
├── controllers/
│   └── generationController.js    # Endpoint handlers & business logic
├── services/
│   ├── imageGenerationService.js  # Real AI provider integration (OpenAI, HuggingFace, Pollinations)
│   ├── resourceEstimationService.js # Configurable energy & carbon estimation logic
│   └── historyService.js          # File-based persistent generation logging
├── middleware/
│   ├── errorHandler.js            # Centralized error & 404 handler
│   ├── validateRequest.js         # Input validation for prompts and quality tiers
│   └── rateLimiter.js             # Rate limiter to protect provider quotas
└── data/
    └── history.json               # Persistent record store (auto-initialized)
```

---

## 2. Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ or v24 recommended)
- **npm**: v9.0.0 or higher

### Steps

1. Open your terminal in VS Code.
2. Navigate into the `backend` directory:
   ```bash
   cd backend
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

---

## 3. Environment Configuration

1. Copy the example configuration to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt: `copy .env.example .env`)*

2. Open `backend/.env` and review the settings:

```ini
# Server Settings
PORT=5000
NODE_ENV=development

# Allowed Frontend URL (CORS origin)
FRONTEND_URL=http://localhost:5173

# AI Provider (Options: openai, huggingface, pollinations)
IMAGE_PROVIDER=openai

# Your Secret API Key (NEVER expose in frontend)
IMAGE_API_KEY=your_openai_api_key_here

# Model identifier (optional, defaults automatically per provider)
IMAGE_MODEL=dall-e-3

# Baseline Energy Values in Watt-hours (Illustrative estimates)
ECO_ENERGY_WH=0.5
HIGH_ENERGY_WH=2.0

# Carbon Intensity in g CO2e / kWh (World average baseline ~475)
GRID_CARBON_INTENSITY=475

# Request Timeout (milliseconds)
REQUEST_TIMEOUT_MS=60000

# Rate Limiting
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW_MS=900000
```

### Supported AI Image Providers

| Provider | `IMAGE_PROVIDER` | `IMAGE_API_KEY` Format | Quality Differentiation Method |
| :--- | :--- | :--- | :--- |
| **OpenAI (Default)** | `openai` | `sk-...` from [OpenAI Platform](https://platform.openai.com) | DALL-E 3 (`standard` vs `hd`) or DALL-E 2 (`512x512` vs `1024x1024`) |
| **Hugging Face** | `huggingface` | `hf_...` from [HF Settings](https://huggingface.co/settings/tokens) | FLUX / SDXL inference steps (15 vs 40 steps, 512px vs 1024px) |
| **Pollinations** | `pollinations` | *(Leave blank - free open AI service)* | Model architecture (`turbo` vs `flux`) and resolution (512px vs 1024px) |

> [!NOTE]
> If `IMAGE_API_KEY` is not provided and you use `openai` or `huggingface`, the backend returns a clear HTTP 503 error explaining how to configure it. It will **never** claim an image was generated when generation fails.
> To test real image generation immediately without a paid API key, you can set `IMAGE_PROVIDER=pollinations`.

---

## 4. Starting the Backend Server

From inside the `backend` directory:

- **Standard Start**:
  ```bash
  npm start
  ```
- **Development Mode with Auto-Reload** (Node --watch):
  ```bash
  npm run dev
  ```

You should see:
```text
====================================================
🌱 EcoGen AI Backend Server is running!
📡 URL: http://localhost:5000
🔗 Allowed Frontend Origin: http://localhost:5173
🤖 Active Image Provider: openai
⚡ Eco Baseline: 0.5 Wh | High Baseline: 2.0 Wh
🩺 Health check: http://localhost:5000/api/health
====================================================
```

---

## 5. API Reference & Testing

### 1. Health Check
- **Endpoint**: `GET http://localhost:5000/api/health`
- **Purpose**: Verify backend operational status.
- **cURL / PowerShell**:
  ```bash
  curl http://localhost:5000/api/health
  ```
- **Response**:
  ```json
  {
    "success": true,
    "status": "healthy",
    "message": "EcoGen AI backend is operational and ready to serve requests.",
    "uptimeSeconds": 42,
    "timestamp": "2026-10-10T13:45:00.000Z",
    "environment": "development",
    "activeProvider": "openai"
  }
  ```

---

### 2. Available Quality Tiers
- **Endpoint**: `GET http://localhost:5000/api/quality-tiers`
- **Purpose**: Retrieve tier specifications, estimated energy consumption, and savings baselines.
- **cURL / PowerShell**:
  ```bash
  curl http://localhost:5000/api/quality-tiers
  ```
- **Response**:
  ```json
  {
    "success": true,
    "qualityTiers": [
      {
        "id": "eco",
        "name": "Eco Mode",
        "description": "Optimized for energy efficiency using fewer inference steps and reduced computational overhead.",
        "computationalEffort": "low",
        "estimatedEnergyWh": 0.5,
        "energySavedWh": 1.5,
        "energySavedPercentage": 75,
        "estimatedCarbonEmissionsGCO2e": 0.238,
        "isBaseline": false
      },
      {
        "id": "high",
        "name": "High Quality Mode",
        "description": "Maximum visual fidelity and resolution using full computational effort.",
        "computationalEffort": "high",
        "estimatedEnergyWh": 2.0,
        "energySavedWh": 0,
        "energySavedPercentage": 0,
        "estimatedCarbonEmissionsGCO2e": 0.95,
        "isBaseline": true
      }
    ],
    "baseline": {
      "highQualityBaselineEnergyWh": 2.0,
      "gridCarbonIntensityGPerKwh": 475,
      "estimated": true,
      "disclaimer": "Resource values are illustrative estimates based on configurable models and are not direct hardware measurements."
    }
  }
  ```

---

### 3. Generate Image
- **Endpoint**: `POST http://localhost:5000/api/generate`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "prompt": "A serene solar-powered glass house in a green valley",
    "quality": "eco"
  }
  ```
- **cURL**:
  ```bash
  curl -X POST http://localhost:5000/api/generate \
    -H "Content-Type: application/json" \
    -d "{\"prompt\":\"A serene solar-powered glass house in a green valley\",\"quality\":\"eco\"}"
  ```
- **Successful Response (HTTP 200)**:
  ```json
  {
    "success": true,
    "image": {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/private/org-xxx/..."
    },
    "quality": "eco",
    "resources": {
      "energyWh": 0.5,
      "estimated": true,
      "computationalEffort": "low",
      "energySavedWh": 1.5,
      "energySavedPercentage": 75,
      "carbonEmissionsGramsCO2e": 0.238
    },
    "message": "Image generated successfully. Resource values are illustrative estimates."
  }
  ```

- **Missing API Key Response (HTTP 503)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "API_KEY_NOT_CONFIGURED",
      "provider": "openai",
      "message": "OpenAI API key is missing. Please add your OpenAI API key (sk-...) to IMAGE_API_KEY in backend/.env to generate images.",
      "guide": "To fix this:\n1. Open backend/.env\n2. Set IMAGE_PROVIDER=openai\n3. Set IMAGE_API_KEY=<your_openai_api_key>\n4. Restart the backend server."
    }
  }
  ```

- **Validation Failure Response (HTTP 400)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "field": "prompt",
      "message": "The \"prompt\" field cannot be empty."
    }
  }
  ```

---

### 4. Generation History
- **Endpoint**: `GET http://localhost:5000/api/history?limit=10&offset=0`
- **Purpose**: Retrieve historical generations, prompts, images, and resource estimates.
- **cURL / PowerShell**:
  ```bash
  curl http://localhost:5000/api/history
  ```
- **Response**:
  ```json
  {
    "success": true,
    "total": 1,
    "limit": 20,
    "offset": 0,
    "hasMore": false,
    "history": [
      {
        "id": "gen_88f9a3f2-1d74-4ec2-a279-7f3c64c48972",
        "prompt": "A serene solar-powered glass house in a green valley",
        "quality": "eco",
        "image": {
          "url": "https://..."
        },
        "resources": {
          "energyWh": 0.5,
          "estimated": true,
          "computationalEffort": "low",
          "energySavedWh": 1.5,
          "energySavedPercentage": 75,
          "carbonEmissionsGramsCO2e": 0.238
        },
        "provider": "openai",
        "model": "dall-e-3",
        "createdAt": "2026-10-10T13:46:12.314Z"
      }
    ],
    "storageType": "persistent_json_file"
  }
  ```

---

## 6. How to Connect Your React Frontend

Your React frontend does **not** need any modification to its UI components. Simply direct your API calls to `http://localhost:5000/api` using standard `fetch()` or `axios`.

### Example 1: Generate Image (`POST /api/generate`)
```javascript
async function generateEcoImage(promptText, selectedQualityTier) {
  try {
    const response = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptText,
        quality: selectedQualityTier // "eco" or "high"
      })
    });

    const data = await response.json();

    if (!data.success) {
      // Display user-friendly error from backend
      console.error('Generation failed:', data.error.message);
      alert(`Error: ${data.error.message}`);
      return null;
    }

    // Access the generated image and resource metrics:
    const imageUrl = data.image.url;
    const energyUsed = data.resources.energyWh; // e.g. 0.5 Wh
    const energySaved = data.resources.energySavedWh; // e.g. 1.5 Wh
    const percentSaved = data.resources.energySavedPercentage; // e.g. 75%
    const carbonEmitted = data.resources.carbonEmissionsGramsCO2e; // e.g. 0.238 g

    console.log(`Image ready! Saved ${energySaved} Wh (${percentSaved}% energy saved)`);
    return data;
  } catch (networkErr) {
    console.error('Could not connect to backend server:', networkErr);
  }
}
```

### Example 2: Fetch Quality Tiers (`GET /api/quality-tiers`)
```javascript
async function loadQualityTiers() {
  const response = await fetch('http://localhost:5000/api/quality-tiers');
  const data = await response.json();
  if (data.success) {
    return data.qualityTiers;
  }
}
```

### Example 3: Fetch History (`GET /api/history`)
```javascript
async function loadGenerationHistory() {
  const response = await fetch('http://localhost:5000/api/history?limit=20');
  const data = await response.json();
  if (data.success) {
    return data.history;
  }
}
```

---

## 7. Resource & Energy Calculation Model

The backend uses a transparent, defensible estimation formula:

1. **High Quality Baseline ($E_{\text{high}}$)**:
   - Configured via `HIGH_ENERGY_WH` (Default: $2.0\text{ Wh}$).
2. **Selected Mode Energy ($E_{\text{selected}}$)**:
   - For **Eco Mode**: $0.5\text{ Wh}$ (from `ECO_ENERGY_WH`).
   - For **High Quality Mode**: $2.0\text{ Wh}$.
3. **Energy Saved**:
   $$\text{Energy Saved (Wh)} = \max(0, E_{\text{high}} - E_{\text{selected}})$$
   - Eco Mode: $2.0 - 0.5 = 1.5\text{ Wh}$
   - High Quality Mode: $2.0 - 2.0 = 0.0\text{ Wh}$
4. **Percentage of Energy Saved**:
   $$\text{Energy Saved (\%)} = \left(\frac{\text{Energy Saved}}{E_{\text{high}}}\right) \times 100$$
   - Eco Mode: $\left(\frac{1.5}{2.0}\right) \times 100 = 75.0\%$
   - High Quality Mode: $0.0\%$
5. **Estimated Carbon Emissions ($C$)**:
   $$C = \left(\frac{E_{\text{selected}}}{1000}\right) \times \text{Grid Carbon Intensity (g CO}_2\text{e/kWh)}$$
   Using the global standard grid factor of $475\text{ g CO}_2\text{e/kWh}$:
   - Eco: $\left(\frac{0.5}{1000}\right) \times 475 = 0.238\text{ g CO}_2\text{e}$
   - High: $\left(\frac{2.0}{1000}\right) \times 475 = 0.950\text{ g CO}_2\text{e}$

> **Disclaimer**: All energy and carbon figures generated are model-based illustrative estimates for comparative and educational awareness, not direct hardware-level electricity meter readings.
