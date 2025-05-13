import requests
import google.auth
from google.auth.transport.requests import Request

PROJECT_ID = 'emi-dev-env-2'
LOCATION = 'us-central1'
CLEANROOM_ID = 'cmm-cleanroom'

credentials, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
auth_req = Request()
credentials.refresh(auth_req)
headers = {
    "Authorization": f"Bearer {credentials.token}",
    "Content-Type": "application/json"
}

url = f"https://datacleanroom.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/cleanrooms?cleanroomId={CLEANROOM_ID}"

body = {
    "displayName": "CMM Clean Room",
    "partnerConfig": {
        "partners": [
            {
                "displayName": "Meta",
                "datasets": [f"projects/{PROJECT_ID}/datasets/meta_publisher_cmm_data"]
            },
            {
                "displayName": "Google",
                "datasets": [f"projects/{PROJECT_ID}/datasets/google_publisher_cmm_data"]
            },
            {
                "displayName": "TV",
                "datasets": [f"projects/{PROJECT_ID}/datasets/tv_publisher_cmm_data"]
            }
        ]
    }
}

response = requests.post(url, headers=headers, json=body)
print(response.status_code, response.json())
