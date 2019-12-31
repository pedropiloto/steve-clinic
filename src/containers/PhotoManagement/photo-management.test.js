import React from 'react';
import { render, cleanup } from 'react-testing-library';
import { BrowserRouter as Router } from 'react-router-dom';
import PhotoManagement from './photo-management.component';

describe('Photo Management', () => {
  afterAll(cleanup);

  const { container } = render(
    <Router>
      <PhotoManagement />
    </Router>
  );

  test('App renders without crashing', () => {
    expect(container).toBeTruthy();
  });
});
