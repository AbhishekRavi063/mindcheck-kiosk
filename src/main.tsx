import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode } from "react";
import App from "./App.tsx";
import "./index.css";
import "./styles/globals.css";
import { logError, installGlobalErrorHandlers, getErrorLogs } from "./utils/errorLogger";

// Install global JS + promise error handlers
installGlobalErrorHandlers();

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MindCheck React Error:", error, errorInfo);
    const stack = errorInfo.componentStack
      ? errorInfo.componentStack.substring(0, 500)
      : "";
    this.setState({ errorInfo: stack });
    // Save to persistent error log
    logError("react", error.message, error.stack || "" + "\n" + stack);
  }

  render() {
    if (this.state.hasError) {
      const errMsg = this.state.error
        ? `${this.state.error.name}: ${this.state.error.message}`
        : "Unknown error";

      // Get recent logs for display
      const recentLogs = getErrorLogs().slice(0, 3);

      return (
        <div
          style={{
            padding: "20px",
            fontFamily: "sans-serif",
            color: "#8d654c",
            background: "#ece5de",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "#ffb757",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "12px",
              fontSize: "28px",
            }}
          >
            🧠
          </div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "18px" }}>MindCheck</h2>
          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "12px",
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            Something went wrong. Screenshot this for developer.
          </p>
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddc4af",
              borderRadius: "10px",
              padding: "12px",
              width: "100%",
              maxWidth: "340px",
              wordBreak: "break-all",
              fontSize: "11px",
              color: "#c00",
              textAlign: "left",
              marginBottom: "12px",
              maxHeight: "40vh",
              overflow: "auto",
              fontFamily: "monospace",
            }}
          >
            <strong>Error:</strong>
            <br />
            {errMsg}
            <br />
            <br />
            <strong>Stack:</strong>
            <br />
            {this.state.errorInfo || "N/A"}
            {recentLogs.length > 0 && (
              <>
                <br />
                <br />
                <strong>Recent Logs ({recentLogs.length}):</strong>
                <br />
                {recentLogs.map((log, i) => (
                  <div key={i} style={{ marginTop: "4px" }}>
                    [{log.timestamp.split("T")[1]?.split(".")[0] || ""}]{" "}
                    {log.type}: {log.message.substring(0, 100)}
                  </div>
                ))}
              </>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 32px",
              background: "#ffb757",
              color: "#fff",
              border: "none",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(255,183,87,0.3)",
            }}
          >
            Restart App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
