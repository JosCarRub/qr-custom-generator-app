# En: tests/test_qr_customize.py
from fastapi.testclient import TestClient
from qr_api.core.constants import APP_PREFIX, QR_CUSTOMIZE
import imghdr
from pathlib import Path

BASE_URL = f"{APP_PREFIX}{QR_CUSTOMIZE}"


LOGO_PATH = Path(__file__).parent / "assets" / "test_logo.png"


def test_customize_qr_with_logo_success(test_client: TestClient):
    
    form_data = {"text": "Logo con Pytest"}
    query_params = {"size": 20, "fill_color": "maroon"}

    with open(LOGO_PATH, "rb") as logo_file:
        files_to_upload = {
            'logo': ('test_logo.png', logo_file, 'image/png')
        }


        response = test_client.post(
            BASE_URL,
            data=form_data,
            params=query_params,
            files=files_to_upload
        )

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert imghdr.what(None, h=response.content) == "png"


def test_customize_qr_with_invalid_file_as_logo(test_client: TestClient):
    """
    testea que la API maneja correctamente un archivo que no es una imagen.
    Debe ignorar el logo inválido y devolver un 200 OK con el QR base.
    """
    # --- 1. Arrange ---
    form_data = {"text": "Logo inválido"}
    
    fake_text_file = ("not_a_logo.txt", b"esto no es una imagen", "text/plain")

    # --- 2. Act ---
    response = test_client.post(
        BASE_URL,
        data=form_data,
        files={'logo': fake_text_file}
    )

   
    assert response.status_code == 200
    assert imghdr.what(None, h=response.content) == "png"


def test_customize_qr_without_logo_still_works(test_client: TestClient):
    """
    testea que el endpoint sigue funcionando
    si no se proporciona ningún logo
    """

    form_data = {"text": "Sin logo"}
    query_params = {"fill_color": "green"}


    response = test_client.post(BASE_URL, data=form_data, params=query_params)

    # --- 3. Assert ---
    assert response.status_code == 200
    assert imghdr.what(None, h=response.content) == "png"