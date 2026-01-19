import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={siteConfig.title}
      description="Data to Decisions: AI in Healthcare"
    >
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "3rem 1.25rem" }}>
        <section style={{ textAlign: "center" }}>
          <img
            src="/img/uva-logo.png"
            alt="University of Virginia"
            style={{
              width: "min(720px, 90%)",
              height: "auto",
              margin: "0 auto 2rem",
              display: "block",
            }}
          />

          <h1 style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>
            Data to Decisions: AI in Healthcare
          </h1>

          <p style={{ fontSize: "1.15rem", lineHeight: 1.6, maxWidth: 760, margin: "0 auto 2rem" }}>
  We are pleased to welcome you to this course.
  This course is designed to help future clinicians develop a clear, working understanding
  of how modern data science and artificial intelligence methods are used to support
  clinical decision-making. Rather than treating AI as a black box, we will focus on
  building intuition for core concepts by grounding them in real clinical problems and
  practical examples drawn from healthcare settings.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "1.5rem",
            }}
          >
            <Link
              className="button button--primary button--lg"
              to="/docs/schedule"
            >
              View Schedule
            </Link>

            <Link
              className="button button--secondary button--lg"
              to="/docs/lectures/intro"
            >
              Go to Sessions
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
