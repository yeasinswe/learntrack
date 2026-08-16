export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary-brand" role="status" style={{ width: 40, height: 40 }}>
        <span className="visually-hidden">{label}</span>
      </div>
      <p className="text-muted mt-2 mb-0">{label}</p>
    </div>
  );
}
