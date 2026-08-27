"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Activity, AlertCircle, Lock } from "lucide-react";

export default function Dashboard() {
  // --- AUTH STATES ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- FORM STATES ---
  const [name, setName] = useState("");
  const [riskLevel, setRiskLevel] = useState("Moderate");
  const [capital, setCapital] = useState("");
  const [symbol, setSymbol] = useState("AAPL");
  
  // --- APP STATES ---
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<{ symbol: string, current_price: number, currency: string } | null>(null);
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsAuthenticated(true);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save User to DB (Python Backend)
      //LOCAL await fetch("http://localhost:8000/users/", {
      await fetch("https://business-optimization-ai.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, risk_level: riskLevel, capital: Number(capital) })
      });

      // 2. Fetch Stock Data
      // LOCAL const stockRes = await fetch(`http://localhost:8000/price/${symbol}`);
      const stockRes = await fetch(`https://business-optimization-ai.onrender.com/price/${symbol}`);
      if (stockRes.ok) {
        const stockJson = await stockRes.json();
        setStockData(stockJson);
      }

      // 3. Fetch Machine Learning Predictions & Explainable AI
      // LOCAL const mlRes = await fetch("http://localhost:8000/predict/", {
      const mlRes = await fetch("https://business-optimization-ai.onrender.com/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capital: Number(capital), risk_level: riskLevel })
      });
      
      if (mlRes.ok) {
        const mlJson = await mlRes.json();
        setPredictionData(mlJson.predictions);
        setAiExplanation(mlJson.explanation);
      }
      
      setAnalyzed(true);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Could not connect to the backend. Is Python running?");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-900">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome Back</h1>
            <p className="text-slate-500 text-sm mt-1">Please sign in to access the platform</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <input 
                type="email" required placeholder="admin@finance.com"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" required placeholder="••••••••"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-medium py-2 rounded-md hover:bg-slate-800 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-blue-600" />
            AI Financial Support Platform
          </h1>
          <p className="text-slate-500 mt-2">Intelligent portfolio projections & live market data.</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-slate-500 hover:text-slate-800 transition underline"
        >
          Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUT FORM */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-xl font-semibold mb-4">Investment Parameters</h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Investor Name</label>
              <input 
                type="text" required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={name} onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Initial Capital ($)</label>
              <input 
                type="number" required min="100"
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={capital} onChange={(e) => setCapital(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Risk Tolerance</label>
              <select 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}
              >
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Target Stock Symbol (e.g., AAPL, TSLA)</label>
              <input 
                type="text" required
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition flex justify-center items-center gap-2"
            >
              {loading ? "Analyzing..." : <><TrendingUp size={18} /> Generate ML Projection</>}
            </button>
          </form>
        </div>

        {/* RESULTS DASHBOARD */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Live Asset Price ({symbol})</p>
                  <p className="text-2xl font-bold">
                    {stockData ? `$${stockData.current_price.toFixed(2)} ${stockData.currency}` : "---"}
                  </p>
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">AI Recommendation & Logic</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {analyzed ? (riskLevel === "Aggressive" ? "High Allocation" : "Diversify Core") : "Pending Analysis"}
                  </p>
                  {analyzed && (
                    <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>AI Reasoning:</strong> {aiExplanation}
                    </p>
                  )}
                </div>
             </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">5-Year ML Capital Projection</h3>
              {analyzed && <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">scikit-learn Model</span>}
            </div>
            {analyzed ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <Line type="monotone" dataKey="balance" stroke="#2563eb" strokeWidth={3} />
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(val) => `$${val}`} />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 w-full flex items-center justify-center bg-slate-50 border border-dashed rounded-lg">
                <p className="text-slate-400">Fill the parameters to generate the predictive ML model.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}