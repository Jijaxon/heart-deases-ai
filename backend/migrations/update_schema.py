"""
Update database schema by recreating the model_metrics table.
Since we've added several metrics columns, we need to refresh the table structure.
"""
import os
import sys

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.db.database import engine, create_tables
from app.db import models

def update_schema():
    print("Updating database schema...")
    with engine.connect() as conn:
        # Drop the table to force recreation with new columns
        # (safe because we cleared it in the previous migration anyway)
        print("Dropping model_metrics table...")
        conn.execute(text("DROP TABLE IF EXISTS model_metrics CASCADE;"))
        conn.commit()
    
    # Recreate all tables (this will recreate model_metrics with the new schema)
    print("Recreating tables with new schema...")
    create_tables()
    print("✅ Database schema updated successfully.")

if __name__ == "__main__":
    update_schema()
