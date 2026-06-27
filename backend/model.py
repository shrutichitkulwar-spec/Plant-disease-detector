import os
import io
import cv2
import numpy as np
from PIL import Image

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "best.pt")
CONFIDENCE = 0.25

_model = None

def _load_model():
    global _model
    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"Model not found at '{MODEL_PATH}'.")
    from ultralytics import YOLO
    _model = YOLO(MODEL_PATH)
    print(f"[model.py] YOLO model loaded!")

def get_model():
    global _model
    if _model is None:
        _load_model()
    return _model

def get_model_info():
    try:
        get_model()
        return {"loaded": True, "type": "YOLO", "path": MODEL_PATH}
    except Exception as e:
        return {"loaded": False, "error": str(e)}

def predict(image_bytes: bytes) -> dict:
    model = get_model()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        image.save(tmp.name)
        tmp_path = tmp.name

    results = model.predict(tmp_path, conf=CONFIDENCE, verbose=False)
    try:
        os.unlink(tmp_path)
    except:
        pass

    result = results[0]

    annotated_bgr = result.plot()
    annotated_rgb = cv2.cvtColor(annotated_bgr, cv2.COLOR_BGR2RGB)
    annotated_pil = Image.fromarray(annotated_rgb)
    buf = io.BytesIO()
    annotated_pil.save(buf, format="JPEG", quality=90)
    import base64
    annotated_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    if len(result.boxes) == 0:
        detections = []
        top_disease = "Healthy 🌱"
        top_confidence = 100.0
    else:
        seen = {}
        for box in result.boxes:
            cls_name = result.names[int(box.cls)]
            conf_val = float(box.conf)
            if cls_name not in seen or conf_val > seen[cls_name]:
                seen[cls_name] = conf_val
        detections = [
            {"disease": k, "confidence": round(v * 100, 2)}
            for k, v in sorted(seen.items(), key=lambda x: -x[1])
        ]
        top_disease = detections[0]["disease"]
        top_confidence = detections[0]["confidence"]

    return {
        "disease": top_disease,
        "confidence": top_confidence,
        "total_detections": len(result.boxes),
        "detections": detections,
        "annotated_image": annotated_b64,
    }