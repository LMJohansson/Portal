import { expect, test } from '@rstest/core'
import { render, screen } from '@testing-library/react'
import HomePage from '../src/pages/HomePage'

test('renders the hero heading', () => {
  render(<HomePage />)
  expect(
    screen.getByRole('heading', { name: /Pluggable Micro-Frontend Architecture/i }),
  ).toBeInTheDocument()
})

test('renders the feature cards', () => {
  render(<HomePage />)
  expect(screen.getByText('OIDC Auth')).toBeInTheDocument()
  expect(screen.getByText('Quarkus Backend')).toBeInTheDocument()
})
