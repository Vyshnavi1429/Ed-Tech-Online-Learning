from django.urls import path
from .views import add_course, add_lesson, get_courses
from .views import add_course, add_lesson, get_courses, get_course
urlpatterns = [
    path("add/", add_course),
    path("add-lesson/", add_lesson),
    path("", get_courses),
    path("<str:course_id>/", get_course),
]