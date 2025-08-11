from fastapi.testclient import TestClient
from qr_api.core.constants import APP_PREFIX,QR_GENERATOR
import imghdr

BASE_URL = f"{APP_PREFIX}{QR_GENERATOR}"

def test_generate_basic_qr_success(test_client: TestClient):
    """
    debe devolver un 200 y un PNG válido
    """
    # cuerpo de la petición que enviamos
    request_body = {"text": "https://www.josecarlosdev.com"}



    # el client para la petición
    response = test_client.post(BASE_URL, json=request_body)

    # asserts
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    
    # es realmente un PNG?
    image_type = imghdr.what(None, h=response.content)
    assert image_type == "png"

def test_generate_basic_qr_missing_text(test_client: TestClient):
    """
    testea que la API devuelve un 422 si falta text
    """

    request_body = {}

    response = test_client.post(BASE_URL, json=request_body)

    assert response.status_code == 422