import pandas as pd
from sqlalchemy import text
from database import engine
from datetime import datetime, timedelta
import logging

logger = logging.getLogger("analytics_etl")

def run_etl_pipeline(org_id: str):
    logger.info(f"Starting ETL pipeline for org: {org_id}")
    
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
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=90)
        
        conn.execute(text("DELETE FROM analytics_metrics WHERE org_id = :org_id"), {"org_id": org_id})
        
        payroll_df = pd.read_sql(
            """
                SELECT period_start::date as timestamp, SUM(net_pay) as value 
                FROM atlas_hr.hr_payroll_records 
                WHERE organization_id = :org_id AND period_start >= :start_date
                GROUP BY period_start::date
            """,
            conn, params={"org_id": org_id, "start_date": start_date}
        )
        if not payroll_df.empty:
            payroll_df['metric_name'] = 'hr_payroll'
            payroll_df['org_id'] = org_id
            payroll_df.to_sql('analytics_metrics', conn, if_exists='append', index=False)

        leaves_df = pd.read_sql(
            """
                SELECT start_date::date as timestamp, COUNT(id) as value 
                FROM atlas_hr.hr_leave_requests 
                WHERE organization_id = :org_id AND status = 'APPROVED' AND start_date >= :start_date
                GROUP BY start_date::date
            """,
            conn, params={"org_id": org_id, "start_date": start_date}
        )
        if not leaves_df.empty:
            leaves_df['metric_name'] = 'hr_leaves'
            leaves_df['org_id'] = org_id
            leaves_df.to_sql('analytics_metrics', conn, if_exists='append', index=False)
            
        deals_df = pd.read_sql(
            """
                SELECT updated_at::date as timestamp, SUM(value) as value 
                FROM atlas_crm.crm_deals 
                WHERE organization_id = :org_id AND stage = 'CLOSED_WON' AND updated_at >= :start_date
                GROUP BY updated_at::date
            """,
            conn, params={"org_id": org_id, "start_date": start_date}
        )
        if not deals_df.empty:
            deals_df['metric_name'] = 'crm_deals_won'
            deals_df['org_id'] = org_id
            deals_df.to_sql('analytics_metrics', conn, if_exists='append', index=False)

        leads_df = pd.read_sql(
            """
                SELECT created_at::date as timestamp, COUNT(id) as value 
                FROM atlas_crm.crm_customers 
                WHERE organization_id = :org_id AND status IN ('LEAD', 'PROSPECT') AND created_at >= :start_date
                GROUP BY created_at::date
            """,
            conn, params={"org_id": org_id, "start_date": start_date}
        )
        if not leads_df.empty:
            leads_df['metric_name'] = 'crm_leads'
            leads_df['org_id'] = org_id
            leads_df.to_sql('analytics_metrics', conn, if_exists='append', index=False)
            
        stock_out_df = pd.read_sql(
            """
                SELECT created_at::date as timestamp, SUM(ABS(quantity)) as value 
                FROM atlas_inventory.inv_stock_transactions 
                WHERE organization_id = :org_id AND type IN ('ISSUE', 'TRANSFER') AND quantity < 0 AND created_at >= :start_date
                GROUP BY created_at::date
            """,
            conn, params={"org_id": org_id, "start_date": start_date}
        )
        if not stock_out_df.empty:
            stock_out_df['metric_name'] = 'inv_stock_out'
            stock_out_df['org_id'] = org_id
            stock_out_df.to_sql('analytics_metrics', conn, if_exists='append', index=False)

        valuation_df = pd.read_sql(
            """
                SELECT SUM(s.quantity * p.base_price) as value 
                FROM atlas_inventory.inv_stock s
                JOIN atlas_inventory.inv_products p ON s.product_id = p.id
                WHERE s.organization_id = :org_id
            """,
            conn, params={"org_id": org_id}
        )  # type: ignore
        if not valuation_df.empty and valuation_df.iloc[0]['value'] is not None:
            today = datetime.now().date()
            val = float(valuation_df.iloc[0]['value'])
            conn.execute(text("""
                INSERT INTO analytics_metrics (org_id, metric_name, timestamp, value)
                VALUES (:org_id, 'inv_valuation', :today, :val)
            """), {"org_id": org_id, "today": today, "val": val})

    logger.info("ETL pipeline completed successfully.")
