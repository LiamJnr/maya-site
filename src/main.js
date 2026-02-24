import { heroShader } from "./components/shader.js"
import { parallaxSlide, fluidStack } from "./components/animations.js"

document.addEventListener('DOMContentLoaded', () => {

    // hero parallax effects
    parallaxSlide()

    // fluid stack transitions
    fluidStack()
})