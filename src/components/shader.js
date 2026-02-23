export function heroShader() {

    const canvas = document.getElementById('shader-canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
    }

    const vsSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

    const fsSource = `
    precision highp float;
    uniform vec3 iResolution;
    uniform float iTime;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
        for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p = rot * p * 2.0;
            a *= 0.5;
        }
        return v;
    }

    vec2 flow(vec2 p) {
        float e = 0.001;
        float n1 = fbm(p + vec2(0.0, e));
        float n2 = fbm(p - vec2(0.0, e));
        float n3 = fbm(p + vec2(e, 0.0));
        float n4 = fbm(p - vec2(e, 0.0));
        return vec2(n1 - n2, n4 - n3);
    }

    vec3 bioluminescentPalette(float t) {
        vec3 deepBase = vec3(0.02, 0.02, 0.07);
        vec3 cyan = vec3(0.0, 0.85, 1.0);
        vec3 teal = vec3(0.0, 0.6, 0.7);
        vec3 violet = vec3(0.4, 0.2, 0.8);
        vec3 col = mix(teal, cyan, smoothstep(0.3, 0.8, t));
        col = mix(col, violet, smoothstep(0.75, 1.0, t) * 0.3);
        return col + deepBase * 0.2;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        float time = iTime * 0.15;
        vec2 p = uv * 1.2;

        vec2 f1 = flow(p * 0.6 + time);
        p += f1 * 0.6;

        vec2 f2 = flow(p * 1.4 - time * 0.7);
        p += f2 * 0.3;

        float structure = fbm(p * 1.8);
        float veins = smoothstep(0.6, 0.9, structure);
        float glowMask = pow(veins, 3.0);
        float micro = fbm(p * 4.0 + time * 0.3) * 0.15;
        glowMask += micro * veins;

        vec3 glowColor = bioluminescentPalette(glowMask);
        float diffusion = smoothstep(0.0, 1.0, structure) * 0.4;

        vec3 color = glowColor * glowMask * 2.2;
        color += glowColor * diffusion * 0.5;
        color *= smoothstep(0.15, 0.8, structure);

        float vignette = 1.0 - dot(uv, uv) * 0.8;
        vignette = clamp(vignette, 0.0, 1.0);
        color *= vignette;

        float depthFade = smoothstep(1.2, 0.2, length(uv));
        color *= depthFade;

        color += pow(glowMask, 6.0) * 0.8;
        color = pow(color, vec3(0.85));

        gl_FragColor = vec4(color, 1.0);
    }
`;

    // Standard WebGL Boilerplate
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "iTime");
    const resLoc = gl.getUniformLocation(program, "iResolution");

    function render(time) {
        // Handle High DPI Displays
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        gl.uniform1f(timeLoc, time * 0.001);
        gl.uniform3f(resLoc, canvas.width, canvas.height, 1.0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}