# todo_list
Todo List Project Summary
This Todo List project is a web-based task management application built with Flask, PostgreSQL, SQLAlchemy, HTML, CSS, and JavaScript. It allows users to register, log in, create tasks, set deadlines, view their tasks, mark tasks as completed, delete tasks, and log out.
The project uses Flask-Login for session-based authentication, so each user can only access their own tasks. User passwords are protected using Werkzeug password hashing, which means the real password is not saved in the database. Instead, only a secure password hash is stored.
The backend is connected to a PostgreSQL database with two main tables: users and tasks. The users table stores account information like username, email, and password hash. The tasks table stores task title, deadline, status, and the user ID connected to each task.
The frontend provides a simple interface where users can add tasks, view task deadlines, see task status such as Pending, Completed, or Overdue, and use a logout button. The app also includes small user-friendly features like popup messages after registration.
Overall, this project demonstrates basic full-stack web development, user authentication, database relationships, password security, and CRUD operations.










