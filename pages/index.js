import { useState } from "react";

export default function Home() {
  const [inputLinks, setInputLinks] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Generate short code (7 chars alphanumeric)
  function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async function handleGenerate() {
    setError("");
    setResults([]);
    setLoading(true);
    try {
      // Pisah input berdasarkan baris, maksimal 100
      let urls = inputLinks
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
        .slice(0, 100);

      if (urls.length === 0) {
        setError("Please enter at least one valid URL.");
        setLoading(false);
        return;
      }

      let output = [];

      for (const url of urls) {
        // Validasi sederhana URL
        try {
          new URL(url);
        } catch {
          output.push({ url, error: "Invalid URL" });
          continue;
        }

        // Generate unique code, cek ke API (loop sampai dapat code unik)
        let code = generateCode();
        // Cek ketersediaan code via API
        let tries = 0;
        while (tries < 5) {
          const res = await fetch(`/api/${code}`);
          if (res.status === 404) break; // code belum ada
          code = generateCode();
          tries++;
        }
        if (tries === 5) {
          output.push({ url, error: "Failed to generate unique code" });
          continue;
        }

        // Simpan mapping via API
        const resAdd = await fetch("/api/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, url }),
        });

        if (resAdd.ok) {
          output.push({ url, code, shortlink: `${window.location.origin}/${code}` });
        } else {
          output.push({ url, error: "Failed to save shortlink" });
        }
      }
      setResults(output);
    } catch (e) {
      setError("An error occurred. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Safelink Generator</h1>
      <textarea
        placeholder="Enter up to 100 URLs, each on new line"
        rows={10}
        style={{ width: "100%", fontSize: 16, padding: 10, marginBottom: 10 }}
        value={inputLinks}
        onChange={(e) => setInputLinks(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: 5,
        }}
      >
        {loading ? "Generating..." : "Generate Shortlinks"}
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h2>Results</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {results.map(({ url, code, shortlink, error }, i) => (
              <li
                key={i}
                style={{
                  marginBottom: 10,
                  padding: 10,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 5,
                  wordBreak: "break-all",
                }}
              >
                <strong>Original URL:</strong> {url}
                <br />
                {error ? (
                  <span style={{ color: "red" }}>Error: {error}</span>
                ) : (
                  <>
                    <strong>Shortlink:</strong>{" "}
                    <a href={shortlink} target="_blank" rel="noopener noreferrer">
                      {shortlink}
                    </a>{" "}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shortlink);
                        alert("Copied to clipboard!");
                      }}
                      style={{
                        marginLeft: 10,
                        padding: "4px 8px",
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      Copy
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
