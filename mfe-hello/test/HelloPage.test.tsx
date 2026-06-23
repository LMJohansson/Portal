import { expect, test } from '@rstest/core'
import { render, screen } from '@testing-library/react'
import HelloPage from '../src/pages/HelloPage'

test('renders the hero heading', () => {
  render(<HelloPage />)
  expect(
    screen.getByRole('heading', { name: /Hello from mfe-hello!/i }),
  ).toBeInTheDocument()
})

test('renders the Module Federation info card', () => {
  render(<HelloPage />)
  expect(screen.getByText('Module Federation')).toBeInTheDocument()
})
