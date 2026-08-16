import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <div className="card shadow-sm h-100">

      <div
        style={{
          height: "220px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f6feb"
        }}
      >
        {course.banner_url ? (
          <img
            src={course.banner_url}
            alt={course.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
        ) : (
          <h4 className="text-white m-0">
            {course.category}
          </h4>
        )}
      </div>

      <div className="card-body d-flex flex-column">

        <span className="badge bg-light text-primary border mb-2">
          {course.category}
        </span>

        <h5>
          {course.title}
        </h5>

        <p className="text-muted flex-grow-1">
          {course.description?.slice(0, 100)}

          {course.description?.length > 100
            ? "..."
            : ""}
        </p>

        <div className="d-flex justify-content-between align-items-center mt-3">

          <strong>
            ${Number(course.price).toFixed(2)}
          </strong>

          <Link
            to={`/courses/${course.id}`}
            className="btn btn-primary"
          >
            View Details
          </Link>

        </div>

      </div>

    </div>
  );
}