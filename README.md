# Business Optimization AI

## Project Overview
A full-stack AI-driven business optimization platform. This application leverages Machine Learning to provide explainable financial projections and risk assessments based on user capital and selected market indicators. 

## Technical Architecture
* **Frontend:** Next.js, React, Tailwind CSS
* **Backend:** FastAPI, Python, SQLite
* **Machine Learning:** Scikit-Learn (Linear Regression), NumPy
* **External APIs:** Integration with financial data providers for real-time stock pricing
* **Deployment:** Vercel (Frontend) & Render (Backend)

## Live Production Demo
* **Frontend Dashboard (Vercel):** [https://business-optimization-ai.vercel.app/](https://business-optimization-ai.vercel.app/)
* **Backend API Docs (Render):** [https://business-optimization-ai.onrender.com/docs](https://business-optimization-ai.onrender.com/docs)
> **Note:** The backend is hosted on a free-tier Render instance. It may enter a sleep state after a period of inactivity. Upon the first request, the server might take 1-2 minutes to spin up.

## Local Installation & Testing

1. **Backend Setup:**
   * Navigate to the `backend` directory.
   * Activate your virtual environment: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows).
   * Install dependencies: `pip install -r requirements.txt`.
   * Start the API server: `uvicorn main:app --reload`.

2. **Frontend Setup:**
   * Navigate to the `frontend` directory.
   * Install node modules: `npm install`.
   * Launch the dashboard: `npm run dev`.
   * Access the application at `http://localhost:3000`.

## Cloud Deployment Strategy (CI/CD Integrated)
* **API / Backend:** The FastAPI application is deployed on **Render** with optimized CORS middleware allowing secure communication with the frontend. Environment relies on `requirements.txt` for clean dependency management without shipping local virtual environments.
* **Client / Frontend:** The Next.js application is deployed on **Vercel**, fully integrating CI/CD pipelines directly from the GitHub repository, utilizing custom configuration to bypass strict build checks for seamless deployment.
