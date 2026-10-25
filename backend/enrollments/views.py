from rest_framework.decorators import api_view
from rest_framework.response import Response
from bson import ObjectId
from .mongodb import db


@api_view(["POST"])
def enroll(request):
    email = request.data.get("email")
    course_id = request.data.get("course_id")

    if not email or not course_id:
        return Response({"error": "Email and course ID are required"}, status=400)

    user = db.users.find_one({"email": email})

    if not user:
        return Response({"error": "User not found"}, status=404)

    try:
        course = db.courses.find_one({"_id": ObjectId(course_id)})
    except:
        return Response({"error": "Invalid course ID"}, status=400)

    if not course:
        return Response({"error": "Course not found"}, status=404)

    existing = db.enrollments.find_one({
        "email": email,
        "course_id": course_id
    })

    if existing:
        return Response({"error": "Already enrolled"}, status=400)

    enrollment = {
        "email": email,
        "course_id": course_id
    }

    db.enrollments.insert_one(enrollment)

    return Response({
        "message": "Enrolled successfully"
    }, status=201)
@api_view(["GET"])
def get_my_courses(request):
    from users.authentication import get_current_user

    user = get_current_user(request)

    if not user:
        return Response(
            {"error": "Authentication required"},
            status=401
        )

    email = user["email"]

    enrollments = list(db.enrollments.find({"email": email}))

    courses = []

    for enrollment in enrollments:
        course = db.courses.find_one({
            "_id": ObjectId(enrollment["course_id"])
        })

        if course:
            course["_id"] = str(course["_id"])
            courses.append(course)

    return Response(courses)