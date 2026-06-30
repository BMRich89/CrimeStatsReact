import React from "react";
import { CrimePostcodeSearch } from "./CrimePostcodeSearch";

export const HomePage: React.FC = () => {
  return (
    <div style={styles.page}>
      <section style={styles.heroShell}>
        <div style={styles.hero}>
          <h1 style={styles.title}>Explore Your Area</h1>
          <p style={styles.subtitle}>Instant neighbourhood insights across the UK.</p>
          <p style={styles.heroCopy}>
            Search a postcode to see crimes plotted on the map, then use the list and filters to narrow the results.
          </p>
        </div>
      </section>

      <section style={styles.searchShell}>
        <CrimePostcodeSearch />
      </section>

      {/* Feature Preview */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>What you&apos;ll get</h2>
        <div style={styles.featureGrid}>
          <FeatureCard
            title="Crime Overview"
            description="Recent incidents within a 30‑mile radius."
          />
          <FeatureCard
            title="Schools & Ratings"
            description="Ofsted reports and nearby education options."
          />
          <FeatureCard
            title="Transport Links"
            description="Stations, routes, commute times."
          />
          <FeatureCard
            title="Local Amenities"
            description="GPs, parks, shops, gyms, and more."
          />
        </div>
      </section>

      {/* Example Output */}
      <section style={styles.example}>
        <h2 style={styles.sectionTitle}>Example Summary</h2>
        <div style={styles.exampleBox}>
          <p><strong>Postcode:</strong> SW1A 1AA</p>
          <p><strong>Crime trend:</strong> ↓ 12%</p>
          <p><strong>Nearest station:</strong> St James’s Park</p>
          <p><strong>Outstanding schools:</strong> 2</p>
          <p><strong>Average house price:</strong> £520k</p>
        </div>
      </section>

      {/* Mission Statement */}
      <section style={styles.mission}>
        <p>
          LocalScope gives you a clear, factual snapshot of any UK neighbourhood.
          Whether you&apos;re moving, comparing areas, or just curious, we help you
          understand what&apos;s around you — instantly.
        </p>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Data sources: Police API, ONS, Ofsted, Environment Agency</p>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => (
  <div style={styles.featureCard}>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{description}</p>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  page: {
    fontFamily: "system-ui, sans-serif",
    padding: "2rem 1rem 3rem",
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  heroShell: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  hero: {
    width: "100%",
    maxWidth: "900px",
    textAlign: "center",
    marginBottom: "3rem",
  },
  title: {
    fontSize: "2.5rem",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#555",
    marginBottom: "1.5rem",
  },
  heroCopy: {
    fontSize: "1rem",
    color: "#666",
    margin: "0 auto",
    maxWidth: "48rem",
  },
  searchShell: {
    width: "100%",
  },
  features: {
    marginBottom: "3rem",
    width: "100%",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1rem",
  },
  featureCard: {
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #eee",
    backgroundColor: "#fafafa",
  },
  featureTitle: {
    marginBottom: "0.5rem",
  },
  featureDesc: {
    color: "#555",
  },
  example: {
    marginBottom: "3rem",
    width: "100%",
  },
  exampleBox: {
    padding: "1rem",
    borderRadius: "8px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
  },
  mission: {
    marginBottom: "3rem",
    fontSize: "1.1rem",
    color: "#444",
    textAlign: "center",
  },
  footer: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "#666",
    marginTop: "2rem",
  },
};
