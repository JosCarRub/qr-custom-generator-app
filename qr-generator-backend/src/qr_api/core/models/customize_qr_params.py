from pydantic import BaseModel, Field

class CustomizeQRParams(BaseModel):

    

    size: int = Field(
        default=10,
        title="Tamaño del Módulo del QR",
        description="Controla el tamaño de el continente del código QR.",
        gt=1,
        le=100
    )

    fill_color: str = Field(
        default="black",
        title="Color del QR",
        description="El color principal del código QR.",
        examples=["blue", "#FF5733"]
    )

    back_color: str = Field(
        default="white",
        title="Color de fondo",
        description="El color de fondo del código QR.",
        examples=["#FFFFFF"]
    )