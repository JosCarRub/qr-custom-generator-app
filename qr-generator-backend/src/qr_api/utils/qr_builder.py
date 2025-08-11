from PIL import Image, ImageColor
import qrcode
import qrcode.constants
from qrcode.main import QRCode
import io
from typing import Optional

def _format_color(color: str) -> str:
    color = color.strip()
    if color.startswith('#'):
        return color
    try:
        ImageColor.getrgb(color)
        return color
    except ValueError:
        return f"#{color}"



def generate_qr_image_bytes(
    text: str,
    logo_bytes: Optional[bytes] = None,
    size: int = 10,
    fill_color: str = "black",
    back_color: str = "white",
) -> bytes:
    
    formatted_fill_color = _format_color(fill_color)
    formatted_back_color = _format_color(back_color)
    

    if logo_bytes:
        error_correction_level = qrcode.constants.ERROR_CORRECT_H
    else:
        error_correction_level = qrcode.constants.ERROR_CORRECT_M

    qr = QRCode(
        version=1,
        error_correction=error_correction_level,
        box_size=size,
        border=4
    )

    qr.add_data(text)
    qr.make(fit=True)


    img = qr.make_image(
        fill_color=formatted_fill_color,
        back_color=formatted_back_color
        ).convert('RGBA')
    
    if logo_bytes:
        
        logo_img_buffer = io.BytesIO(logo_bytes)
        
        try:
            logo_img = Image.open(logo_img_buffer)
        except Exception as e:
            print(f"Error al abrir el logo, se ignora. Error: {e}")
            logo_img = None 

        if logo_img:
            qr_width, qr_height = img.size
            logo_max_size = qr_height // 3.3
            
            logo_img.thumbnail((logo_max_size, logo_max_size))

            logo_pos = ((qr_width - logo_img.width) // 2, (qr_height - logo_img.height) // 2)

            if logo_img.mode == 'RGBA':
                mask = logo_img.split()[3]
            else:
                mask = Image.new('L', logo_img.size, 255)

            img.paste(logo_img, logo_pos, mask=mask)

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return buffer.getvalue()