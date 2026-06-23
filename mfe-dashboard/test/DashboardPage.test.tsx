import { expect, test } from '@rstest/core'
import { render, screen } from '@testing-library/react'
import DashboardPage from '../src/pages/DashboardPage'

test('renders the page heading', () => {
  render(<DashboardPage />)
  expect(
    screen.getByRole('heading', { name: /Analytics Dashboard/i }),
  ).toBeInTheDocument()
})

test('renders a stat card with its value', () => {
  render(<DashboardPage />)
  expect(screen.getByText('Total Revenue')).toBeInTheDocument()
  expect(screen.getByText('$84,320')).toBeInTheDocument()
})
