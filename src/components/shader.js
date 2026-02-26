export function heroShader() {
    const canvas = document.getElementById('shader-canvas');
    const gl = canvas.getContext('webgl');

    // Track mouse position
    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener('mousemove', (e) => {
        // Normalize mouse to 0.0 - 1.0 range
        mouseX = e.clientX / window.innerWidth;
        mouseY = 1.0 - (e.clientY / window.innerHeight);
    });

    const vertexSource = `
        attribute vec2 position;
        void main() {
            gl_Position = vec4(position, 0.0, 1.0);
        }
    `;

    const fragmentSource = `
        precision highp float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse; // New Uniform

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                       mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }

        float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
            for (int i = 0; i < 5; ++i) {
                v += a * noise(p);
                p = rot * p * 2.1;
                a *= 0.45;
            }
            return v;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            vec2 uv = st * 2.0 - 1.0;
            uv.x *= u_resolution.x / u_resolution.y;

            float t = u_time * 0.15;
            
            // Mouse offset logic: subtle influence
            // We multiply by a small factor like 0.1 so it doesn't jump around
            vec2 mouseOffset = (u_mouse - 0.5) * 0.25;

            // Layer 1: Slow Background (Less mouse influence)
            vec2 p1 = uv * 1.5;
            p1.y -= t * 0.2;
            p1 += mouseOffset * 0.5; 
            float fog1 = fbm(p1 + fbm(p1 + t));

            // Layer 2: Faster Foreground (More mouse influence = Parallax)
            vec2 p2 = uv * 3.0;
            p2.y -= t * 0.5;
            p2.x += sin(t * 0.5) * 0.2;
            p2 += mouseOffset * 1.2; 
            float fog2 = fbm(p2 + fbm(p2 - t));

            float finalFog = mix(fog1, fog2, 0.4);
            finalFog = pow(finalFog, 1.8) * 1.5;

            vec3 color = mix(vec3(0.01), vec3(0.18), finalFog);
            color += smoothstep(0.7, 1.0, finalFog) * 0.05;

            // Edge Fading
            float bottomFade = smoothstep(0.0, 0.4, st.y);
            float sideFade = smoothstep(0.0, 0.2, st.x) * smoothstep(1.0, 0.8, st.x);
            
            gl_FragColor = vec4(color * bottomFade * sideFade, 1.0);
        }
    `;

    // --- SETUP & RENDER ---
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    // ... (Buffer and attribute setup same as before)
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    // Smooth mouse damping variables
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;

    function render(time) {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        // Damping: This makes the mouse movement feel "heavy" and smooth
        // instead of robotic and snappy.
        currentMouseX += (mouseX - currentMouseX) * 0.05;
        currentMouseY += (mouseY - currentMouseY) * 0.05;

        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform2f(resLoc, canvas.width, canvas.height);
        gl.uniform2f(mouseLoc, currentMouseX, currentMouseY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}