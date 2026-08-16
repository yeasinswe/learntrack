export default function Footer() {
  return (
    <footer className="footer-brand py-5 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="text-white brand-font">LearnTrack</h5>
            <p className="small">Learn without limits — practical, video-based courses with quizzes and certificates.</p>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="text-white">Quick Links</h6>
            <ul className="list-unstyled small">
              <li><a href="/courses" className="text-decoration-none text-light">Courses</a></li>
              <li><a href="/about" className="text-decoration-none text-light">About Us</a></li>
              <li><a href="/contact" className="text-decoration-none text-light">Contact</a></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="text-white">Contact</h6>
            <p className="small mb-0">support@learntrack.dev</p>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="small text-center mb-0">&copy; {new Date().getFullYear()} LearnTrack. All rights reserved.</p>
      </div>
    </footer>
  );
}
