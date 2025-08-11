from qr_api.utils import qr_builder
from typing import Optional

def create_custom_qr_code(
    text: str,
    size: int,
    fill_color: str,
    back_color: str,
    logo_bytes: Optional[bytes] = None
) -> bytes:

    qr_image_bytes = qr_builder.generate_qr_image_bytes(
        text=text,
        size=size,
        fill_color=fill_color,
        back_color=back_color,
        logo_bytes=logo_bytes
    )
    return qr_image_bytes