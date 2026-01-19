"""
legal_classifier.py
Plug-and-play legal case classifier.

USAGE:
    from legal_classifier import classify_legal_text
    
    result = classify_legal_text("Your legal document text here...")
    print(result)
    # Output: {"type": "Criminal", "confidence": 0.85, "civil_prob": 0.15, "criminal_prob": 0.85}

REQUIREMENTS:
    - The ./civil_criminal_model folder must be in the same directory
    - pip install transformers torch
"""

import torch
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# === CONFIGURATION ===
from pathlib import Path
MODEL_PATH = str(Path(__file__).parent / "civil_criminal_model")
MAX_LENGTH = 512

# === LOAD MODEL (once when module is imported) ===
_tokenizer = None
_model = None


def _load_model():
    """Load model lazily on first use."""
    global _tokenizer, _model
    if _tokenizer is None or _model is None:
        _tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
        _model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
        _model.eval()
    return _tokenizer, _model


def classify_legal_text(text: str) -> dict:
    """
    Classify a legal document as Criminal or Civil.
    
    Args:
        text: The legal document text (can be any length, will be truncated if needed)
    
    Returns:
        dict with keys:
            - "type": "Criminal" or "Civil"
            - "confidence": float between 0 and 1
            - "civil_prob": probability of Civil
            - "criminal_prob": probability of Criminal
    
    Example:
        >>> result = classify_legal_text("He stabbed the victim with a knife")
        >>> result["type"]
        'Criminal'
        >>> result["confidence"]
        0.92
    """
    tokenizer, model = _load_model()
    
    # Tokenize
    inputs = tokenizer(
        text,
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH,
        return_tensors="pt"
    )
    
    # Predict
    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=-1)[0]
    
    civil_prob = probs[0].item()
    criminal_prob = probs[1].item()
    
    if criminal_prob > civil_prob:
        return {
            "type": "Criminal",
            "confidence": criminal_prob,
            "civil_prob": civil_prob,
            "criminal_prob": criminal_prob
        }
    else:
        return {
            "type": "Civil",
            "confidence": civil_prob,
            "civil_prob": civil_prob,
            "criminal_prob": criminal_prob
        }


# === QUICK TEST ===
if __name__ == "__main__":
    # Test examples
    tests = [
        "He stabbed the victim with a knife and fled the scene.",
        "The tenant refused to pay rent for 6 months.",
        "The accused robbed the bank at gunpoint.",
        "She filed a suit for recovery of loan amount.",
    ]
    
    print("Legal Classifier - Quick Test\n")
    for text in tests:
        result = classify_legal_text(text)
        print(f"Text: {text[:50]}...")
        print(f"  → {result['type']} ({result['confidence']*100:.1f}%)\n")
