import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>404</h1>
      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: "1.5rem",
          fontSize: "1.125rem",
        }}
      >
        Page not found
      </p>
      <Link to="/" className="btn btn-primary">
        Go home
      </Link>
    </div>
  );
}
