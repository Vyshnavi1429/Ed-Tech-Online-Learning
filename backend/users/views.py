from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from .mongodb import db
import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.contrib.auth.hashers import check_password
from .authentication import get_current_user

@api_view(["POST"])
def register(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if db.users.find_one({"email": email}):
        return Response({"error": "Email already exists"}, status=400)

    user = {
        "name": name,
        "email": email,
        "password": make_password(password)
    }

    db.users.insert_one(user)

    return Response({"message": "Registration successful"}, status=201)
@api_view(["POST"])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = db.users.find_one({"email": email})

    if not user:
        return Response({"error": "Invalid email or password"}, status=401)

    if not check_password(password, user["password"]):
        return Response({"error": "Invalid email or password"}, status=401)

    payload = {
        "user_id": str(user["_id"]),
        "email": user["email"],
        "exp": datetime.now(timezone.utc) + timedelta(hours=2)
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )

    return Response({
        "message": "Login successful",
        "access_token": token
    })
@api_view(["GET"])
def profile(request):
    user = get_current_user(request)

    if not user:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    return Response({
        "name": user["name"],
        "email": user["email"]
    })