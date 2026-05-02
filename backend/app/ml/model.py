import os
import joblib
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score
)
from xgboost import XGBClassifier

import warnings

warnings.filterwarnings('ignore')

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model storage directory
MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Feature names (must match DB columns)
FEATURE_NAMES = [
    "age", "sex", "cp", "trestbps", "chol",
    "fbs", "restecg", "thalach", "exang",
    "oldpeak", "slope", "ca", "thal"
]

# Feature labels for UI
FEATURE_LABELS = {
    "age": "Yosh",
    "sex": "Jins",
    "cp": "Ko'krak og'rig'i",
    "trestbps": "Qon bosimi",
    "chol": "Xolesterin",
    "fbs": "Qand darajasi",
    "restecg": "EKG natijasi",
    "thalach": "Yurak urishi",
    "exang": "Mashq angina",
    "oldpeak": "ST depressiya",
    "slope": "ST slope",
    "ca": "Tomirlar soni",
    "thal": "Thalassemia"
}

# ✅ QO'SHIMCHA: Qiymatlarni tushunarli ko'rsatish uchun mapping
VALUE_LABELS = {
    "sex": {0: "Ayol", 1: "Erkak"},
    "cp": {0: "Tipik angina", 1: "Atipik angina", 2: "Og'riq bo'lmagan", 3: "Asimptomatik"},
    "fbs": {0: "Yo'q", 1: "Ha"},
    "restecg": {0: "Normal", 1: "ST-T anormallik", 2: "Chap qorincha gipertrofiyasi"},
    "exang": {0: "Yo'q", 1: "Ha"},
    "slope": {0: "Yuqoriga ko'tariluvchi", 1: "Tekis", 2: "Pastga tushuvchi"},
    "thal": {0: "Anomalya", 1: "Normal", 2: "Tuzatilgan nuqson", 3: "Tug'ma"}
}


class HeartDiseaseModel:
    """
    Heart Disease Diagnosis System with focus on robust performance and no-leakage.
    Implements classification and smart recommendations.
    """

    def __init__(self):
        """Initializes the model wrapper with default settings."""
        self.classifier = None
        self.scaler = StandardScaler()
        self.model_name = "random_forest"
        self.is_trained = False
        self._load_models()

    def _convert_to_native(self, obj: Any) -> Any:
        """Converts NumPy types to native Python types for clean JSON serialization."""
        if obj is None:
            return None
        elif isinstance(obj, (np.bool_, bool)):
            return bool(obj)
        elif isinstance(obj, (np.integer, int)):
            return int(obj)
        elif isinstance(obj, (np.floating, float)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {key: self._convert_to_native(value) for key, value in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self._convert_to_native(item) for item in obj]
        return obj

    def train(
            self,
            X: np.ndarray,
            y: np.ndarray,
            model_name: str = "random_forest"
    ) -> Dict[str, Any]:
        """
        Trains the classification model using train-test split and cross-validation.

        Args:
            X: Feature matrix
            y: Target vector
            model_name: Name of the classification algorithm

        Returns:
            Dictionary of metrics including train/test accuracy and overfitting gap.
        """
        self.model_name = model_name

        # 1. Train/Test Split (test_size=0.2, stratified)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        # 2. Scaling
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # 3. Model Creation with Regularization
        self.classifier = self._create_classifier(model_name)

        # 4. Fit on training set only
        self.classifier.fit(X_train_scaled, y_train)

        # 5. Cross-Validation (on training data)
        cv_scores = cross_val_score(self.classifier, X_train_scaled, y_train, cv=5)
        cv_mean = float(np.mean(cv_scores))
        cv_std = float(np.std(cv_scores))

        # 6. Evaluation
        y_train_pred = self.classifier.predict(X_train_scaled)
        y_test_pred = self.classifier.predict(X_test_scaled)
        y_test_prob = self.classifier.predict_proba(X_test_scaled)[:, 1]

        train_acc = float(accuracy_score(y_train, y_train_pred))
        test_acc = float(accuracy_score(y_test, y_test_pred))
        overfitting_gap = float(train_acc - test_acc)

        # VALIDATION: Check for 100% test accuracy
        if test_acc >= 1.0:
            raise AssertionError(
                "Critical Error: Model has 100% test accuracy. This suggests data leakage or improper split.")

        # LOGGING: Overfitting warning
        if overfitting_gap > 0.10:
            logger.warning(
                f"Overfitting detected! Gap: {overfitting_gap:.4f}. Train Acc: {train_acc:.4f}, Test Acc: {test_acc:.4f}")

        metrics = {
            "accuracy": test_acc,
            "train_accuracy": train_acc,
            "test_accuracy": test_acc,
            "overfitting_gap": overfitting_gap,
            "cv_mean": cv_mean,
            "cv_std": cv_std,
            "precision": float(precision_score(y_test, y_test_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_test_pred, zero_division=0)),
            "f1_score": float(f1_score(y_test, y_test_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, y_test_prob)),
            "model_name": model_name
        }

        self.is_trained = True
        self._save_models(metrics)

        return metrics

    def _create_classifier(self, model_name: str) -> Any:
        """Creates a classifier with regularization parameters."""
        if model_name == "logistic_regression":
            return LogisticRegression(
                C=0.1,
                penalty='l2',
                solver='liblinear',
                random_state=42,
                max_iter=1000
            )
        elif model_name == "random_forest":
            return RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=10,
                min_samples_leaf=5,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1
            )
        elif model_name == "xgboost":
            return XGBClassifier(
                n_estimators=100,
                max_depth=4,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=1.0,
                random_state=42,
                eval_metric='logloss',
                use_label_encoder=False
            )
        else:
            raise ValueError(f"Unknown model: {model_name}")

    def predict(self, patient_data: Dict) -> Dict[str, Any]:
        """Provides a complete prediction for a single patient."""
        if not self.is_trained:
            raise ValueError("Model is not trained.")

        # ✅ LOGGING: Kiruvchi ma'lumotlarni tekshirish
        logger.info(f"Predicting with {self.model_name}")
        logger.info(f"cp value received: {patient_data.get('cp')}")
        logger.info(f"thal value received: {patient_data.get('thal')}")
        logger.info(f"slope value received: {patient_data.get('slope')}")

        X = np.array([[patient_data[f] for f in FEATURE_NAMES]])
        X_scaled = self.scaler.transform(X)

        prediction = int(self.classifier.predict(X_scaled)[0])
        probability = float(self.classifier.predict_proba(X_scaled)[0][1])
        risk_score = self._calculate_risk_score(probability, patient_data)

        top_features = self._get_feature_importance(X_scaled, patient_data)
        recommendations = self._generate_recommendations(patient_data, prediction, probability)

        result = {
            "prediction": prediction,
            "prediction_label": "Kasal" if prediction == 1 else "Sog'lom",
            "probability": round(probability * 100, 1),
            "risk_score": risk_score,
            "risk_level": self._get_risk_level(risk_score),
            "top_features": top_features,
            "recommendations": recommendations,
            "model_used": self.model_name,
        }

        # ✅ LOGGING: Chiqish natijasini tekshirish
        logger.info(f"Prediction result: {result['prediction_label']} ({result['probability']}%)")

        return self._convert_to_native(result)

    def _calculate_risk_score(self, probability: float, data: Dict) -> int:
        """Calculates a risk score (0-100) based on probability and clinical factors."""
        score = probability * 70
        if data.get("chol", 0) > 240: score += 8
        if data.get("trestbps", 0) > 140: score += 7
        if data.get("age", 0) > 55: score += 5
        if data.get("oldpeak", 0) > 2.0: score += 5
        if data.get("ca", 0) > 1: score += 5
        return min(100, max(0, int(score)))

    def _get_risk_level(self, risk_score: int) -> str:
        if risk_score >= 70:
            return "Yuqori"
        elif risk_score >= 40:
            return "O'rta"
        return "Past"

    def _get_feature_importance(self, X_scaled: np.ndarray, patient_data: Dict) -> List[Dict]:
        """Calculates contribution of each feature to the prediction."""
        if hasattr(self.classifier, 'feature_importances_'):
            importances = self.classifier.feature_importances_
        else:
            importances = np.abs(self.classifier.coef_[0])

        if importances.sum() > 0:
            importances = importances / importances.sum()

        top_indices = np.argsort(importances)[::-1][:5]
        result = []
        for idx in top_indices:
            feature = FEATURE_NAMES[idx]
            value = patient_data.get(feature, 0)
            importance = float(importances[idx]) * 100

            direction = self._get_feature_direction(feature, value)

            # ✅ QO'SHIMCHA: Qiymatni tushunarli ko'rsatish
            value_label = VALUE_LABELS.get(feature, {}).get(value, value)

            result.append({
                "feature": FEATURE_LABELS.get(feature, feature),
                "feature_key": feature,
                "importance": round(importance, 1),
                "value": float(value),
                "value_label": value_label,
                "direction": direction,
            })
        return result

    def _get_feature_direction(self, feature: str, value: float) -> str:
        """
        Determines if a feature increases or decreases risk.

        ✅ TO'G'RILANGAN:
        - cp=0 (Tipik angina) -> xavfli
        - cp=1,2,3 -> normal (xavfli emas)
        """
        risk_increasing = {
            "chol": lambda v: v > 200,
            "trestbps": lambda v: v > 130,
            "oldpeak": lambda v: v > 1.5,
            "age": lambda v: v > 50,
            "ca": lambda v: v > 0,
            "thalach": lambda v: v < 140,
            "exang": lambda v: v == 1,
            # ✅ TO'G'RILANGAN: faqat Tipik angina (0) xavfli
            "cp": lambda v: v == 0,  # 0 = Tipik angina
        }
        if feature in risk_increasing:
            return "xavfli" if risk_increasing[feature](value) else "normal"
        return "normal"

    def _generate_recommendations(self, data: Dict, prediction: int, probability: float) -> List[Dict]:
        """Generates clinical recommendations based on indicators."""
        recommendations = []

        # Xolesterin tavsiyasi
        chol = data.get("chol", 0)
        if chol > 200:
            recommendations.append({
                "category": "Ovqatlanish",
                "message": f"Xolesterin me'yordan yuqori ({chol} mg/dl). Yog'li taomlarni kamaytiring.",
                "priority": "high" if chol > 240 else "medium",
                "icon": "🥗"
            })

        # Qon bosimi tavsiyasi
        bp = data.get("trestbps", 0)
        if bp > 140:
            recommendations.append({
                "category": "Qon bosimi",
                "message": f"Qon bosimi yuqori ({bp} mm Hg). Tuzni kamaytiring va shifokor bilan maslahatlashing.",
                "priority": "high",
                "icon": "💊"
            })

        # Qand tavsiyasi
        if data.get("fbs", 0) == 1:
            recommendations.append({
                "category": "Qand darajasi",
                "message": "Och qoringa qand darajasi yuqori. Endokrinologga murojaat qiling.",
                "priority": "high",
                "icon": "🩸"
            })

        # ✅ TO'G'RILANGAN: Faqat yuqori xavfda shoshilinch tavsiya
        # prediction=1 (kasal) VA probability > 0.7 (70%)
        if prediction == 1 and probability > 0.7:
            recommendations.append({
                "category": "Shoshilinch",
                "message": "Yurak xavfi yuqori. Iltimos, tez orada kardiolog shifokoriga murojaat qiling.",
                "priority": "high",
                "icon": "🚨"
            })
        elif prediction == 1 and 0.4 < probability <= 0.7:
            recommendations.append({
                "category": "Ehtiyot",
                "message": "O'rtacha xavf aniqlandi. Kardiolog maslahati tavsiya etiladi.",
                "priority": "medium",
                "icon": "⚠️"
            })
        elif prediction == 0:
            # ✅ Sog'lom odam uchun tavsiya
            recommendations.append({
                "category": "Profilaktika",
                "message": "Sog'lom turmush tarzingizni davom ettiring. Yillik profilaktik tekshiruv tavsiya qilinadi.",
                "priority": "low",
                "icon": "✅"
            })

        return recommendations[:5]

    def _save_models(self, metrics: Optional[Dict] = None):
        """Saves models and optional metadata to disk."""
        joblib.dump(self.classifier, os.path.join(MODEL_DIR, f"{self.model_name}.pkl"))
        joblib.dump(self.scaler, os.path.join(MODEL_DIR, "scaler.pkl"))
        with open(os.path.join(MODEL_DIR, "active_model.txt"), "w") as f:
            f.write(self.model_name)
        if metrics:
            joblib.dump(metrics, os.path.join(MODEL_DIR, f"{self.model_name}_metadata.pkl"))

    def _load_models(self):
        """Loads models from disk if they exist."""
        try:
            active_model_file = os.path.join(MODEL_DIR, "active_model.txt")
            if os.path.exists(active_model_file):
                with open(active_model_file, "r") as f:
                    self.model_name = f.read().strip()

            clf_path = os.path.join(MODEL_DIR, f"{self.model_name}.pkl")
            if os.path.exists(clf_path):
                self.classifier = joblib.load(clf_path)
                scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
                if os.path.exists(scaler_path):
                    self.scaler = joblib.load(scaler_path)
                self.is_trained = True
                logger.info(f"Model loaded: {self.model_name}")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.is_trained = False


# Global instance
heart_model = HeartDiseaseModel()