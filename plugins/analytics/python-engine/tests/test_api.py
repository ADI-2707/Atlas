import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "db_status" in response.json()

def test_get_dashboard():
    response = client.get("/dashboard?org_id=org_default_123")
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "metrics" in data
    assert "totalRevenue" in data["overview"]
    assert "totalPayroll" in data["overview"]

def test_get_timeseries():
    response = client.get("/timeseries?org_id=org_default_123")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)

def test_get_anomalies():
    response = client.get("/anomalies?org_id=org_default_123")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_get_forecast():
    response = client.get("/forecast?org_id=org_default_123")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
