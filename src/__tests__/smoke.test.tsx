import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Smoke Test', () => {
    it('renders the landing page', () => {
        render(<Home />)
        expect(screen.getByText(/Personajes/i)).toBeInTheDocument()
        expect(screen.getByText(/Jugar ahora/i)).toBeInTheDocument()
    })
})
