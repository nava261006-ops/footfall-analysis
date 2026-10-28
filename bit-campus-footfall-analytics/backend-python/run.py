import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"[FastAPI Backend] Starting BIT Campus Footfall Analytics API on http://127.0.0.1:{port}")
    print(f"[FastAPI Backend] Swagger Docs: http://127.0.0.1:{port}/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=True)
