import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .mongodb import db
from bson import ObjectId

@api_view(["POST"])
def add_course(request):
    title = request.data.get("title")
    description = request.data.get("description")
    instructor = request.data.get("instructor")

    if not title or not description or not instructor:
        return Response({"error": "All fields are required"}, status=400)

    course = {
        "title": title,
        "description": description,
        "instructor": instructor
    }

    result = db.courses.insert_one(course)

    return Response({
        "message": "Course added successfully",
        "course_id": str(result.inserted_id)
    }, status=201)

@api_view(["POST"])
def add_lesson(request):
    course_id = request.data.get("course_id")
    title = request.data.get("title")
    description = request.data.get("description")
    video = request.FILES.get("video")
    pdf = request.FILES.get("pdf")

    if not course_id or not title:
        return Response({"error": "Course ID and title are required"}, status=400)

    lesson_folder = os.path.join(settings.MEDIA_ROOT, "lessons")
    os.makedirs(lesson_folder, exist_ok=True)

    video_path = None
    pdf_path = None

    if video:
        video_path = os.path.join(lesson_folder, video.name)
        with open(video_path, "wb+") as file:
            for chunk in video.chunks():
                file.write(chunk)

    if pdf:
        pdf_path = os.path.join(lesson_folder, pdf.name)
        with open(pdf_path, "wb+") as file:
            for chunk in pdf.chunks():
                file.write(chunk)

    lesson = {
        "course_id": course_id,
        "title": title,
        "description": description,
        "video": f"/media/lessons/{video.name}" if video else None,
        "pdf": f"/media/lessons/{pdf.name}" if pdf else None
    }

    db.lessons.insert_one(lesson)

    return Response({"message": "Lesson added successfully"}, status=201)
@api_view(["GET"])
def get_courses(request):
    courses = list(db.courses.find())

    for course in courses:
        course["_id"] = str(course["_id"])

    return Response(courses)


@api_view(["GET"])
def get_course(request, course_id):
    course = db.courses.find_one({"_id": ObjectId(course_id)})

    if not course:
        return Response({"error": "Course not found"}, status=404)

    course["_id"] = str(course["_id"])

    lessons = list(db.lessons.find({"course_id": course_id}))

    for lesson in lessons:
        lesson["_id"] = str(lesson["_id"])

    course["lessons"] = lessons

    return Response(course)