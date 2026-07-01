import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import text
from database import engine

def generate_mock_data():
    print("Generating mock data...")
    dates = pd.date_range(start=datetime.now() - timedelta(days=90), periods=90, freq='D')
    
    np.random.seed(42)
    traffic = 1000 + np.arange(90) * 5 + np.random.normal(0, 50, 90)
    traffic[20] = 3000  
    traffic[50] = 200   
    
    df = pd.DataFrame({
        'timestamp': dates,
        'metric_name': 'traffic',
        'value': traffic,
        'org_id': 'org_default_123'
    })
    
    revenue = 5000 + np.arange(90) * 20 + np.random.normal(0, 200, 90)
    revenue[70] = 12000
    
    df_revenue = pd.DataFrame({
        'timestamp': dates,
        'metric_name': 'revenue',
        'value': revenue,
        'org_id': 'org_default_123'
    })
    
    df_final = pd.concat([df, df_revenue], ignore_index=True)
    return df_final

def seed_database():
    df = generate_mock_data()
    
    with engine.begin() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS analytics_metrics (
                id SERIAL PRIMARY KEY,
                org_id VARCHAR(50) NOT NULL,
                metric_name VARCHAR(50) NOT NULL,
                timestamp TIMESTAMP NOT NULL,
                value FLOAT NOT NULL
            );
        """))
        
        conn.execute(text("DELETE FROM analytics_metrics WHERE org_id = 'org_default_123';"))
        
    print("Inserting data into PostgreSQL...")
    df.to_sql('analytics_metrics', engine, if_exists='append', index=False)
    print("Done seeding database!")

if __name__ == "__main__":
    seed_database()
