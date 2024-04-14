const vertexShaderSourceCode =`
    precision mediump float;

    attribute vec2 position;
    attribute vec3 color;
    varying vec3 vColor;
    uniform mat4 u_TranslateMatrix;
    void main() {
        vColor = color;
        gl_Position = u_TranslateMatrix * vec4(position, 1, 1);
        gl_PointSize = 20.0;
    }
`;
const fragmentShaderSourceCode =`
    precision mediump float;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1);
    }
`;

export {vertexShaderSourceCode, fragmentShaderSourceCode}