from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    secret_key: str
    api_vin_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()