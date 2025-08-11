from fastapi import APIRouter, Response, Depends, File, Form, UploadFile
from typing import Optional
from qr_api.core.constants import APP_PREFIX, QR_CUSTOMIZE
from qr_api.core.models.generate_qr_request import GenerateQRRequest
from qr_api.core.models.customize_qr_params import CustomizeQRParams
from qr_api.services import qr_customize_service



router = APIRouter(
    prefix=APP_PREFIX,
    tags=["Generador personalizado de QR"],
)

@router.post(QR_CUSTOMIZE, summary="Genera un código QR personalizado")
async def generate_custom_qr(
    params: CustomizeQRParams=Depends(),
    text: str = Form(
        ...,
        min_length=1,
        max_length=500,
        description="URL a codificar"
    ),
    logo: Optional[UploadFile] = File(None, description="Imagen para incluir en el QR")
    ):

    logo_bytes = None

    if logo:
        logo_bytes = await logo.read()

    qr_image_bytes = qr_customize_service.create_custom_qr_code(
        text=text,
        size=params.size,
        fill_color=params.fill_color,
        back_color=params.back_color,
        logo_bytes= logo_bytes
    )

    return Response(
        content=qr_image_bytes,
        media_type="image/png",
        status_code=200
    )

