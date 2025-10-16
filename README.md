# Bloom

![Landing Page](.screenshots/landing.png)

Bloom is a modern, open-source educational platform designed to help teachers create interactive quizzes and track student progress. Students can answer questions and receive real-time feedback on their learning performance.

## Live Build
Want to try out Bloom? A live build is available at [https://bloomlms.netlify.app](https://bloomlms.netlify.app) with Netlify for frontend and Render for backend. You can join an example class with an example lesson by creating a student account and joining with class code "RA5ONSOQ".

## Features

**For Teachers:**
- Create, edit, and delete classes, lessons and questions  
- View students’ progress and scores  
- Preview quizzes as students  

**For Students:**
- Participate in lessons and quizzes  
- Track personal progress and scores  
- View a summary report at the end of quizzes  

## Demo Screenshots

### Dashboard with list of classes
![Dashboard](.screenshots/dashboard.png)

### Class page showing users and lessons
![Class Page](.screenshots/class-page.png)

### Quiz page with a question and answer choices
![Quiz Page](.screenshots/quiz.png)

---

## Tech Stack

- **Frontend:** React, Tailwind CSS, Vite  
- **Backend:** Python, Strawberry GraphQL, SQLModel, SQLite  
- **Authentication:** Google OAuth  

---

## Installation

Follow these steps to set up Bloom locally:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/bloom.git
cd bloom
```

### 2. Set up the development server
```bash 
cd frontend
npm install                         # Install dependencies
npm run dev                         # Start the development server
```

### 3. Set up the backend
```bash
cd ../backend
python -m venv venv                 # (Optional) Create a virtual environment
source venv/bin/activate            # Activate the virtual environment (Linux/Mac)
pip install -r requirements.txt     # Install Python dependencies
python main.py                      # Start the backend server
```

## Contact

With any questions, suggestions, or feedback, out:

- **Email:** [samgreenfield0@gmail.com](mailto:samgreenfield0@gmail.com)  
- **Source Code:** [GitHub Repository](https://github.com/samgreenfield/Bloom)
