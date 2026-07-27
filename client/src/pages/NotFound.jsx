import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page-pad empty-state">
      <h1>404</h1>
      <p>This page has wandered off the path.</p>
      <Link to="/" className="btn btn--primary">Back to Home</Link>
    </div>
  );
}
