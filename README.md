# 🌿 PlantAI — Plant Disease Detector

A full-stack web app that uses YOLOv8 to detect plant diseases from leaf images.

---

## 📁 Project Structure

```
plant-disease-detector/
├── backend/
│   ├── main.py          ← FastAPI server
│   ├── model.py         ← YOLO model loader & predictor
│   ├── requirements.txt
│   └── model/
│       └── best.pt      ← YOLOv8 model file
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── Dockerfile
└── README.md
```

---

## 🚀 Setup

### Step 1 — Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2 — Add model file

Place your `best.pt` file inside `backend/model/`:

```
backend/model/best.pt
```

### Step 3 — Run the backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000` in your browser.

---

## 🧠 Detectable Diseases

| Class | Disease |
|-------|---------|
| `bercak_daun` | Leaf Spots |
| `defisiensi_kalsium` | Calcium Deficiency |
| `hangus_daun` | Leaf Scorch |
| `hawar_daun` | Leaf Blight |
| `mosaik_vena_kuning` | Yellow Vein Mosaic |
| `virus_kuning_keriting` | Yellow Curly Virus |

---

## 🐳 Docker (Optional)

```bash
docker build -t plantai .
docker run -p 8000:8000 plantai
```

---

## 🌐 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/health` | Check if model is loaded |
| `POST` | `/predict` | Upload image, get prediction |
| `GET` | `/docs` | Swagger UI for testing |

### Example prediction response:
```json
{
  "disease": "hawar_daun",
  "confidence": 94.28,
  "total_detections": 1,
  "detections": [
    { "disease": "hawar_daun", "confidence": 94.28 }
  ],
  "annotated_image": "<base64 string>"
}
```

---

## ⚠️ Disclaimer

This application is for **educational and research purposes only**.  
Always consult a qualified agricultural expert or plant pathologist for serious crop issues.