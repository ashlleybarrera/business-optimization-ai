from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import requests
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(title="AI Financial Support API")

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. DATABASE CONFIGURATION (SQL) ---
def init_db():
    conn = sqlite3.connect("finance.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            capital REAL NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            symbol TEXT NOT NULL,
            investment_suggestion REAL NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- 2. DATA MODELS ---
class User(BaseModel):
    name: str
    risk_level: str
    capital: float

class PredictionRequest(BaseModel):
    capital: float
    risk_level: str

# --- 3. CRUD ROUTES ---
@app.post("/users/")
def create_user(user: User):
    conn = sqlite3.connect("finance.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (name, risk_level, capital) VALUES (?, ?, ?)", 
                   (user.name, user.risk_level, user.capital))
    conn.commit()
    new_user_id = cursor.lastrowid
    conn.close()
    return {"message": "User created successfully", "id": new_user_id}

@app.get("/price/{symbol}")
def get_stock_price(symbol: str):
    headers = {'User-Agent': 'Mozilla/5.0'}
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        current_price = data['chart']['result'][0]['meta']['regularMarketPrice']
        currency = data['chart']['result'][0]['meta']['currency']
        return {"symbol": symbol.upper(), "current_price": current_price, "currency": currency}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch price for {symbol}. Error: {str(e)}")

# --- 4. MACHINE LEARNING ROUTE ---
@app.post("/predict/")
def predict_portfolio(req: PredictionRequest):
    # 1. Generate synthetic historical data (past 5 years) based on risk tolerance
    X_train = np.array([[1], [2], [3], [4], [5]]) 
    
    if req.risk_level == "Conservative":
        y_train = np.array([req.capital * (1.03 ** i) for i in range(1, 6)])
    elif req.risk_level == "Moderate":
        y_train = np.array([req.capital * (1.08 ** i) for i in range(1, 6)])
    else: # Aggressive
        y_train = np.array([req.capital * (1.15 ** i) for i in range(1, 6)])

    # 2. Train a Linear Regression model on the fly
    model = LinearRegression()
    model.fit(X_train, y_train)

    # 3. Predict the next 5 years (years 6 to 10)
    X_predict = np.array([[6], [7], [8], [9], [10]])
    predictions = model.predict(X_predict)

    # 4. Format the output
    current_year = 2026
    results = []
    for i, pred in enumerate(predictions):
        results.append({
            "year": str(current_year + i),
            "balance": round(pred, 2)
        })

    return {
        "predictions": results,
        "algorithm": "Linear Regression (scikit-learn)",
        "explanation": f"Model trained on 5-year simulated historical data for a {req.risk_level} profile."
    }