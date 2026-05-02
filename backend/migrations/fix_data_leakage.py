"""
Cleanup and migration script to fix data leakage.
Sets target=None for all patients sourced from predictions.
"""
import os
import sys

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import SessionLocal
from app.db import models

def fix_data_leakage():
    db = SessionLocal()
    try:
        print("Starting data cleanup...")
        
        # 1. Update patients with source='prediction' to have target=None
        leaked_count = db.query(models.Patient).filter(
            models.Patient.source == "prediction",
            models.Patient.target.isnot(None)
        ).count()
        
        db.query(models.Patient).filter(
            models.Patient.source == "prediction",
            models.Patient.target.isnot(None)
        ).update({"target": None, "trained": False}, synchronize_session=False)
        
        # 2. Delete old metrics (optional but recommended since they are invalid)
        db.query(models.ModelMetrics).delete()
        
        db.commit()
        print(f"Cleanup complete. Fixed {leaked_count} patients.")
        print("All old model metrics archived/deleted. Please re-train models to get valid accuracy measures.")
        
    except Exception as e:
        print(f"Error during cleanup: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_data_leakage()
