import React, { useState } from "react";
import ReactDOM from "react-dom";
import CryptoJS from "crypto-js";
import "./style.css";

const SECRET_KEY = "YourSecretKey123!"; // Ganti dengan key amanmu

function encryptAES(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function generateSafeLink(encrypted) {
  // Ganti domain safelinkmu sesuai kebutuhan
  return `https://your-safelink-domain.com/redirect.html?data=${encodeURIComponent(encrypted)}`;
}

function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = () => {
    setError("");
    const links = input
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (links.length === 0) {
      setError("Please enter at least one link.");
      setOutput("");
      return;
    }
    if (links.length > 100) {
      setError("Maximum 100 links allowed.");
      setOutput("");
      return;
    }

    try {
      const encryptedLinks = links.map((link) => {
        const encrypted = encryptAES(link);
        return generateSafeLink(encrypted);
      });
      setOutput(encryptedLinks.join("\n"));
    } catch (e) {
      setError("Encryption error. Please try again.");
      setOutput("");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output).then(() => {
      alert("Copied to clipboard!");
    });
  };

  return (
    <>
      <h1>Safelink Generator</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
      >
        <textarea
          placeholder="Enter your URLs here, one per line (max 100)..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck="false"
        />
        <button type="submit">Generate Safelink(s)</button>
      </form>
      {error && <div className="error">{error}</div>}
      <pre id="output">{output}</pre>
      {output && (
        <button id="copyBtn" onClick={handleCopy}>
          Copy All Links
        </button>
      )}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
