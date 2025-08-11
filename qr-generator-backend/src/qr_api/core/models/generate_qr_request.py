from pydantic import BaseModel, Field

class GenerateQRRequest(BaseModel):

    text: str = Field(
        ...,
        title="URL",
        description="El texto o URL que se convertirá en un código QR.",
        min_length=1,
        max_length=500,
        examples=["https://www.josecarlosdev.com"]
    )