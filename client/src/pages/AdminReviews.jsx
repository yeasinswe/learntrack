import { useState } from 'react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(
    JSON.parse(localStorage.getItem('course_reviews')) || []
  );

  const deleteReview = (id) => {
    const updatedReviews = reviews.filter(
      (review) => review.id !== id
    );

    setReviews(updatedReviews);

    localStorage.setItem(
      'course_reviews',
      JSON.stringify(updatedReviews)
    );
  };

  return (
    <div>
      <h1 className="mb-4">Student Reviews</h1>

      <div className="table-responsive">
        <table className="table table-striped bg-white align-middle">
          <thead>
            <tr>
              <th>Student</th>
              <th>Course</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>{review.user}</td>
                  <td>{review.course}</td>
                  <td>{'⭐'.repeat(review.rating)}</td>
                  <td>{review.comment}</td>

                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        deleteReview(review.id)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-muted"
                >
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}