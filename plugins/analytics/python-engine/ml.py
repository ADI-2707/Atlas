import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from statsmodels.tsa.arima.model import ARIMA
import warnings
from statsmodels.tools.sm_exceptions import ConvergenceWarning
warnings.simplefilter('ignore', ConvergenceWarning)

def detect_anomalies(df: pd.DataFrame, metric_name: str, contamination: float = 0.05):
    """
    Detects anomalies in time series data using Isolation Forest.
    Expects df to have 'timestamp' and 'value' columns.
    """
    metric_df = df[df['metric_name'] == metric_name].copy()
    if metric_df.empty or len(metric_df) < 10:
        return []
    
    metric_df = metric_df.sort_values(by='timestamp')  # type: ignore
    
    X = metric_df[['value']].values
    
    model = IsolationForest(contamination=contamination, random_state=42)
    metric_df['anomaly'] = model.fit_predict(X)
    
    anomalies = metric_df[metric_df['anomaly'] == -1]
    
    result = []
    for _, row in anomalies.iterrows():
        median_val = metric_df['value'].median()
        is_spike = row['value'] > median_val
        
        result.append({
            "metric": metric_name,
            "type": "spike" if is_spike else "drop",
            "severity": "high" if abs(row['value'] - median_val) > metric_df['value'].std() * 2 else "medium",
            "timestamp": row['timestamp'].isoformat(),
            "value": row['value']
        })
        
    return result

def forecast_metric(df: pd.DataFrame, metric_name: str, periods: int = 7):
    """
    Forecasts future values for a metric using ARIMA.
    Expects df to have 'timestamp' and 'value' columns.
    """
    metric_df = df[df['metric_name'] == metric_name].copy()
    if metric_df.empty or len(metric_df) < 10:
        return []

    metric_df = metric_df.sort_values(by='timestamp')  # type: ignore
    metric_df.set_index('timestamp', inplace=True)
    
    try:
        model = ARIMA(metric_df['value'], order=(1, 1, 1))
        model_fit = model.fit()
        
        forecast = model_fit.forecast(steps=periods)
        
        result = []
        last_date = metric_df.index[-1]
        for i, val in enumerate(forecast):
            next_date = last_date + pd.Timedelta(days=i+1)
            result.append({
                "metric": metric_name,
                "timestamp": next_date.isoformat(),
                "forecast_value": round(val, 2)
            })
            
        return result
    except Exception as e:
        print(f"Forecasting error: {e}")
        return []
