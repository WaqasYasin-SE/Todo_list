from flask import Flask, request, jsonify, render_template
from datetime import datetime
from flask_login import LoginManager, current_user

from database import db
from models import Task, User
from auth import auth


app = Flask(__name__)

app.config["SECRET_KEY"] = "ndmdvdwrewrwenre43"

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "postgresql://postgres:8729@localhost/todo_db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth.login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


app.register_blueprint(auth)


@app.route("/")
def home():
    if not current_user.is_authenticated:
        return render_template("login.html")

    return render_template("index.html")


@app.route("/tasks", methods=["POST"])
def add_task():
    if not current_user.is_authenticated:
        return jsonify({
            "message": "Please login first"
        }), 401

    data = request.json

    if not data or "title" not in data:
        return jsonify({
            "error": "Title required"
        }), 400

    deadline = None

    if data.get("deadline"):
        deadline = datetime.fromisoformat(data["deadline"])

    task = Task(
        title=data["title"],
        deadline=deadline,
        status=data.get("status", "Pending"),
        user_id=current_user.id
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        "message": "Task created"
    }), 201


@app.route("/tasks", methods=["GET"])
def get_tasks():
    if not current_user.is_authenticated:
        return jsonify({
            "message": "Please login first"
        }), 401

    tasks = Task.query.filter_by(
        user_id=current_user.id
    ).all()

    return jsonify([
        {
            "id": task.id,
            "title": task.title,
            "deadline": task.deadline.isoformat() if task.deadline else None,
            "status": task.status
        }
        for task in tasks
    ])


@app.route("/tasks/<int:id>", methods=["PATCH"])
def update_task(id):
    if not current_user.is_authenticated:
        return jsonify({
            "message": "Please login first"
        }), 401

    task = Task.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not task:
        return jsonify({
            "error": "Task not found"
        }), 404

    data = request.json

    if "title" in data:
        task.title = data["title"]

    if "deadline" in data:
        task.deadline = datetime.fromisoformat(data["deadline"]) if data["deadline"] else None

    if "status" in data:
        task.status = data["status"]

    db.session.commit()

    return jsonify({
        "message": "Task updated"
    })


@app.route("/tasks/<int:id>", methods=["DELETE"])
def delete_task(id):
    if not current_user.is_authenticated:
        return jsonify({
            "message": "Please login first"
        }), 401

    task = Task.query.filter_by(
        id=id,
        user_id=current_user.id
    ).first()

    if not task:
        return jsonify({
            "error": "Task not found"
        }), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({
        "message": "Task deleted"
    })


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)