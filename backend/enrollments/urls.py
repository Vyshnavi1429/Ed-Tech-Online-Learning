from django.urls import path
from .views import enroll, get_my_courses

urlpatterns = [
    path("enroll/", enroll),
    path("my-courses/", get_my_courses),
]