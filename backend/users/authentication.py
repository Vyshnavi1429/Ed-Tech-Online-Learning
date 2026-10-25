import jwt
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from .mongodb import db


def get_current_user(request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    try:
        token = auth_header.split(" ")[1]

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=["HS256"]
        )

        user = db.users.find_one({"_id": __import__("bson").ObjectId(payload["user_id"])})

        return user

    except:
        return None