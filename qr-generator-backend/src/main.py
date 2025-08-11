from fastapi import FastAPI
from qr_api.routers import qr_customize
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Generador de QRs",
    description="API que permite generar códigos QR personalizados",
    version="BETA",
    contact= {
        "name": "José Carlos",
        "email": "contacto@josecarlosdev.com"
    },
)

origins = [
    "http://localhost:4321",
    "https://qr-custom-generator.vercel.app/"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,           
    allow_methods=["POST"],              
    allow_headers=["*"],           
)


app.include_router(qr_customize.router)

@app.get("/health_qr_check", tags=["Health Check"])
def health_endpoint():
    return {"status": "ok", "message": "¡Bienvenido a la API Generadora de QR!"} 