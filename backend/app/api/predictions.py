"""
Prognoz va model o'qitish API.
Addresses issues: data leakage, incorrect filtering, and incomplete metrics.
"""
import json
import logging
import numpy as np
import pandas as pd
from typing import Optional, List, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, not_

from ..db.database import get_db
from ..db import models
from ..schemas.schemas import (
    PredictRequest, PredictResponse,
    TrainRequest, TrainResponse,
    ModelMetricsResponse, PredictionHistoryResponse,
    DashboardStats
)
from ..core.security import get_current_active_user
from ..ml.model import heart_model, FEATURE_NAMES

# Logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ml", tags=["AI / ML"])

@router.post("/predict", response_model=PredictResponse)
def predict(
    request: PredictRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Predicts heart disease for a single patient and saves metadata.
    Prevents data leakage by setting target to None for prediction-sourced data.
    """
    if not heart_model.is_trained:
        raise HTTPException(
            status_code=400,
            detail="Model is not trained. Please call /ml/train first."
        )
    
    patient_data = request.model_dump()
    patient_data.pop("model_name", None)
    
    try:
        result = heart_model.predict(patient_data)
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
    
    # Save Prediction Record (History)
    prediction_record = models.Prediction(
        patient_id=None,
        prediction=result["prediction"],
        probability=result["probability"] / 100,
        risk_score=result["risk_score"],
        risk_label=result.get("risk_level"),
        model_used=result["model_used"],
        recommendations=json.dumps(result["recommendations"], ensure_ascii=False),
        feature_importance=json.dumps(result["top_features"], ensure_ascii=False),
        trained=False,
    )
    db.add(prediction_record)
    
    # Save Patient Record (Metadata) - SET TARGET TO NONE TO PREVENT LEAKAGE
    new_patient = models.Patient(
        **{k: patient_data[k] for k in FEATURE_NAMES},
        target=None,  # FIXED: DO NOT save model output as ground truth
        trained=False,
        source="prediction"
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    # Link prediction to patient
    prediction_record.patient_id = new_patient.id
    db.commit()
    db.refresh(prediction_record)
    
    result["prediction_id"] = prediction_record.id
    return result

@router.post("/train", response_model=TrainResponse)
def train_model(
    request: TrainRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Trains the model on real diagnoses only.
    Takes all patients where target is not None. 
    (Since predicts have target=None, only clinical/verified data is used).
    """
    # 1. Query all patients with valid ground truth target
    query = db.query(models.Patient).filter(
        models.Patient.target.isnot(None)
    )
    
    if request.use_only_untrained:
        query = query.filter(models.Patient.trained == False)
    
    patients = query.all()
    
    if len(patients) < 20:
        raise HTTPException(
            status_code=400,
            detail=f"At least 20 real data samples required for training. Found: {len(patients)}"
        )
    
    # Prepare data for training
    data = [{f: getattr(p, f) for f in FEATURE_NAMES + ['target']} for p in patients]
    df = pd.DataFrame(data)
    X = df[FEATURE_NAMES].values
    y = df['target'].values
    
    try:
        # Train model and get comprehensive metrics
        metrics = heart_model.train(X, y, request.model_name)
    except AssertionError as ae:
        raise HTTPException(status_code=400, detail=str(ae))
    except Exception as e:
        logger.error(f"Training error: {e}")
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")
    
    # Mark real data as trained
    for patient in patients:
        patient.trained = True
    
    # Update Model Metrics in DB
    db.query(models.ModelMetrics).filter(
        models.ModelMetrics.model_name == request.model_name,
        models.ModelMetrics.is_active == True
    ).update({"is_active": False})
    
    new_metrics = models.ModelMetrics(
        model_name=request.model_name,
        accuracy=metrics["accuracy"],
        test_accuracy=metrics["test_accuracy"],
        cv_mean=metrics["cv_mean"],
        cv_std=metrics["cv_std"],
        train_accuracy=metrics["train_accuracy"],
        overfitting_gap=metrics["overfitting_gap"],
        precision=metrics["precision"],
        recall=metrics["recall"],
        f1_score=metrics["f1_score"],
        roc_auc=metrics["roc_auc"],
        training_samples=len(patients),
        is_active=True,
    )
    db.add(new_metrics)
    db.commit()
    db.refresh(new_metrics)
    
    return TrainResponse(
        success=True,
        message=f"'{request.model_name}' trained successfully on {len(patients)} samples.",
        metrics=ModelMetricsResponse.model_validate(new_metrics),
        trained_samples=len(patients),
    )

@router.get("/history", response_model=List[PredictionHistoryResponse])
def get_prediction_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Returns prediction history.
    """
    predictions = db.query(models.Prediction)\
        .order_by(models.Prediction.created_at.desc())\
        .offset((page - 1) * page_size)\
        .limit(page_size)\
        .all()
    
    result = []
    for p in predictions:
        result.append(PredictionHistoryResponse(
            id=p.id,
            prediction=p.prediction,
            prediction_label="Kasal" if p.prediction == 1 else "Sog'lom",
            probability=p.probability * 100,
            risk_score=p.risk_score,
            risk_label=p.risk_label,
            model_used=p.model_used,
            created_at=p.created_at,
        ))
    return result

@router.get("/metrics", response_model=List[ModelMetricsResponse])
def get_model_metrics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Returns history of all model metrics."""
    return db.query(models.ModelMetrics).order_by(models.ModelMetrics.created_at.desc()).all()

@router.get("/compare")
def compare_models(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Compares the latest results of all models."""
    model_names = ["logistic_regression", "random_forest", "xgboost"]
    comparison = {}
    for name in model_names:
        metrics = db.query(models.ModelMetrics).filter(
            models.ModelMetrics.model_name == name
        ).order_by(models.ModelMetrics.created_at.desc()).first()
        
        if metrics:
            comparison[name] = {
                "accuracy": round(metrics.accuracy * 100, 2),
                "test_accuracy": round(metrics.test_accuracy * 100, 2),
                "overfitting_gap": round(metrics.overfitting_gap * 100, 2),
                "cv_mean": round(metrics.cv_mean * 100, 2),
                "is_active": metrics.is_active,
            }
        else:
            comparison[name] = None
    return comparison

# @router.get("/dashboard/stats", response_model=DashboardStats)
# def get_dashboard_stats(
#     db: Session = Depends(get_db),
#     current_user: models.User = Depends(get_current_active_user)
# ):
#     """General stats for dashboard."""
#     total = db.query(func.count(models.Patient.id)).scalar() or 0
#     sick = db.query(func.count(models.Patient.id)).filter(models.Patient.target == 1).scalar() or 0
#
#     active_model = db.query(models.ModelMetrics).filter(
#         models.ModelMetrics.is_active == True
#     ).order_by(models.ModelMetrics.created_at.desc()).first()
#
#     return DashboardStats(
#         total_patients=total,
#         sick_patients=sick,
#         healthy_patients=total - sick,
#         high_risk_count=db.query(func.count(models.Prediction.id)).filter(models.Prediction.risk_score >= 70).scalar() or 0,
#         medium_risk_count=db.query(func.count(models.Prediction.id)).filter(models.Prediction.risk_score.between(40, 69)).scalar() or 0,
#         low_risk_count=db.query(func.count(models.Prediction.id)).filter(models.Prediction.risk_score < 40).scalar() or 0,
#         total_predictions=db.query(func.count(models.Prediction.id)).scalar() or 0,
#         avg_age=round(db.query(func.avg(models.Patient.age)).scalar() or 0, 1),
#         avg_chol=round(db.query(func.avg(models.Patient.chol)).scalar() or 0, 1),
#         model_accuracy=round(active_model.test_accuracy * 100, 1) if active_model and active_model.test_accuracy else None,
#     )

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_active_user)
):
    """General stats for dashboard."""
    total = db.query(func.count(models.Patient.id)).scalar() or 0
    sick = db.query(func.count(models.Patient.id)).filter(models.Patient.target == 1).scalar() or 0

    # ✅ Jins va kasallik bo'yicha statistikalar (DYNAMIC)
    healthy_female = db.query(func.count(models.Patient.id)).filter(
        models.Patient.sex == 0,
        models.Patient.target == 0
    ).scalar() or 0

    healthy_male = db.query(func.count(models.Patient.id)).filter(
        models.Patient.sex == 1,
        models.Patient.target == 0
    ).scalar() or 0

    sick_female = db.query(func.count(models.Patient.id)).filter(
        models.Patient.sex == 0,
        models.Patient.target == 1
    ).scalar() or 0

    sick_male = db.query(func.count(models.Patient.id)).filter(
        models.Patient.sex == 1,
        models.Patient.target == 1
    ).scalar() or 0

    active_model = db.query(models.ModelMetrics).filter(
        models.ModelMetrics.is_active == True
    ).order_by(models.ModelMetrics.created_at.desc()).first()

    return DashboardStats(
        total_patients=total,
        sick_patients=sick,
        healthy_patients=total - sick,
        high_risk_count=db.query(func.count(models.Prediction.id)).filter(
            models.Prediction.risk_score >= 70).scalar() or 0,
        medium_risk_count=db.query(func.count(models.Prediction.id)).filter(
            models.Prediction.risk_score.between(40, 69)).scalar() or 0,
        low_risk_count=db.query(func.count(models.Prediction.id)).filter(
            models.Prediction.risk_score < 40).scalar() or 0,
        total_predictions=db.query(func.count(models.Prediction.id)).scalar() or 0,
        avg_age=round(db.query(func.avg(models.Patient.age)).scalar() or 0, 1),
        avg_chol=round(db.query(func.avg(models.Patient.chol)).scalar() or 0, 1),
        model_accuracy=round(active_model.test_accuracy * 100,
                             1) if active_model and active_model.test_accuracy else None,
        # ✅ YANGI MAYDONLAR
        healthy_female_patients=healthy_female,
        healthy_male_patients=healthy_male,
        sick_female_patients=sick_female,
        sick_male_patients=sick_male,
    )

@router.get("/feature-importance")
def get_feature_importance(
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Returns feature importances for the best active model.
    """
    if not heart_model.is_trained:
        raise HTTPException(status_code=400, detail="Model is not trained")
    
    from app.ml.model import FEATURE_NAMES, FEATURE_LABELS
    classifier = heart_model.classifier
    
    if hasattr(classifier, 'feature_importances_'):
        importances = classifier.feature_importances_
    elif hasattr(classifier, 'coef_'):
        importances = np.abs(classifier.coef_[0])
    else:
        raise HTTPException(status_code=400, detail="Model doesn't support feature importance")
    
    importances = importances / importances.sum()
    indices = np.argsort(importances)[::-1]
    
    return {
        "features": [
            {
                "name": FEATURE_LABELS.get(FEATURE_NAMES[i], FEATURE_NAMES[i]),
                "key": FEATURE_NAMES[i],
                "importance": round(float(importances[i]) * 100, 2),
            }
            for i in indices
        ],
        "model_name": heart_model.model_name,
    }
