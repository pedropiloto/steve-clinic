import React from "react";
import { render, cleanup } from "react-testing-library";
import { BrowserRouter as Router } from "react-router-dom";
import HealthData from "./health-data.component";

describe("Health Data", () => {
  afterAll(cleanup);

  const { container } = render(
    <Router>
      <HealthData />
    </Router>
  );

  test("App renders without crashing", () => {
    expect(container).toBeTruthy();
  });
});
