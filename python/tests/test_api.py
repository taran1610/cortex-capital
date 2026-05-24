from unittest.mock import patch

from fastapi.testclient import TestClient

from api.app import app


def test_health():
    c = TestClient(app)
    r = c.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_run_kernel_smoke():
    with patch("api.app.run") as run:
        run.return_value = {"status": "ok", "symbol": "SPY", "signal": "HOLD"}
        c = TestClient(app)
        r = c.get("/run/kernel", params={"symbol": "SPY", "period": "3mo"})
        assert r.status_code == 200
        assert r.json()["result"]["status"] == "ok"
        run.assert_called_once()


def test_run_kernel_invalid_execution():
    c = TestClient(app)
    r = c.get("/run/kernel", params={"execution": "nope"})
    assert r.status_code == 400


def test_swarm_run_mocked_state():
    fake_state = {
        "ticker": "SPY",
        "log": [],
        "recommendation": "HOLD",
    }

    with patch("graph.workflow.run_swarm", return_value=fake_state, create=True):
        c = TestClient(app)
        r = c.post("/swarm/run", json={"ticker": "SPY"})
        assert r.status_code == 200
        body = r.json()
        assert body["ok"] is True
        assert body["ticker"] == "SPY"
        assert "state" in body
