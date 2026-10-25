# Ed-Tech Online Learning Platform

A full-stack web application designed to make online learning easier and more accessible for students. The platform allows users to create accounts, log in, explore courses, enroll in courses, and access learning materials, including lesson videos.

## 🚀 Features

- **User Authentication:** Register and log in using JWT-based authentication.
- **Course Listing:** Browse available courses.
- **Course Details:** View course information and lesson descriptions.
- **Video Learning:** Watch lesson videos directly on the platform through embedded YouTube videos.
- **Course Enrollment:** Enroll in courses and prevent duplicate enrollments.
- **My Learning:** View enrolled courses in one place.
- **Responsive UI:** User-friendly interface for online learning.

## 🛠️ Technologies Used

**Frontend**
- React.js
- Vite
- CSS

**Backend**
- Python
- Django REST Framework
- REST APIs
- JWT Authentication

**Database**
- MongoDB

**Tools**
- Git
- GitHub
- VS Code

## 🏗️ Project Architecture

The React frontend communicates with the Django REST API backend. The backend handles authentication, course information, and enrollment operations, while MongoDB stores application data.

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Vyshnavi1429/Ed-Tech-Online-Learning.git
cd Ed-Tech-Online-Learning
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables, including `DJANGO_SECRET_KEY` and any database credentials, before starting the application.

Run the Django development server:

```bash
python manage.py runserver
```

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173`.

## 🔗 Project Links

- **GitHub Repository:** https://github.com/Vyshnavi1429/Ed-Tech-Online-Learning
- **Live Demo:** Not deployed yet

## 🎯 Learning Outcomes

Through this project, I gained practical experience in full-stack web development, React frontend development, Django REST API integration, JWT-based authentication, database operations, and course enrollment workflows.

## 👩‍💻 Author

**Vyshnavi Mutyalapalli**

GitHub: https://github.com/Vyshnavi1429
