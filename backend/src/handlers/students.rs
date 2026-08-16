use axum::{extract::{Path, State}, http::StatusCode, Json};
use uuid::Uuid;

use crate::models::{NewStudentReq, Student};
use crate::models::AppState;

pub async fn list_students(State(state): State<AppState>) -> Result<Json<Vec<Student>>, (StatusCode, String)> {
    let students = sqlx::query_as::<_, Student>("SELECT id, name, grade, tutor_id, parent_id FROM students")
        .fetch_all(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(students))
}

pub async fn create_student(State(state): State<AppState>, Json(payload): Json<NewStudentReq>) -> Result<(StatusCode, Json<Student>), (StatusCode, String)> {
    let id = Uuid::new_v4();
    let student = sqlx::query_as::<_, Student>(
        "INSERT INTO students (id, name, grade, tutor_id, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, grade, tutor_id, parent_id",
    )
    .bind(id)
    .bind(&payload.name)
    .bind(&payload.grade)
    .bind(&payload.tutor_id)
    .bind(&payload.parent_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))?;

    Ok((StatusCode::CREATED, Json(student)))
}

pub async fn get_student(State(state): State<AppState>, Path(student_id): Path<Uuid>) -> Result<Json<Student>, (StatusCode, String)> {
    let student = sqlx::query_as::<_, Student>(
        "SELECT id, name, grade, tutor_id, parent_id FROM students WHERE id = $1",
    )
    .bind(student_id)
    .fetch_one(&state.db)
    .await
    .map_err(|_| (StatusCode::NOT_FOUND, "Student not found".to_string()))?;

    Ok(Json(student))
}

pub async fn delete_student(State(state): State<AppState>, Path(student_id): Path<Uuid>) -> Result<StatusCode, (StatusCode, String)> {
    sqlx::query("DELETE FROM students WHERE id = $1")
        .bind(student_id)
        .execute(&state.db)
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(StatusCode::NO_CONTENT)
}
