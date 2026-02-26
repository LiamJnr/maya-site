import { heroShader } from "./components/shader.js"
import { parallaxSlide, fluidStack } from "./components/animations.js"
import { spreadCards } from "./components/spreadCards.js"

document.addEventListener('DOMContentLoaded', () => {

    // heroShader()

    // hero parallax effects
    parallaxSlide()

    // fluid stack transitions
    fluidStack()

    // spread cards component
    spreadCards()
})