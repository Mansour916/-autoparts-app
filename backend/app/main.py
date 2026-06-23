from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.auth import router as auth_router
from app.routes.vehicles import router as vehicles_router
from app.routes.parts import router as parts_router
from app.routes.garage import router as garage_router
from app.routes.orders import router as orders_router
from app.routes.maintenance import router as maintenance_router
from app.routes.uploads import router as uploads_router
from app.routes.stores import router as stores_router
from app.routes.seller_stats import router as seller_stats_router
from app.routes.admin_sellers import router as admin_sellers_router
from app.routes.admin_dashboard import router as admin_dashboard_router

app = FastAPI(title="AutoParts API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth_router)
app.include_router(vehicles_router)
app.include_router(parts_router)
app.include_router(garage_router)
app.include_router(orders_router)
app.include_router(maintenance_router)
app.include_router(uploads_router)
app.include_router(stores_router)
app.include_router(seller_stats_router)
app.include_router(admin_sellers_router)

@app.get("/")
async def root():
    return {"message": "AutoParts API operationnelle"}